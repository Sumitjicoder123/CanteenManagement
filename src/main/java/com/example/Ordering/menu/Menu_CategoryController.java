package com.example.Ordering.menu;

import com.example.Ordering.map.MAP;
import com.example.Ordering.user.Admin;
import com.example.Ordering.user.AdminRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("menu")
@AllArgsConstructor
public class Menu_CategoryController {
    private final AdminRepository adminRepository;
    private final Menu_CategoryRepository menuCategoryRepository;
    private final MenuRepository menuRepository;
    @GetMapping("all/Category_name")
    private ResponseEntity<?> getAllCategory(){
        return ResponseEntity.ok(menuCategoryRepository.findAll().stream().map(Menu_Category::getCateogry_name));
    }

    @GetMapping("all/Category_product")
    private ResponseEntity<?> getAllCategoryProduct(){
        return ResponseEntity.ok(menuCategoryRepository.findAll().stream().map(Menu_Category::getCateogry_name));
    }

    @PostMapping("addProduct")
    private ResponseEntity<?> addProduct(@RequestParam Long adminid, @RequestBody MenuRequestDTO menu){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }

        String categoryName = menu.getCategory_name();
       Menu menu1= MAP.map(menu,Menu::new);
           Menu_Category menuCategory1 = new Menu_Category();
           menuCategory1.setCateogry_name(categoryName);
           menu1.setMenuCategory(menuCategory1);
           menu1.setLast_update(LocalDateTime.now());
           menuRepository.save(menu1);
           return ResponseEntity.ok("successfully you have added");
    }

    @PatchMapping("updateProduct")
    private ResponseEntity<?> updateProduct(@RequestParam Long adminid,@RequestParam int id, @RequestBody MenuRequestDTO menu){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }

        Optional<Menu> menu1 = menuRepository.findById(id);
        if(menu1.isEmpty()){
            return ResponseEntity.ok(HttpStatus.BAD_REQUEST);
        }
        Menu menu2 = menu1.get();
        MAP.copyInTheObject(menu,menu2);
        menu2.setLast_update(LocalDateTime.now());
        menuRepository.save(menu2);
        return ResponseEntity.ok("successfully you have added");
    }

    @DeleteMapping("deleteProduct")
    private ResponseEntity<?> deleteProduct(@RequestParam Long adminid,@RequestParam int id){
        Optional<Admin> byId = adminRepository.findById(adminid);
        if(byId.isEmpty()){
            return ResponseEntity.ok(HttpStatus.FORBIDDEN);
        }

        Optional<Menu> menu1 = menuRepository.findById(id);
        if(menu1.isEmpty()){
            return ResponseEntity.ok(HttpStatus.BAD_REQUEST);
        }
        menuRepository.deleteById(id);
        return ResponseEntity.ok("successfully you have added");
    }

}
