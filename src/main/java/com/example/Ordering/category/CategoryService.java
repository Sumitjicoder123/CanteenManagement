package com.example.Ordering.category;

import com.example.Ordering.menu.MenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final MenuRepository menuRepository;

    public CategoryService(CategoryRepository categoryRepository, MenuRepository menuRepository) {
        this.categoryRepository = categoryRepository;
        this.menuRepository = menuRepository;
    }

    public CategoryResponseDto createCategory(CategoryRequestDto category) {
        Category newCategory = mapToEntity(category);
        if (newCategory.getId() == null) {
            newCategory.setId(categoryRepository.findMaxId() + 1);
        }
        if (newCategory.getActive() == null) {
            newCategory.setActive(true);
        }
        Category newCat = categoryRepository.save(newCategory);
        return mapToDto(newCat);
    }

    public List<CategoryResponseDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponseDto> cats = new ArrayList<>();
        for (Category c : categories) {
            cats.add(mapToDto(c));
        }
        return cats;
    }

    public CategoryResponseDto getCategoryById(Long id) {
        Category cat = categoryRepository.findById(id).orElseThrow();
        return mapToDto(cat);
    }

    @Transactional
    public void deleteCategoryById(Long id) {
        menuRepository.unlinkCategoryFromMenus(id);
        categoryRepository.deleteById(id);
    }

    public CategoryUpdateResponseDto updateCategory(CategoryUpdateRequestDto categoryUpdateRequestDto, Long id) {
        Category c = categoryRepository.findById(id).orElseThrow();
        if (categoryUpdateRequestDto.getName() != null) c.setName(categoryUpdateRequestDto.getName());
        if (categoryUpdateRequestDto.getDescription() != null) c.setDescription(categoryUpdateRequestDto.getDescription());
        if (categoryUpdateRequestDto.getImageUrl() != null) c.setImageUrl(categoryUpdateRequestDto.getImageUrl());
        Category cat = categoryRepository.save(c);
        return mapToUpdateDto(cat);
    }

    private CategoryResponseDto mapToDto(Category newCategory) {
        CategoryResponseDto catResponse = new CategoryResponseDto();
        catResponse.setId(newCategory.getId());
        catResponse.setName(newCategory.getName());
        catResponse.setDescription(newCategory.getDescription());
        catResponse.setImageUrl(newCategory.getImageUrl());
        return catResponse;
    }

    private Category mapToEntity(CategoryRequestDto categoryRequestDto) {
        Category newCat = new Category();
        newCat.setName(categoryRequestDto.getName());
        newCat.setDescription(categoryRequestDto.getDescription());
        newCat.setImageUrl(categoryRequestDto.getImageUrl());
        return newCat;
    }

    private CategoryUpdateResponseDto mapToUpdateDto(Category c) {
        CategoryUpdateResponseDto cat = new CategoryUpdateResponseDto();
        cat.setId(c.getId());
        cat.setName(c.getName());
        cat.setDescription(c.getDescription());
        cat.setImageUrl(c.getImageUrl());
        cat.setUpdatedAt(LocalDateTime.now());
        return cat;
    }
}
