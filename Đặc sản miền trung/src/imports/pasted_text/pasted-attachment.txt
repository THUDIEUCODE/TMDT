Đây là prompt chi tiết để dùng trong Figma (với plugin **Figma AI**, **Relume**, hoặc copy vào **ChatGPT/Claude** để sinh wireframe description):

---

## PROMPT FIGMA — WEBSITE ĐẶC SẢN MIỀN TRUNG

---

### 🎨 DESIGN SYSTEM & THƯƠNG HIỆU

```
Design a Vietnamese Central Region specialty food e-commerce website called 
"Đặc Sản Miền Trung" (DacSanMienTrung.vn).

BRAND IDENTITY:
- Style: Vibrant, festive, culturally rich Central Vietnam aesthetic
- Primary colors: Deep red (#C0392B), Golden yellow (#F39C12), 
  Jade green (#1E8449), Royal purple (#6C3483)
- Accent: Cream/ivory (#FDF6E3) for backgrounds
- Typography: 
  + Headings: SVN-Festive or Playfair Display (bold, ceremonial feel)
  + Body: Be Vietnam Pro or Nunito (clean, readable)
- Visual motifs: Hội An lanterns, Huế royal patterns, 
  non lá (conical hat), lotus, traditional tile patterns as subtle 
  background textures and dividers
- Image style: Warm photography, natural textures, 
  handcrafted/artisan aesthetic (reference: hoabanfood.com for storytelling 
  approach, quadanang.com for local product presentation)
```

---

### 🗂️ DANH SÁCH MÀN HÌNH CẦN THIẾT KẾ

```
Design the following 20 screens as a complete user flow:

SCREEN LIST:
01. Home page (Trang chủ)
02. Product category page (Trang danh mục - e.g. Bánh kẹo)
03. Product detail page (Trang chi tiết sản phẩm)
04. Shopping cart page (Trang giỏ hàng)
05. Checkout - address & shipping (Trang đặt hàng - bước 1)
06. Checkout - payment (Trang thanh toán - bước 2)
07. Order confirmation (Trang xác nhận đặt hàng)
08. Login page (Đăng nhập)
09. Register page (Đăng ký)
10. User account - order history (Trang tài khoản - lịch sử đơn)
11. Order tracking page (Theo dõi đơn hàng)
12. Return request page (Gửi yêu cầu hoàn hàng)
13. Blog listing page (Trang Đi & Viết)
14. Blog detail page (Bài viết chi tiết)
15. Combo builder page (Trang tạo combo quà tặng)
16. [STAFF] Dashboard nhân viên
17. [STAFF] Quản lý đơn hàng
18. [STAFF] Quản lý sản phẩm & tồn kho
19. [ADMIN] Dashboard quản trị viên
20. [ADMIN] Quản lý tài khoản & voucher
```

---

### 📐 CHI TIẾT TỪNG MÀN HÌNH

```
=== SCREEN 01: HOME PAGE ===
Header (sticky):
- Logo left: "Đặc Sản Miền Trung" with lotus icon
- Main navigation (horizontal): 
  Trang Chủ | Bánh Kẹo | Đá Phong Thủy | Trà | Tinh Dầu | 
  Đặc Sản Khô | Combo Quà | Đi & Viết
- Right side: Search icon | Cart icon (with badge) | 
  Đăng Nhập / Đăng Ký button (outlined) or Avatar dropdown when logged in
- Sub-header strip: phone number, free shipping notice, 
  "Đặc sản 19 tỉnh miền Trung" tagline

Hero banner: Full-width carousel with 3 slides:
- Slide 1: Tết gifting campaign - red/gold theme
- Slide 2: "Đặc sản Huế" featured region
- Slide 3: New arrivals announcement

Section 1 - BEST SELLER: 
- Section title with "Bán Chạy Nhất" badge (red flame icon)
- Horizontal scroll row of 6 product cards
- Each card: product image, name, origin province badge, 
  price, star rating, "Thêm vào giỏ" button

Section 2 - SẢN PHẨM MỚI:
- Grid 4 columns, 8 products
- "Mới" green badge on cards
- Same card structure as above

Section 3 - VOUCHER & KHUYẾN MÃI:
- Banner-style voucher cards (2 columns)
- Countdown timer on limited vouchers
- "Sao chép mã" copy button

Section 4 - COMBO QUÀ TẶNG:
- 3 featured combo boxes with themed imagery
- Tags: "Tết Nguyên Đán", "Quà Biếu", "Đặc Sản Huế"
- Price range and "Xem chi tiết" CTA

Section 5 - ĐI & VIẾT (Blog preview):
- 3 blog cards in a row: thumbnail, category tag, 
  title, author (staff name), excerpt, read more link

Section 6 - ĐẶC SẢN THEO TỈNH:
- Map of Central Vietnam (19 provinces) as visual navigation
- Click province → filter products from that province

Footer:
- Logo + tagline
- 4 columns: About | Customer Service | Categories | Social links
- Bottom bar: copyright, payment method icons

=== SCREEN 02: PRODUCT CATEGORY PAGE ===
- Breadcrumb: Trang chủ > Bánh Kẹo
- Category hero banner (full width, warm photography)
- Left sidebar filter panel:
  + Lọc theo tỉnh/thành (checkbox list: Huế, Đà Nẵng, 
    Quảng Nam, Quảng Ngãi, Bình Định, etc.)
  + Lọc theo giá (range slider)
  + Lọc theo đánh giá (star filter)
  + Lọc theo mới nhất / bán chạy (sort dropdown)
- Sub-category tabs below hero: 
  Tất cả | Bánh | Kẹo | Mứt | Bánh tráng
- Product grid: 3 columns, 12 products per page
- Pagination at bottom

=== SCREEN 03: PRODUCT DETAIL PAGE ===
- Breadcrumb navigation
- Left: Image gallery (main image + 4 thumbnails)
- Right product info:
  + Product name (large heading)
  + Origin badge: province flag color + "Xuất xứ: Huế"
  + Star rating + review count
  + Price (large, red) + original price crossed out
  + Variant selector: weight buttons (200g / 500g / 1kg) 
    and packaging (Hộp / Túi zip / Lọ thủy tinh)
  + Quantity selector (- / number / +)
  + Two CTA buttons: "Thêm vào giỏ hàng" (outlined) 
    + "Mua ngay" (filled red)
  + Trust badges: Đảm bảo chất lượng | Ship toàn quốc | 
    Đổi trả 7 ngày
- Below fold - Tab sections:
  + Tab 1: Mô tả (product story, cultural background, 
    ingredients, storage instructions)
  + Tab 2: Đánh giá (reviews with stars, verified purchase badge)
  + Tab 3: Sản phẩm liên quan

=== SCREEN 04: SHOPPING CART PAGE ===
- Cart items table:
  + Columns: Hình ảnh | Tên sản phẩm & biến thể | 
    Đơn giá | Số lượng | Thành tiền | Xóa
  + Quantity editable inline
- Right summary panel:
  + Subtotal, shipping fee, discount
  + Voucher input field + "Áp dụng" button
  + Total (large, prominent)
  + "Tiến hành đặt hàng" red CTA button
  + "Tiếp tục mua sắm" text link

=== SCREEN 05: CHECKOUT STEP 1 (Address) ===
- Step indicator: 1.Địa chỉ → 2.Thanh toán → 3.Xác nhận
- Saved addresses list (radio select) + "Thêm địa chỉ mới"
- Shipping method selector: 
  Tiêu chuẩn (3-5 ngày) / Express (1-2 ngày)
- Order summary sidebar (condensed)
- "Tiếp tục" button

=== SCREEN 06: CHECKOUT STEP 2 (Payment) ===
- Payment method radio buttons with icons:
  + Tiền mặt (COD) - cash icon
  + Chuyển khoản - bank icon  
  + Thẻ tín dụng - card icon
  + Ví điện tử - wallet icon
- Order note textarea
- Final order summary with all costs
- "Xác nhận đặt hàng" large red button

=== SCREEN 07: ORDER CONFIRMATION ===
- Success state: large checkmark animation area
- "Đặt hàng thành công!" heading
- Order code: #DM2024XXXXX
- Summary of ordered items
- Estimated delivery date
- "Xem đơn hàng" and "Tiếp tục mua sắm" buttons

=== SCREEN 08: LOGIN PAGE ===
- Centered card layout
- Logo at top
- Email + Password fields
- "Quên mật khẩu?" link
- "Đăng nhập" button (full width, red)
- Divider "hoặc"
- Social login: Google button
- "Chưa có tài khoản? Đăng ký ngay" link

=== SCREEN 09: REGISTER PAGE ===
- Same card layout as login
- Fields: Họ tên | Email | Mật khẩu | Xác nhận mật khẩu | 
  Số điện thoại | Ngày sinh
- Terms checkbox
- "Đăng ký" button
- "Đã có tài khoản? Đăng nhập" link

=== SCREEN 10: ACCOUNT - ORDER HISTORY ===
- Left sidebar account menu:
  Thông tin cá nhân | Đơn hàng | Địa chỉ | Điểm tích lũy | 
  Đánh giá | Combo quà tặng | Đăng xuất
- Main area: Order list table
  + Status filter tabs: Tất cả | Chờ xác nhận | Đang giao | 
    Đã giao | Đã hủy | Đang hoàn hàng
  + Each row: Order ID, date, items preview, total, 
    status badge (color-coded), action buttons 
    (Xem chi tiết / Đánh giá / Yêu cầu hoàn hàng)

=== SCREEN 11: ORDER TRACKING ===
- Order details header
- Visual timeline/stepper: 
  Đặt hàng ✓ → Xác nhận ✓ → Đóng gói → Đang giao → Đã nhận
- Shipping carrier info + tracking number
- Delivery address confirmation
- Ordered items list

=== SCREEN 12: RETURN REQUEST ===
- Order info header
- Product selection checkboxes (items to return)
- Reason dropdown: Hàng lỗi / Không đúng mô tả / 
  Không muốn nữa / Khác
- Evidence photo upload area (drag & drop)
- Description textarea
- "Gửi yêu cầu" button

=== SCREEN 13: BLOG LISTING (Đi & Viết) ===
- Page hero: "Đi & Viết — Khám phá ẩm thực miền Trung"
- Filter by province / topic (horizontal pill tabs)
- Featured article (large card, top)
- Grid of blog cards: 3 columns
  + Thumbnail | Province tag | Title | Author (staff) | 
    Date | Excerpt | Đọc thêm link
- Related products sidebar (products mentioned in articles)

=== SCREEN 14: BLOG DETAIL ===
- Full-width hero image
- Article metadata: Author avatar + name, date, province tag
- Rich text content with embedded product cards 
  ("Mua ngay" CTA inline)
- Table of contents sidebar (sticky)
- Related articles at bottom
- Comment/review section

=== SCREEN 15: COMBO BUILDER ===
- Step 1: Chọn chủ đề (themed combo selection):
  Card options: Tết | Trung Thu | Quà biếu | Đặc sản vùng
- Step 2: Browse & add products to combo
  + Product grid with "Thêm vào combo" button
  + Right panel: Combo preview (selected items list)
- Step 3: Đặt tên combo + ghi chú dịp lễ
- Step 4: "Lưu combo" or "Đặt hàng ngay"

=== SCREEN 16: STAFF DASHBOARD ===
Layout: Left sidebar navigation + main content area
Sidebar items: 
  Dashboard | Đơn hàng | Sản phẩm | Tồn kho | 
  Đánh giá | Blog | Hoàn hàng

Dashboard content:
- Stats cards row: Đơn chờ xử lý (orange) | 
  Đơn đang giao (blue) | Yêu cầu hoàn hàng (red) | 
  Tổng đơn hôm nay (green)
- Recent orders table (last 10)
- Low stock alerts panel
- Pending reviews to moderate

=== SCREEN 17: STAFF - ORDER MANAGEMENT ===
- Filter tabs: Chờ xác nhận | Đang xử lý | Đang giao | 
  Đã giao | Đã hủy
- Orders data table:
  + Columns: Mã đơn | Khách hàng | Sản phẩm | 
    Tổng tiền | Trạng thái | Ngày đặt | Hành động
  + Action buttons per row: Xem | Xác nhận | Hủy
- Order detail modal/drawer:
  + Full order info
  + Status update dropdown
  + Tracking number input field
  + Notes field

=== SCREEN 18: STAFF - PRODUCT MANAGEMENT ===
- Search + filter bar (by category, province, status)
- Products table:
  + Columns: Hình | Tên sản phẩm | Danh mục | Tỉnh | 
    Giá | Tồn kho | Trạng thái | Hành động
  + Status toggle (ẩn/hiện) inline
  + Edit / Delete action buttons
- "Thêm sản phẩm mới" button → side drawer form:
  + All product fields from ERD (tên, danh mục, tỉnh, 
    thành phần, hướng dẫn bảo quản, đặc trưng văn hóa, 
    lịch sử sản phẩm, giá niêm yết)
  + Variant manager: add weight/packaging options inline
  + Image upload grid

=== SCREEN 19: ADMIN DASHBOARD ===
- Richer stats than staff: Revenue chart (line/bar), 
  top products, sales by province (map visual)
- Quick access cards: Quản lý nhân viên | Voucher | 
  Tài khoản | Báo cáo
- Recent activity log

=== SCREEN 20: ADMIN - ACCOUNTS & VOUCHERS ===
Tabs: Tài khoản người dùng | Voucher

Tab 1 - Accounts:
- User table with role badge (Khách hàng / Nhân viên / QTV)
- Status toggle (active/locked)
- Khóa / Kích hoạt action

Tab 2 - Vouchers:
- Voucher list: Code | Loại giảm | Giá trị | 
  Đơn tối thiểu | Còn lại | Hết hạn | Trạng thái
- "Tạo voucher mới" form modal

HIDDEN ROLE SWITCHER (all screens):
- Small floating button bottom-right corner: 
  gear icon (⚙) or lock icon, 8px opacity 30%
- Click → small popover: "Xem giao diện:" 
  [Khách hàng] [Nhân viên] [Quản trị viên]
- For prototype/demo navigation only
```

---

### 🔗 REFERENCE WEBSITES

```
Study and incorporate UX patterns from:
1. https://hoabanfood.com — storytelling approach, 
   product photography style, blog integration
2. https://quadanang.com — local Central Vietnam 
   product presentation, category structure
3. Shopee.vn — cart, checkout, order tracking UX patterns
4. Tiki.vn — product detail page layout, review system

Key takeaways to apply:
- hoabanfood.com: emotional storytelling in product descriptions, 
  blog-shop integration, artisan/handcrafted visual language
- quadanang.com: province-based navigation, local specialty 
  categorization
```

---

### ⚙️ FIGMA-SPECIFIC INSTRUCTIONS

```
COMPONENTS TO CREATE:
- Product card (default, hover, out-of-stock states)
- Category pill/tag (province variants with color coding)
- Status badge (order statuses, color-coded)
- Step indicator / progress bar
- Star rating component
- Variant selector button (weight/packaging)
- Navigation header (guest / logged-in states)
- Staff sidebar navigation

PROTOTYPE CONNECTIONS:
- Header nav items → corresponding category pages
- "Thêm vào giỏ" → cart page
- "Mua ngay" → checkout step 1
- Login/Register toggle
- Hidden switcher → role-specific screens

RESPONSIVE: Design for 1440px desktop width
GRID: 12-column grid, 80px margins, 24px gutter
```

---

Bạn copy toàn bộ prompt trên và dán vào:
- **Figma AI** (Generate UI feature) — cho wireframe nhanh
- **Relume** plugin trong Figma — cho website sections đầy đủ hơn
- **ChatGPT/Claude** → export HTML/CSS → import vào Figma qua plugin **Anima**

Nếu muốn mình tạo thẳng 1 màn hình cụ thể dưới dạng HTML preview ngay trong chat này cũng được nhé!