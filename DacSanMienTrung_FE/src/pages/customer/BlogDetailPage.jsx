import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BlogCard from '../../components/blog/BlogCard'
import ProductCard from '../../components/product/ProductCard'
import { mockBlogs } from '../../data/mockBlogs'
import { mockProducts } from '../../data/mockProducts'
import { getBlogById, mapBlogFromApi } from '../../services/blogService'
import { getProductById, mapProductFromApi } from '../../services/productService'
import { sanitizeHtmlContent } from '../../utils/htmlContent'
import { getBlogImageSource, getImageUrl, handleImageError } from '../../utils/imageUtils'

const fallbackBlogs = mockBlogs.map(mapBlogFromApi)
const fallbackProducts = mockProducts.map(mapProductFromApi)

function BlogDetailPage() {
  const { id } = useParams()
  const fallbackBlog = useMemo(
    () => fallbackBlogs.find((item) => item.id === id || item.slug === id),
    [id],
  )
  const [blog, setBlog] = useState(fallbackBlog)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadBlog = async () => {
      setIsLoading(true)

      try {
        const apiBlog = await getBlogById(id)

        if (!isMounted) return

        const nextBlog = apiBlog || fallbackBlog
        const embeddedProducts = (nextBlog?.relatedProducts || []).map(mapProductFromApi)
        const relatedProductIds = [
          ...(nextBlog?.relatedProductIds || []),
          ...embeddedProducts.map((product) => product.id),
        ].filter(Boolean)
        const uniqueProductIds = [...new Set(relatedProductIds.map((productId) => String(productId)))]
        const productDetails = await Promise.all(
          uniqueProductIds.map((productId) =>
            getProductById(productId).catch(() => embeddedProducts.find((product) => String(product.id) === productId)),
          ),
        )

        if (!isMounted) return

        setBlog(nextBlog)
        setRelatedProducts(productDetails.filter(Boolean).map(mapProductFromApi))
        setHasApiError(false)
      } catch {
        if (!isMounted) return

        setBlog(fallbackBlog)
        setRelatedProducts(
          fallbackProducts.filter((product) => fallbackBlog?.relatedProductIds?.includes(product.id)),
        )
        setHasApiError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadBlog()

    return () => {
      isMounted = false
    }
  }, [fallbackBlog, id])

  if (!blog) {
    return (
      <section className="page-card">
        <h1 className="page-title">{isLoading ? 'Đang tải bài viết...' : 'Không tìm thấy bài viết'}</h1>
        {hasApiError ? <p>Không kết nối được backend, đang dùng dữ liệu mẫu.</p> : null}
        <Link className="button" to="/blogs">
          Quay lại blog
        </Link>
      </section>
    )
  }

  const relatedBlogs = fallbackBlogs.filter((item) => item.id !== blog.id && item.topic === blog.topic).slice(0, 3)
  const blogContentHtml = sanitizeHtmlContent(blog.content)

  return (
    <div className="blog-detail-page">
      {isLoading ? <p className="product-result-summary">Đang tải bài viết...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}

      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <Link to="/blogs">Blog</Link>
        <span>›</span>
        <strong>{blog.title}</strong>
      </nav>

      <article className="blog-detail-article">
        <div className="blog-detail-image">
          <img src={getImageUrl(getBlogImageSource(blog))} alt={blog.title} onError={handleImageError} />
        </div>
        <div className="blog-detail-content">
          <div className="blog-detail-meta">
            <span>{blog.topic || 'Chủ đề'}</span>
            <span>{blog.province || 'Miền Trung'}</span>
            <time>{blog.publishedDate || blog.createdAt}</time>
            <span>{blog.author || 'Đang cập nhật'}</span>
          </div>
          <h1>{blog.title}</h1>
          <p className="blog-detail-description">{blog.description}</p>
          <div className="blog-detail-body" dangerouslySetInnerHTML={{ __html: blogContentHtml }} />
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
