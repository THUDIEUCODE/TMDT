import { mockProducts } from '../../data/mockProducts'

function ProductManagementPage() {
  return (
    <>
      <h1 className="page-title">Quản lý sản phẩm</h1>
      <div className="table-like">
        {mockProducts.slice(0, 6).map((product) => (
          <div className="table-row" key={product.id}>
            <strong>{product.name}</strong>
            <span>{product.origin}</span>
            <span>Tồn kho: {product.stock}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default ProductManagementPage
