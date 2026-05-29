import { mockBlogs } from '../../data/mockBlogs'

function BlogManagementPage() {
  return (
    <>
      <h1 className="page-title">Quản lý bài viết</h1>
      <div className="table-like">
        {mockBlogs.map((blog) => (
          <div className="table-row" key={blog.id}>
            <strong>{blog.title}</strong>
            <span className="muted">{blog.summary}</span>
            <span>Bản nháp</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default BlogManagementPage
