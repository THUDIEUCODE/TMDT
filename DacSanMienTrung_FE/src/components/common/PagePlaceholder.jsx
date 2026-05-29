function PagePlaceholder({ title, description = 'Giao diện tạm, sẽ hoàn thiện ở bước tiếp theo.' }) {
  return (
    <section className="page-card">
      <h1 className="page-title">{title}</h1>
      <p className="muted">{description}</p>
    </section>
  )
}

export default PagePlaceholder
