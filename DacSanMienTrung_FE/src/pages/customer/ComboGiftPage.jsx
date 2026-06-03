import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { mockCategories } from '../../data/mockCategories'
import { mockComboTypes } from '../../data/mockCombos'
import { mockProducts } from '../../data/mockProducts'
import { addToCart, clearCart } from '../../services/cartService'
import {
  addComboItem,
  cancelCombo,
  comboStatusLabels,
  createCombo,
  deleteComboItem,
  getComboById,
  setPendingCombo,
  updateComboItem,
} from '../../services/comboService'
import { getProducts, mapProductFromApi } from '../../services/productService'
import { getCurrentUserId } from '../../utils/authStorage'

const fallbackProducts = mockProducts.map(mapProductFromApi)
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`

const getFirstVariant = (product) => (product.variants || [])[0]

function ComboGiftPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  const [comboType, setComboType] = useState(mockComboTypes[0].id)
  const [comboInfo, setComboInfo] = useState({
    name: 'Combo quà miền Trung',
    occasion: 'Tặng người thân',
    message: 'Chúc bạn luôn mạnh khỏe và nhiều niềm vui.',
  })
  const [products, setProducts] = useState(fallbackProducts)
  const [selectedCombo, setSelectedCombo] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVariants, setSelectedVariants] = useState({})
  const [quantities, setQuantities] = useState({})
  const [itemNotes, setItemNotes] = useState({})
  const [isProductsLoading, setIsProductsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [hasProductApiError, setHasProductApiError] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate(`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`, { replace: true })
    }
  }, [location.pathname, location.search, navigate])

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      setIsProductsLoading(true)

      try {
        const apiProducts = await getProducts()
        if (!isMounted) return
        setProducts(apiProducts)
        setHasProductApiError(false)
      } catch {
        if (!isMounted) return
        setProducts(fallbackProducts)
        setHasProductApiError(true)
      } finally {
        if (isMounted) setIsProductsLoading(false)
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedComboType = mockComboTypes.find((type) => type.id === comboType)
  const provinces = useMemo(() => [...new Set(products.map((product) => product.province).filter(Boolean))].sort(), [products])

  const filteredProducts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.province.toLowerCase().includes(keyword)
      const matchesProvince = selectedProvince === 'all' || product.province === selectedProvince
      const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory

      return matchesSearch && matchesProvince && matchesCategory
    })
  }, [products, searchText, selectedProvince, selectedCategory])

  const comboItems = selectedCombo?.items || []
  const total = comboItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
  const canEditCombo = selectedCombo?.trangThaiCombo === 'luuTam'

  const updateInfo = (field, value) => {
    setComboInfo((current) => ({ ...current, [field]: value }))
  }

  const refreshCombo = async (comboId = selectedCombo?.id) => {
    if (!comboId) return
    setSelectedCombo(await getComboById(comboId))
  }

  const saveDraftCombo = async (nextStep = null) => {
    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate(`/login?redirect=${encodeURIComponent('/combo-gift')}`)
      return
    }

    if (selectedCombo) {
      setActionError('')
      setActionMessage('Combo đã được lưu trong Profile.')
      if (nextStep) setCurrentStep(nextStep)
      return
    }

    if (!comboInfo.name.trim()) {
      setActionError('Vui lòng nhập tên combo.')
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      const combo = await createCombo({
        maNguoiDung,
        tenCombo: comboInfo.name.trim(),
        loaiCombo: comboType,
        dipLe: comboInfo.occasion.trim(),
        loiNhan: comboInfo.message.trim(),
        trangThaiCombo: 'luuTam',
      })
      setSelectedCombo(combo)
      if (nextStep) setCurrentStep(nextStep)
      setActionMessage('Combo đã được lưu tạm. Bạn có thể thêm sản phẩm.')
      setActionMessage('Đã lưu combo vào Profile.')
    } catch (error) {
      setActionError(error?.message || 'Không thể tạo combo. Kiểm tra API POST /api/combos.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateCombo = async () => {
    await saveDraftCombo(3)
  }

  const getSelectedVariant = (product) => {
    const variantId = selectedVariants[product.id]
    return (product.variants || []).find((variant) => variant.id === variantId) || getFirstVariant(product)
  }

  const addProductToCombo = async (product) => {
    if (!selectedCombo) {
      setActionError('Vui lòng tạo combo trước khi thêm sản phẩm.')
      return
    }

    const variant = getSelectedVariant(product)

    if (!variant) {
      setActionError('Sản phẩm chưa có biến thể để thêm vào combo.')
      return
    }

    setIsSaving(true)
    setActionError('')

    try {
      await addComboItem(selectedCombo.id, {
        maBienThe: variant.maBienThe ?? variant.id,
        soLuong: Number(quantities[product.id] || 1),
        ghiChu: itemNotes[product.id] || '',
      })
      await refreshCombo(selectedCombo.id)
      setActionMessage('Đã thêm sản phẩm vào combo.')
    } catch (error) {
      setActionError(error?.message || 'Không thể thêm sản phẩm. Kiểm tra API POST /api/combos/{maCombo}/items.')
    } finally {
      setIsSaving(false)
    }
  }

  const changeComboItemQuantity = async (item, nextQuantity) => {
    if (nextQuantity < 1) return

    setIsSaving(true)
    setActionError('')

    try {
      await updateComboItem(item.maChiTietCombo || item.id, {
        soLuong: nextQuantity,
        ghiChu: item.note || '',
      })
      await refreshCombo()
    } catch (error) {
      setActionError(error?.message || 'Không thể cập nhật item combo.')
    } finally {
      setIsSaving(false)
    }
  }

  const removeComboItem = async (item) => {
    setIsSaving(true)
    setActionError('')

    try {
      await deleteComboItem(item.maChiTietCombo || item.id)
      await refreshCombo()
    } catch (error) {
      setActionError(error?.message || 'Không thể xóa item combo.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelCombo = async () => {
    if (!selectedCombo || !window.confirm('Bạn có chắc muốn hủy combo này?')) return

    setIsSaving(true)
    setActionError('')

    try {
      await cancelCombo(selectedCombo.id)
      await refreshCombo(selectedCombo.id)
      setActionMessage('Đã hủy combo.')
    } catch (error) {
      setActionError(error?.message || 'Không thể hủy combo.')
    } finally {
      setIsSaving(false)
    }
  }

  const orderComboNow = async () => {
    if (!selectedCombo || isOrdering) return

    if (comboItems.length === 0) {
      setActionError('Combo chưa có sản phẩm.')
      return
    }

    if (!window.confirm('Bạn muốn đưa combo này vào giỏ hàng và chuyển sang thanh toán?')) return

    const maNguoiDung = getCurrentUserId()

    if (!maNguoiDung) {
      navigate(`/login?redirect=${encodeURIComponent('/combo-gift')}`)
      return
    }

    setIsOrdering(true)
    setActionError('')

    try {
      await clearCart(maNguoiDung)
    } catch {
      setActionError('Hệ thống đang bận, vui lòng thử lại.')
      setIsOrdering(false)
      return
    }

    try {
      for (const item of comboItems) {
        await addToCart({
          maNguoiDung,
          maBienThe: item.maBienThe || item.variantId,
          soLuong: item.soLuong || item.quantity,
        })
      }
      setPendingCombo(selectedCombo)
      navigate('/checkout')
    } catch (error) {
      setActionError(error?.message || 'Không thể đưa combo vào giỏ hàng.')
    } finally {
      setIsOrdering(false)
    }
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
          <button className={currentStep === step ? 'active' : ''} key={step} type="button" onClick={() => setCurrentStep(step)}>
            Bước {step}
          </button>
        ))}
      </div>

      {actionMessage ? <p className="form-success">{actionMessage}</p> : null}
      {actionError ? <p className="form-error">{actionError}</p> : null}
      {hasProductApiError ? <p className="product-result-summary">Không tải được GET /api/products, đang dùng dữ liệu mẫu để chọn sản phẩm.</p> : null}

      {currentStep === 1 && (
        <section className="combo-panel">
          <h2>Chọn loại combo</h2>
          <div className="combo-type-grid">
            {mockComboTypes.map((type) => (
              <button className={comboType === type.id ? 'active' : ''} key={type.id} type="button" onClick={() => setComboType(type.id)}>
                <strong>{type.label}</strong>
                <span>{type.description}</span>
              </button>
            ))}
          </div>
          <button className="button combo-next" type="button" onClick={() => setCurrentStep(2)}>Tiếp tục</button>
        </section>
      )}

      {currentStep === 2 && (
        <section className="combo-panel">
          <h2>Thông tin combo</h2>
          <div className="combo-form-grid">
            <label>Tên combo quà<input value={comboInfo.name} onChange={(event) => updateInfo('name', event.target.value)} /></label>
            <label>Dịp lễ<input value={comboInfo.occasion} onChange={(event) => updateInfo('occasion', event.target.value)} /></label>
            <label className="combo-full">Lời nhắn/lời chúc<textarea rows="4" value={comboInfo.message} onChange={(event) => updateInfo('message', event.target.value)} /></label>
          </div>
          <button className="button combo-next" type="button" disabled={isSaving} onClick={handleCreateCombo}>
            {isSaving ? '\u0110ang l\u01b0u...' : 'L\u01b0u t\u1ea1m combo'}
          </button>
        </section>
      )}

      {currentStep === 3 && (
        <section className="combo-panel">
          <h2>Chọn sản phẩm và biến thể</h2>
          {selectedCombo ? (
            <p className="product-result-summary">
              Combo hiện tại: <strong>{selectedCombo.name}</strong> · {comboStatusLabels[selectedCombo.trangThaiCombo] || selectedCombo.trangThaiCombo}
            </p>
          ) : null}
          <div className="combo-product-toolbar">
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Tìm sản phẩm..." />
            <select value={selectedProvince} onChange={(event) => setSelectedProvince(event.target.value)}>
              <option value="all">Tất cả tỉnh</option>
              {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
            </select>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {mockCategories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
            </select>
          </div>

          {isProductsLoading ? <p className="product-result-summary">Đang tải sản phẩm...</p> : null}

          <div className="combo-product-grid">
            {filteredProducts.map((product) => {
              const variant = getSelectedVariant(product)

              return (
                <article className="combo-product-item" key={product.id}>
                  <div className="combo-product-image">{product.image}</div>
                  <h3>{product.name}</h3>
                  <p>{product.province} · {product.subCategory}</p>
                  <select value={variant?.id || ''} onChange={(event) => setSelectedVariants((current) => ({ ...current, [product.id]: event.target.value }))}>
                    {(product.variants || []).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                  <strong>{formatCurrency(variant?.price || product.price)}</strong>
                  <input min="1" type="number" value={quantities[product.id] || 1} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: event.target.value }))} />
                  <input value={itemNotes[product.id] || ''} onChange={(event) => setItemNotes((current) => ({ ...current, [product.id]: event.target.value }))} placeholder="Ghi chú sản phẩm" />
                  <button className="button secondary" type="button" disabled={!canEditCombo || isSaving} onClick={() => addProductToCombo(product)}>
                    Thêm vào combo
                  </button>
                </article>
              )
            })}
          </div>

          <button className="button combo-next" type="button" onClick={() => setCurrentStep(4)}>Xem lại combo</button>
        </section>
      )}

      {currentStep === 4 && (
        <section className="combo-review">
          <div className="combo-panel">
            <h2>Chi tiết combo</h2>
            <div className="combo-review-info">
              <p><strong>Tên combo:</strong> {selectedCombo?.name || comboInfo.name}</p>
              <p><strong>Loại combo:</strong> {selectedCombo?.loaiCombo || selectedComboType?.label}</p>
              <p><strong>Dịp lễ:</strong> {selectedCombo?.occasion || comboInfo.occasion}</p>
              <p><strong>Lời nhắn:</strong> {selectedCombo?.message || comboInfo.message}</p>
              <p><strong>Trạng thái:</strong> {comboStatusLabels[selectedCombo?.trangThaiCombo] || selectedCombo?.trangThaiCombo || 'Chưa tạo'}</p>
            </div>
            {selectedCombo && canEditCombo ? (
              <button className="button secondary" type="button" disabled={isSaving} onClick={handleCancelCombo}>Hủy combo</button>
            ) : null}
          </div>

          <aside className="combo-summary-panel">
            <h2>Sản phẩm đã chọn</h2>
            {comboItems.length > 0 ? (
              <div className="combo-review-items">
                {comboItems.map((item) => (
                  <article className="combo-selected-item" key={item.id}>
                    <span className="combo-selected-avatar">{item.image}</span>
                    <p className="combo-selected-info">
                      <strong>{item.name}</strong>
                      <small>{item.variantName}</small>
                      {item.note ? <small>{item.note}</small> : null}
                    </p>
                    <b className="combo-selected-price">{formatCurrency(item.price * item.quantity)}</b>
                    {canEditCombo ? (
                      <div className="combo-selected-actions">
                        <div className="quantity-control combo-quantity combo-mini-stepper">
                          <button type="button" disabled={isSaving} onClick={() => changeComboItemQuantity(item, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" disabled={isSaving} onClick={() => changeComboItemQuantity(item, item.quantity + 1)}>+</button>
                        </div>
                        <button className="combo-remove-item" type="button" disabled={isSaving} onClick={() => removeComboItem(item)}>{'X\u00f3a'}</button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">Combo chưa có sản phẩm.</p>
            )}
            <div className="summary-lines">
              <div className="summary-total">
                <span>Tổng tiền tạm tính</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
            </div>
            <div className="payment-actions">
              <button className="button secondary" type="button" onClick={() => setCurrentStep(3)}>{'Th\u00eam s\u1ea3n ph\u1ea9m'}</button>
              <button className="button secondary" type="button" disabled={isSaving || isOrdering} onClick={() => saveDraftCombo()}>
                {'L\u01b0u t\u1ea1m combo'}
              </button>
              {selectedCombo?.trangThaiCombo === 'luuTam' ? (
                <button className="button" type="button" disabled={isSaving || isOrdering} onClick={orderComboNow}>
                  {isOrdering ? '\u0110ang x\u1eed l\u00fd...' : '\u0110\u1eb7t ngay'}
                </button>
              ) : null}
            </div>
          </aside>
        </section>
      )}

      <Link className="read-more" to="/categories">Xem thêm danh mục đặc sản</Link>
    </div>
  )
}

export default ComboGiftPage
