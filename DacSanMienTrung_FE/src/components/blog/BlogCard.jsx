import { Link } from 'react-router-dom'
import { getImageUrl, handleImageError } from '../../utils/imageUtils'

function BlogCard({ blog }) {
  const blogImage = blog.hinhAnh || blog.image

  return (
    <article className="blog-card">
      <Link className="blog-media" to={`/blogs/${blog.slug || blog.id}`}>
        <img src={getImageUrl(blogImage)} alt={blog.title || 'Blog'} onError={handleImageError} />
      </Link>
      <div className="blog-body">
        <div className="blog-meta">
          <span className="blog-tag">{blog.topic || 'Ẩm thực'}</span>
          <small>{blog.province || 'Miền Trung'}</small>
        </div>
        <h3>{blog.title}</h3>
        <p className="muted">{blog.description || blog.summary}</p>
        <div className="blog-footer">
          <time>{blog.publishedDate}</time>
          <Link className="read-more" to={`/blogs/${blog.slug || blog.id}`}>
            Đọc tiếp
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
