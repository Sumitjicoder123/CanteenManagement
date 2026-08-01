package com.example.Ordering.project_details;

import com.example.Ordering.map.MAP;
import com.example.Ordering.user.Admin;
import com.example.Ordering.user.AdminRepository;
import lombok.AllArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/privacy")
@AllArgsConstructor
public class PrivacyPolicyController {
    private final PrivacyPolicyRepository privacyPolicyRepository;
    private final AdminRepository adminRepository;
    @PostMapping("add")
    private ResponseEntity<?> add(@RequestParam Long adminid,@RequestBody PrivacyPolicyRequestDTO privacyPolicyRequestDTO){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(MAP.map(privacyPolicyRepository.save(MAP.map(privacyPolicyRequestDTO,Privacy_policy::new)),PrivacyPolicyResponseDTO::new));
    }


    @GetMapping("getall")
    private ResponseEntity<?> getAll(@RequestParam("adminid") Long adminid){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(privacyPolicyRepository.findAll().stream().map(t->MAP.map(t,PrivacyPolicyResponseDTO::new)));
    }

    @PatchMapping("update")
    private ResponseEntity<?> update(@RequestParam  Long adminid,@RequestParam  Long id,@RequestBody TermsConditionRequestDTO termsConditionRequestDTO){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        Optional<Privacy_policy> byId1 = privacyPolicyRepository.findById(id);
        if(byId1.isEmpty()){
            return  ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        MAP.copyInTheObject(termsConditionRequestDTO,byId1.get());
        privacyPolicyRepository.save(byId1.get());
        return ResponseEntity.ok(HttpStatus.ACCEPTED);
    }

    @DeleteMapping("delete")
    private ResponseEntity<?> delete(@RequestParam Long adminid,@RequestParam  Long id){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }
        privacyPolicyRepository.deleteById(id);
        return ResponseEntity.ok(HttpStatus.ACCEPTED);
    }
}

