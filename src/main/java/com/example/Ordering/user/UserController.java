package com.example.Ordering.user;

import com.example.Ordering.map.MAP;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController("/api")
@AllArgsConstructor
public class UserController {

    private UserRepository userRepository;
        private AdminRepository adminRepository;
    @RequestMapping("register")
    public ResponseEntity<?> register(@RequestBody  UserRequestDTO dto){
        if(dto.getEmail().matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")) {
           User user = MAP.map(dto,User::new);
            User save = userRepository.save(user);
            if(dto.getRole().equals(Role.ADMIN)){
                Admin admin = MAP.map(save,Admin::new);
                adminRepository.save(admin);
            }
            UserResponseDTO userResponseDTO=  MAP.map(dto,UserResponseDTO::new);
            return ResponseEntity.ok(userResponseDTO);
        }else return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @RequestMapping("login")
    public ResponseEntity<?> login(@RequestBody  UserRequestDTO dto) {

        Optional<User> byEmail = userRepository.findByEmail(dto.getEmail());
        if(byEmail.isEmpty()){
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        User u = byEmail.get();
        if(!u.getPassword().equals(dto.getPassword())){
          return new ResponseEntity<>(HttpStatus.BAD_GATEWAY);
        }return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }


    @RequestMapping("forget/email")
    private ResponseEntity<?> existEmail(UserRequestDTO dto){
    if(userRepository.findByEmail(dto.getEmail()).isPresent()){
        return ResponseEntity.ok().build();
    }return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @RequestMapping("forget/password")
    private ResponseEntity<?> forgetPass(UserRequestDTO dto){
        Optional<User> user =userRepository.findByEmail(dto.getEmail());
        if(user.isEmpty()){
            User user1 = user.get();
            user1.setPassword(dto.getPassword());
                userRepository.save(user1);
                return ResponseEntity.ok(MAP.map(user1,UserRequestDTO::new));
        }return ResponseEntity.status(HttpStatus.CONFLICT).body("You have entered wrong details try again later");
    }

}
