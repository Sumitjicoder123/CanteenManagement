package com.example.Ordering.project_details;


import com.example.Ordering.map.MAP;
import com.example.Ordering.user.Admin;
import com.example.Ordering.user.AdminRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/privacy")
@AllArgsConstructor
public class Terms_ConditionController {
    private final TermsConditionRepository privacyPolicyRepository;
    private final AdminRepository adminRepository;
    @PostMapping("add")
    private ResponseEntity<?> add(@RequestParam Long id,@RequestBody TermsConditionRequestDTO termsConditionRequestDTO){
        Optional<Admin> byId = adminRepository.findById(id);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(MAP.map(privacyPolicyRepository.save(MAP.map(termsConditionRequestDTO,Terms_Condition::new)),PrivacyPolicyResponseDTO::new));
    }
    @GetMapping("getall")
    private ResponseEntity<?> getAll(@RequestParam Long id){
        Optional<Admin> byId = adminRepository.findById(id);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(privacyPolicyRepository.findAll().stream().map(t->MAP.map(t,TermsConditionRequestDTO::new)));
    }
    @DeleteMapping("delete")
    private ResponseEntity<?> delete(@RequestParam  Long adminid,@RequestParam  int id){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        privacyPolicyRepository.deleteById(id);
        return ResponseEntity.ok(HttpStatus.ACCEPTED);
    }

    @PatchMapping("update")
    private ResponseEntity<?> update(@RequestParam  Long adminid,@RequestParam  int id,@RequestBody TermsConditionRequestDTO termsConditionRequestDTO){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        Optional<Terms_Condition> byId1 = privacyPolicyRepository.findById(id);
        if(byId1.isEmpty()){
            return  ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        MAP.copyInTheObject(termsConditionRequestDTO,byId1.get());
        privacyPolicyRepository.save(byId1.get());
        return ResponseEntity.ok(HttpStatus.ACCEPTED);
    }


}
