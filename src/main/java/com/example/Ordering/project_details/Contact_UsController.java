package com.example.Ordering.project_details;

import com.example.Ordering.map.MAP;
import com.example.Ordering.user.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.swing.plaf.basic.BasicInternalFrameTitlePane;
import java.util.Optional;

@RequestMapping("/api/contact")
@RestController
@AllArgsConstructor
public class Contact_UsController {
    private final AdminRepository adminRepository;
    private final ContactUsRepository contactUsRepository;

    @PostMapping("add")
    private ResponseEntity<?> addContactDetails(@RequestParam Long adminid , @RequestBody ContactUsRequestDTO contactUs){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        contactUsRepository.save(MAP.map(contactUs,Contact_Us::new));
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }



    @GetMapping("getall/")
    private ResponseEntity<?> addContactDetails(@RequestParam Long adminid){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(contactUsRepository.findAll().stream().map(t->MAP.map(t,ContactUsResponseDTO::new)));
    }


    @PatchMapping("update")
    private ResponseEntity<?> update(@RequestParam  Long adminid,@RequestParam  int id,@RequestBody ContactUsRequestDTO contactUsRequestDTO){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        Optional<Contact_Us> byId1 = contactUsRepository.findById(id);
        if(byId1.isEmpty()){
            return  ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        MAP.copyInTheObject(contactUsRequestDTO,byId1.get());
        contactUsRepository.save(byId1.get());
        return ResponseEntity.ok(HttpStatus.ACCEPTED);
    }

    @DeleteMapping("delete")
    private ResponseEntity<?> delete(@RequestParam Long adminid,@RequestParam  int id){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        contactUsRepository.deleteById(id);
        return ResponseEntity.ok(HttpStatus.ACCEPTED);
    }

}
