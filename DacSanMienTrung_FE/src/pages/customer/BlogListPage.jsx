import { useMemo, useState } from 'react'
import BlogCard from '../../components/blog/BlogCard'
import { mockBlogs } from '../../data/mockBlogs'

function BlogListPage() {
  const [searchText, setSearchText] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')

  const topics = useMemo(() => [...new Set(mockBlogs.map((blog) => blog.topic))].sort(), [])
  const provinces = useMemo(() => [...new Set(mockBlogs.map((blog) => blog.province))].sort(), [])

  const filteredBlogs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return mockBlogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(keyword) ||
        blog.description.toLowerCase().includes(keyword) ||
        blog.province.toLowerCase().includes(keyword)
      const matchesTopic = selectedTopic === 'all' || blog.topic === selectedTopic
      const matchesProvince = selectedProvince === 'all' || blog.province === selectedProvince

      return matchesSearch && matchesTopic && matchesProvince
    })
  }, [searchText, selectedTopic, selectedProvince])

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

      <section className="blog-grid">
        {filteredBlogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </section>
    </div>
  )
}

export default BlogListPage
