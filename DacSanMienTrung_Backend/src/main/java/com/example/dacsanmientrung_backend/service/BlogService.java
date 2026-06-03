package com.example.dacsanmientrung_backend.service;

import com.example.dacsanmientrung_backend.dto.request.BlogRequest;
import com.example.dacsanmientrung_backend.dto.response.BlogDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.BlogResponse;

import java.util.List;

public interface BlogService {

    List<BlogResponse> getPublicBlogs(String keyword, String topic, String province);

    BlogDetailResponse getBlogById(Integer maBlog);

    List<BlogResponse> getBlogsByTopic(String chuDe);

    List<BlogResponse> getBlogsByProvince(String tenTinh);

    List<BlogResponse> getAllBlogsForAdmin();

    BlogDetailResponse createBlog(BlogRequest request);

    BlogDetailResponse updateBlog(Integer maBlog, BlogRequest request);

    BlogDetailResponse hideBlog(Integer maBlog);

    BlogDetailResponse publishBlog(Integer maBlog);

    BlogDetailResponse deleteBlog(Integer maBlog);
}
