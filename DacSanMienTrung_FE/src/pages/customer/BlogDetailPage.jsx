import { Link, useParams } from 'react-router-dom'
import BlogCard from '../../components/blog/BlogCard'
import ProductCard from '../../components/product/ProductCard'
import { mockBlogs } from '../../data/mockBlogs'
import { mockProducts } from '../../data/mockProducts'

function BlogDetailPage() {
  const { id } = useParams()
  const blog = mockBlogs.find((item) => item.id === id || item.slug === id)

  if (!blog) {
    return (
      <section className="page-card">
        <h1 className="page-title">Không tìm thấy bài viết</h1>
        <Link className="button" to="/blogs">
          Quay lại blog
        </Link>
      </section>
    )
  }

  const relatedProducts = mockProducts.filter((product) => blog.relatedProductIds.includes(product.id))
  const relatedBlogs = mockBlogs.filter((item) => item.id !== blog.id && item.topic === blog.topic).slice(0, 3)

  return (
    <div className="blog-detail-page">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/blogs">Blog</Link>
        <span>›</span>
        <strong>{blog.title}</strong>
      </nav>

      <article className="blog-detail-article">
        <div className="blog-detail-image">
          <span>{blog.image}</span>
        </div>
        <div className="blog-detail-content">
          <div className="blog-detail-meta">
            <span>{blog.topic}</span>
            <span>{blog.province}</span>
            <time>{blog.publishedDate}</time>
            <span>{blog.author}</span>
          </div>
          <h1>{blog.title}</h1>
          <p className="blog-detail-description">{blog.description}</p>
          <p>{blog.content}</p>
          <Link className="button secondary" to="/blogs">
            Quay lại danh sách blog
          </Link>
        </div>
      </article>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <div className="section-heading centered">
            <span>Sản phẩm liên quan</span>
            <h2>Đặc sản trong bài viết</h2>
          </div>
          <div className="product-grid">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {relatedBlogs.length > 0 && (
        <section className="related-blogs">
          <div className="section-heading centered">
            <span>Cùng chủ đề</span>
            <h2>Bài viết liên quan</h2>
          </div>
          <div className="blog-grid">
            {relatedBlogs.map((relatedBlog) => (
              <BlogCard key={relatedBlog.id} blog={relatedBlog} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default BlogDetailPage
