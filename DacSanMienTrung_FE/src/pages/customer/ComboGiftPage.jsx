import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockComboTypes } from '../../data/mockCombos'
import { mockCategories } from '../../data/mockCategories'
import { mockProducts } from '../../data/mockProducts'

function ComboGiftPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [comboType, setComboType] = useState(mockComboTypes[0].id)
  const [comboInfo, setComboInfo] = useState({
    name: 'Combo quà miền Trung',
    occasion: 'Tặng người thân',
    message: 'Chúc bạn luôn mạnh khỏe và nhiều niềm vui.',
    receiver: 'Nguyễn Minh Anh',
  })
  const [searchText, setSearchText] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [comboItems, setComboItems] = useState([])
  const [saveMessage, setSaveMessage] = useState('')

  const selectedComboType = mockComboTypes.find((type) => type.id === comboType)
  const provinces = useMemo(() => [...new Set(mockProducts.map((product) => product.province))].sort(), [])

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(keyword) ||
        product.province.toLowerCase().includes(keyword)
      const matchesProvince = selectedProvince === 'all' || product.province === selectedProvince
      const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory

      return matchesSearch && matchesProvince && matchesCategory
    })
  }, [searchText, selectedProvince, selectedCategory])

  const total = comboItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const updateInfo = (field, value) => {
    setComboInfo((current) => ({ ...current, [field]: value }))
  }

  const addToCombo = (product) => {
    setComboItems((currentItems) => {
      const existedItem = currentItems.find((item) => item.id === product.id)

      if (existedItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          province: product.province,
          variant: product.variants[0].label,
          price: product.variants[0].price,
          quantity: 1,
        },
      ]
    })
  }

  const updateComboQuantity = (itemId, nextQuantity) => {
    setComboItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(nextQuantity, 0) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const saveCombo = () => {
    setSaveMessage('Combo đã được lưu tạm')
  }

  return (
    <div className="combo-builder-page">
      <section className="combo-hero">
        <span>Combo quà tặng</span>
        <h1>Tự tạo hộp quà đặc sản miền Trung</h1>
        <p>Chọn dịp tặng, viết lời chúc và phối những món đặc sản phù hợp cho người nhận.</p>
      </section>

      <div className="combo-steps">
        {[1, 2, 3, 4].map((step) => (
          <button
            className={currentStep === step ? 'active' : ''}
            key={step}
            type="button"
            onClick={() => setCurrentStep(step)}
          >
            Bước {step}
          </button>
        ))}
      </div>

      {currentStep === 1 && (
        <section className="combo-panel">
          <h2>Chọn loại combo</h2>
          <div className="combo-type-grid">
            {mockComboTypes.map((type) => (
              <button
                className={comboType === type.id ? 'active' : ''}
                key={type.id}
                type="button"
                onClick={() => setComboType(type.id)}
              >
                <strong>{type.label}</strong>
                <span>{type.description}</span>
              </button>
            ))}
          </div>
          <button className="button combo-next" type="button" onClick={() => setCurrentStep(2)}>
            Tiếp tục
          </button>
        </section>
      )}

      {currentStep === 2 && (
        <section className="combo-panel">
          <h2>Thông tin combo</h2>
          <div className="combo-form-grid">
            <label>
              Tên combo quà
              <input value={comboInfo.name} onChange={(event) => updateInfo('name', event.target.value)} />
            </label>
            <label>
              Dịp lễ
              <input value={comboInfo.occasion} onChange={(event) => updateInfo('occasion', event.target.value)} />
            </label>
            <label>
              Người nhận dự kiến
              <input value={comboInfo.receiver} onChange={(event) => updateInfo('receiver', event.target.value)} />
            </label>
            <label className="combo-full">
              Lời nhắn/lời chúc
              <textarea
                rows="4"
                value={comboInfo.message}
                onChange={(event) => updateInfo('message', event.target.value)}
              />
            </label>
          </div>
          <button className="button combo-next" type="button" onClick={() => setCurrentStep(3)}>
            Chọn sản phẩm
          </button>
        </section>
      )}

      {currentStep === 3 && (
        <section className="combo-panel">
          <h2>Chọn sản phẩm vào combo</h2>
          <div className="combo-product-toolbar">
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm sản phẩm..."
            />
            <select value={selectedProvince} onChange={(event) => setSelectedProvince(event.target.value)}>
              <option value="all">Tất cả tỉnh</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {mockCategories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="combo-product-grid">
            {filteredProducts.map((product) => {
              const selectedItem = comboItems.find((item) => item.id === product.id)

              return (
                <article className="combo-product-item" key={product.id}>
                  <div className="combo-product-image">{product.image}</div>
                  <h3>{product.name}</h3>
                  <p>{product.province} · {product.subCategory}</p>
                  <strong>{product.variants[0].price.toLocaleString('vi-VN')}đ</strong>
                  {selectedItem ? (
                    <div className="quantity-control combo-quantity">
                      <button type="button" onClick={() => updateComboQuantity(product.id, selectedItem.quantity - 1)}>
                        -
                      </button>
                      <span>{selectedItem.quantity}</span>
                      <button type="button" onClick={() => updateComboQuantity(product.id, selectedItem.quantity + 1)}>
                        +
                      </button>
                    </div>
                  ) : (
                    <button className="button secondary" type="button" onClick={() => addToCombo(product)}>
                      Thêm vào combo
                    </button>
                  )}
                </article>
              )
            })}
          </div>

          <button className="button combo-next" type="button" onClick={() => setCurrentStep(4)}>
            Xem lại combo
          </button>
        </section>
      )}

      {currentStep === 4 && (
        <section className="combo-review">
          <div className="combo-panel">
            <h2>Xem lại combo</h2>
            <div className="combo-review-info">
              <p><strong>Tên combo:</strong> {comboInfo.name}</p>
              <p><strong>Loại combo:</strong> {selectedComboType.label}</p>
              <p><strong>Dịp lễ:</strong> {comboInfo.occasion}</p>
              <p><strong>Người nhận:</strong> {comboInfo.receiver}</p>
              <p><strong>Lời nhắn:</strong> {comboInfo.message}</p>
            </div>
          </div>

          <aside className="combo-summary-panel">
            <h2>Sản phẩm đã chọn</h2>
            {comboItems.length > 0 ? (
              <div className="combo-review-items">
                {comboItems.map((item) => (
                  <div key={item.id}>
                    <span>{item.image}</span>
                    <p>
                      <strong>{item.name}</strong>
                      <small>{item.variant} x {item.quantity}</small>
                    </p>
                    <b>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</b>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Chưa có sản phẩm trong combo.</p>
            )}
            <div className="summary-lines">
              <div className="summary-total">
                <span>Tổng tiền tạm tính</span>
                <strong>{total.toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>
            {saveMessage && <p className="combo-save-message">{saveMessage}</p>}
            <div className="payment-actions">
              <button className="button secondary" type="button" onClick={saveCombo}>
                Lưu tạm
              </button>
              <button className="button" type="button" onClick={() => navigate('/checkout')}>
                Đặt hàng ngay
              </button>
            </div>
          </aside>
        </section>
      )}

      <Link className="read-more" to="/categories">
        Xem thêm danh mục đặc sản
      </Link>
    </div>
  )
}

export default ComboGiftPage
