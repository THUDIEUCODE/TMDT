package com.example.dacsanmientrung_backend.controller;

import com.example.dacsanmientrung_backend.dto.request.BlogRequest;
import com.example.dacsanmientrung_backend.dto.response.BlogDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.BlogResponse;
import com.example.dacsanmientrung_backend.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public List<BlogResponse> getBlogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String province
    ) {
        return blogService.getPublicBlogs(keyword, topic, province);
    }

    @GetMapping("/{maBlog}")
    public BlogDetailResponse getBlogById(@PathVariable Integer maBlog) {
        return blogService.getPublicBlogById(maBlog);
    }

    @GetMapping("/topic/{chuDe}")
    public List<BlogResponse> getBlogsByTopic(@PathVariable String chuDe) {
        return blogService.getBlogsByTopic(chuDe);
    }

    @GetMapping("/province/{tenTinh}")
    public List<BlogResponse> getBlogsByProvince(@PathVariable String tenTinh) {
        return blogService.getBlogsByProvince(tenTinh);
    }

    @GetMapping("/admin/all")
    public List<BlogResponse> getAllBlogsForAdmin() {
        return blogService.getAllBlogsForAdmin();
    }

    @PostMapping
    public BlogDetailResponse createBlog(@Valid @RequestBody BlogRequest request) {
        return blogService.createBlog(request);
    }

    @PutMapping("/{maBlog}")
    public BlogDetailResponse updateBlog(@PathVariable Integer maBlog, @Valid @RequestBody BlogRequest request) {
        return blogService.updateBlog(maBlog, request);
    }

    @PutMapping("/{maBlog}/hide")
    public BlogDetailResponse hideBlog(@PathVariable Integer maBlog) {
        return blogService.hideBlog(maBlog);
    }

    @PutMapping("/{maBlog}/publish")
    public BlogDetailResponse publishBlog(@PathVariable Integer maBlog) {
        return blogService.publishBlog(maBlog);
    }

    @DeleteMapping("/{maBlog}")
    public BlogDetailResponse deleteBlog(@PathVariable Integer maBlog) {
        return blogService.deleteBlog(maBlog);
    }
}
