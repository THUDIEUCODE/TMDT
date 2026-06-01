package com.example.dacsanmientrung_backend.service.impl;

import com.example.dacsanmientrung_backend.dto.request.BlogRequest;
import com.example.dacsanmientrung_backend.dto.response.BlogDetailResponse;
import com.example.dacsanmientrung_backend.dto.response.BlogProductResponse;
import com.example.dacsanmientrung_backend.dto.response.BlogResponse;
import com.example.dacsanmientrung_backend.entity.BlogAmThuc;
import com.example.dacsanmientrung_backend.entity.BlogSanPham;
import com.example.dacsanmientrung_backend.entity.NguoiDung;
import com.example.dacsanmientrung_backend.entity.SanPham;
import com.example.dacsanmientrung_backend.exception.BadRequestException;
import com.example.dacsanmientrung_backend.exception.ResourceNotFoundException;
import com.example.dacsanmientrung_backend.repository.BlogAmThucRepository;
import com.example.dacsanmientrung_backend.repository.BlogSanPhamRepository;
import com.example.dacsanmientrung_backend.repository.NguoiDungRepository;
import com.example.dacsanmientrung_backend.repository.SanPhamRepository;
import com.example.dacsanmientrung_backend.service.BlogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class BlogServiceImpl implements BlogService {

    private final BlogAmThucRepository blogAmThucRepository;
    private final BlogSanPhamRepository blogSanPhamRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final SanPhamRepository sanPhamRepository;

    public BlogServiceImpl(
            BlogAmThucRepository blogAmThucRepository,
            BlogSanPhamRepository blogSanPhamRepository,
            NguoiDungRepository nguoiDungRepository,
            SanPhamRepository sanPhamRepository
    ) {
        this.blogAmThucRepository = blogAmThucRepository;
        this.blogSanPhamRepository = blogSanPhamRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.sanPhamRepository = sanPhamRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> getPublicBlogs(String keyword, String topic, String province) {
        return blogAmThucRepository.findByTrangThaiTrueOrderByNgayDangDesc()
                .stream()
                .filter(blog -> matchesKeyword(blog, keyword))
                .filter(blog -> matchesTopic(blog, topic))
                .filter(blog -> matchesProvince(blog, province))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BlogDetailResponse getPublicBlogById(Integer maBlog) {
        BlogAmThuc blog = blogAmThucRepository.findByMaBlogAndTrangThaiTrue(maBlog)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy blog với mã: " + maBlog));
        return toDetailResponse(blog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> getBlogsByTopic(String chuDe) {
        return blogAmThucRepository.findByChuDeAndTrangThaiTrueOrderByNgayDangDesc(chuDe)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> getBlogsByProvince(String tenTinh) {
        return blogAmThucRepository.findByTenTinhAndTrangThaiTrueOrderByNgayDangDesc(tenTinh)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogResponse> getAllBlogsForAdmin() {
        return blogAmThucRepository.findAllByOrderByNgayDangDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BlogDetailResponse createBlog(BlogRequest request) {
        NguoiDung tacGia = getAuthor(request.getMaTacGia());

        BlogAmThuc blog = new BlogAmThuc();
        blog.setTacGia(tacGia);
        applyRequest(blog, request);
        blog.setNgayDang(LocalDateTime.now());
        blog.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : true);

        BlogAmThuc savedBlog = blogAmThucRepository.save(blog);
        replaceRelatedProducts(savedBlog, request.getRelatedProductIds());
        return toDetailResponse(savedBlog);
    }

    @Override
    @Transactional
    public BlogDetailResponse updateBlog(Integer maBlog, BlogRequest request) {
        BlogAmThuc blog = getBlog(maBlog);
        blog.setTacGia(getAuthor(request.getMaTacGia()));
        applyRequest(blog, request);
        if (request.getTrangThai() != null) {
            blog.setTrangThai(request.getTrangThai());
        }

        BlogAmThuc savedBlog = blogAmThucRepository.save(blog);
        if (request.getRelatedProductIds() != null) {
            replaceRelatedProducts(savedBlog, request.getRelatedProductIds());
        }
        return toDetailResponse(savedBlog);
    }

    @Override
    @Transactional
    public BlogDetailResponse hideBlog(Integer maBlog) {
        BlogAmThuc blog = getBlog(maBlog);
        blog.setTrangThai(false);
        return toDetailResponse(blogAmThucRepository.save(blog));
    }

    @Override
    @Transactional
    public BlogDetailResponse publishBlog(Integer maBlog) {
        BlogAmThuc blog = getBlog(maBlog);
        blog.setTrangThai(true);
        return toDetailResponse(blogAmThucRepository.save(blog));
    }

    @Override
    @Transactional
    public BlogDetailResponse deleteBlog(Integer maBlog) {
        BlogAmThuc blog = getBlog(maBlog);
        blog.setTrangThai(false);
        return toDetailResponse(blogAmThucRepository.save(blog));
    }

    private void applyRequest(BlogAmThuc blog, BlogRequest request) {
        if (request.getTieuDe() == null || request.getTieuDe().isBlank()) {
            throw new BadRequestException("Tiêu đề không được rỗng");
        }
        blog.setTieuDe(request.getTieuDe().trim());
        blog.setMoTa(request.getMoTa());
        blog.setNoiDung(request.getNoiDung());
        blog.setHinhAnh(request.getHinhAnh());
        blog.setChuDe(request.getChuDe());
        blog.setTenTinh(request.getTenTinh());
    }

    private void replaceRelatedProducts(BlogAmThuc blog, List<Integer> productIds) {
        blogSanPhamRepository.deleteByBlogAmThuc_MaBlog(blog.getMaBlog());
        blogSanPhamRepository.flush();
        if (productIds == null || productIds.isEmpty()) {
            return;
        }

        Set<Integer> uniqueProductIds = new LinkedHashSet<>(productIds);
        for (Integer productId : uniqueProductIds) {
            SanPham product = sanPhamRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với mã: " + productId));

            BlogSanPham blogSanPham = new BlogSanPham();
            blogSanPham.setBlogAmThuc(blog);
            blogSanPham.setSanPham(product);
            blogSanPhamRepository.save(blogSanPham);
        }
    }

    private BlogResponse toResponse(BlogAmThuc blog) {
        return new BlogResponse(
                blog.getMaBlog(),
                blog.getTieuDe(),
                blog.getMoTa(),
                blog.getHinhAnh(),
                blog.getChuDe(),
                blog.getTenTinh(),
                blog.getNgayDang(),
                blog.getTrangThai(),
                blog.getTacGia().getMaNguoiDung(),
                blog.getTacGia().getHoTen()
        );
    }

    private BlogDetailResponse toDetailResponse(BlogAmThuc blog) {
        List<BlogProductResponse> relatedProducts = blogSanPhamRepository.findByBlogAmThuc_MaBlog(blog.getMaBlog())
                .stream()
                .map(BlogSanPham::getSanPham)
                .map(this::toProductResponse)
                .toList();

        return new BlogDetailResponse(
                blog.getMaBlog(),
                blog.getTieuDe(),
                blog.getMoTa(),
                blog.getHinhAnh(),
                blog.getChuDe(),
                blog.getTenTinh(),
                blog.getNgayDang(),
                blog.getTrangThai(),
                blog.getTacGia().getMaNguoiDung(),
                blog.getTacGia().getHoTen(),
                blog.getNoiDung(),
                relatedProducts
        );
    }

    private BlogProductResponse toProductResponse(SanPham product) {
        return new BlogProductResponse(
                product.getMaSanPham(),
                product.getTenSanPham(),
                product.getTenTinh(),
                product.getVungMien(),
                product.getHinhAnh(),
                product.getGiaNiemYet()
        );
    }

    private BlogAmThuc getBlog(Integer maBlog) {
        return blogAmThucRepository.findByMaBlog(maBlog)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy blog với mã: " + maBlog));
    }

    private NguoiDung getAuthor(Integer maTacGia) {
        if (maTacGia == null) {
            throw new BadRequestException("Mã tác giả không được rỗng");
        }
        return nguoiDungRepository.findById(maTacGia)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tác giả với mã: " + maTacGia));
    }

    private boolean matchesKeyword(BlogAmThuc blog, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return true;
        }
        String value = keyword.trim().toLowerCase();
        return containsIgnoreCase(blog.getTieuDe(), value) || containsIgnoreCase(blog.getMoTa(), value);
    }

    private boolean matchesTopic(BlogAmThuc blog, String topic) {
        return topic == null || topic.isBlank() || containsIgnoreCase(blog.getChuDe(), topic.trim().toLowerCase());
    }

    private boolean matchesProvince(BlogAmThuc blog, String province) {
        return province == null || province.isBlank() || containsIgnoreCase(blog.getTenTinh(), province.trim().toLowerCase());
    }

    private boolean containsIgnoreCase(String source, String value) {
        return source != null && source.toLowerCase().contains(value);
    }
}
