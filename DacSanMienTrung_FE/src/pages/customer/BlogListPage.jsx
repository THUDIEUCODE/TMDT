import { useEffect, useMemo, useState } from 'react'
import BlogCard from '../../components/blog/BlogCard'
import { mockBlogs } from '../../data/mockBlogs'
import { getBlogs, mapBlogFromApi } from '../../services/blogService'

const fallbackBlogs = mockBlogs.map(mapBlogFromApi)

function BlogListPage() {
  const [blogs, setBlogs] = useState(fallbackBlogs)
  const [searchText, setSearchText] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [hasApiError, setHasApiError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadBlogs = async () => {
      setIsLoading(true)

      try {
        const apiBlogs = await getBlogs()

        if (!isMounted) return

        setBlogs(apiBlogs)
        setHasApiError(false)
      } catch {
        if (!isMounted) return

        setBlogs(fallbackBlogs)
        setHasApiError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadBlogs()

    return () => {
      isMounted = false
    }
  }, [])

  const topics = useMemo(() => [...new Set(blogs.map((blog) => blog.topic).filter(Boolean))].sort(), [blogs])
  const provinces = useMemo(() => [...new Set(blogs.map((blog) => blog.province).filter(Boolean))].sort(), [blogs])

  const filteredBlogs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return blogs.filter((blog) => {
      const matchesSearch =
        !keyword ||
        blog.title.toLowerCase().includes(keyword) ||
        blog.description.toLowerCase().includes(keyword) ||
        blog.province.toLowerCase().includes(keyword)
      const matchesTopic = selectedTopic === 'all' || blog.topic === selectedTopic
      const matchesProvince = selectedProvince === 'all' || blog.province === selectedProvince

      return matchesSearch && matchesTopic && matchesProvince
    })
  }, [blogs, searchText, selectedTopic, selectedProvince])

  return (
    <div className="blog-list-page">
      <section className="blog-hero">
        <span>Đi & Viết</span>
        <h1>Blog ẩm thực miền Trung</h1>
        <p>Khám phá câu chuyện văn hóa, món ngon và đặc sản từng vùng miền.</p>
      </section>

      <section className="blog-toolbar">
        <label>
          Tìm kiếm bài viết
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Nhập tên bài viết, tỉnh hoặc chủ đề..."
          />
        </label>
        <label>
          Chủ đề
          <select value={selectedTopic} onChange={(event) => setSelectedTopic(event.target.value)}>
            <option value="all">Tất cả chủ đề</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tỉnh/thành
          <select value={selectedProvince} onChange={(event) => setSelectedProvince(event.target.value)}>
            <option value="all">Tất cả tỉnh</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </label>
      </section>

      {isLoading ? <p className="product-result-summary">Đang tải bài viết...</p> : null}
      {hasApiError ? (
        <p className="product-result-summary">
          Không kết nối được backend, đang dùng dữ liệu mẫu.
        </p>
      ) : null}

      <section className="blog-grid">
        {filteredBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        {filteredBlogs.length === 0 && !isLoading ? (
          <section className="empty-products">
            <h2>Chưa có bài viết phù hợp</h2>
            <p>Thử đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
          </section>
        ) : null}
      </section>
    </div>
  )
}

export default BlogListPage
