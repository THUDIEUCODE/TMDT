import { mockCategories } from '../../data/mockCategories'

function CategoryManagementPage() {
  return (
    <>
      <h1 className="page-title">Quản lý danh mục</h1>
      <div className="grid grid-4">
        {mockCategories.map((category) => (
          <div className="stat-card" key={category.id}>
            {category.name}
          </div>
        ))}
      </div>
    </>
  )
}

export default CategoryManagementPage
