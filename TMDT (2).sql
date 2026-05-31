-- ============================================================
--  WEBSITE ĐẶC SẢN MIỀN TRUNG
--  Script: Xóa (nếu tồn tại) → Tạo lại Database → Tạo bảng → Insert dữ liệu
--  Chỉ cần nhấn Execute 1 lần là chạy hết
-- ============================================================

-- ► XÓA VÀ TẠO LẠI DATABASE
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DacSanMienTrung01')
BEGIN
    ALTER DATABASE DacSanMienTrung01 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DacSanMienTrung01;
END
GO

CREATE DATABASE DacSanMienTrung01
    COLLATE Vietnamese_CI_AS;
GO

USE DacSanMienTrung01;
GO

-- ============================================================
--  TẠO BẢNG
-- ============================================================

-- 1. NguoiDung
CREATE TABLE NguoiDung (
    maNguoiDung       INT            IDENTITY(1,1) PRIMARY KEY,
    hoTen             NVARCHAR(80)   NOT NULL,
    email             VARCHAR(150)   NOT NULL UNIQUE,
    matKhau           VARCHAR(255)   NOT NULL,
    soDienThoai       VARCHAR(11)    NULL,
    ngaySinh          DATE           NULL,
    vaiTro            NVARCHAR(20)   NOT NULL DEFAULT N'khachhang',
    trangThai         BIT            NOT NULL DEFAULT 1,
    diemTichLuy       INT            NOT NULL DEFAULT 0,
    phanLoaiKhachHang NVARCHAR(20)   NULL,
    chucVu            NVARCHAR(100)  NULL,
    ngayDangKy        DATETIME       NOT NULL DEFAULT GETDATE()
);

-- 2. DanhMuc
CREATE TABLE DanhMuc (
    maDanhMuc      INT           IDENTITY(1,1) PRIMARY KEY,
    maDanhMucCha   INT           NULL REFERENCES DanhMuc(maDanhMuc),
    tenDanhMuc     NVARCHAR(80)  NOT NULL,
    moTa           NVARCHAR(MAX) NULL,
    thuTuHienThi   INT           NULL,
    trangThai      BIT           NOT NULL DEFAULT 1
);

-- 3. SanPham
CREATE TABLE SanPham (
    maSanPham        INT             IDENTITY(1,1) PRIMARY KEY,
    maDanhMuc        INT             NOT NULL REFERENCES DanhMuc(maDanhMuc),
    tenSanPham       NVARCHAR(200)   NOT NULL,
    moTa             NVARCHAR(MAX)   NULL,
    thanhPhan        NVARCHAR(MAX)   NULL,
    huongDanBaoQuan  NVARCHAR(MAX)   NULL,
    dacTrungVanHoa   NVARCHAR(MAX)   NULL,
    lichSuSanPham    NVARCHAR(MAX)   NULL,
    tenTinh          NVARCHAR(100)   NULL,
    vungMien         NVARCHAR(50)    NULL,
    moTaVanHoaTinh   NVARCHAR(MAX)   NULL,
    giaNiemYet       DECIMAL(12,2)   NOT NULL,
    hinhAnh          NVARCHAR(255)   NULL,
    trangThai        BIT             NOT NULL DEFAULT 1
);

-- 4. BienThe
CREATE TABLE BienThe (
    maBienThe        INT             IDENTITY(1,1) PRIMARY KEY,
    maSanPham        INT             NOT NULL REFERENCES SanPham(maSanPham),
    trongLuong       NVARCHAR(50)    NULL,
    quyCachDongGoi   NVARCHAR(50)    NULL,
    giaBan           DECIMAL(12,2)   NOT NULL,
    soLuongTon       INT             NOT NULL DEFAULT 0,
    hanSuDung        DATE            NULL,
    hinhAnh          NVARCHAR(255)   NULL,
    trangThai        BIT             NOT NULL DEFAULT 1
);

-- 5. GioHang
CREATE TABLE GioHang (
    maGioHang    INT             IDENTITY(1,1) PRIMARY KEY,
    maNguoiDung  INT             NOT NULL REFERENCES NguoiDung(maNguoiDung),
    maBienThe    INT             NOT NULL REFERENCES BienThe(maBienThe),
    soLuong      INT             NOT NULL,
    donGia       DECIMAL(12,2)   NOT NULL,
    ngayThem     DATETIME        NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_GioHang UNIQUE (maNguoiDung, maBienThe)
);

-- 6. Voucher
CREATE TABLE Voucher (
    maVoucher        INT             IDENTITY(1,1) PRIMARY KEY,
    maCode           VARCHAR(50)     NOT NULL UNIQUE,
    loaiGiam         NVARCHAR(50)    NOT NULL,
    giaTriGiam       DECIMAL(10,2)   NOT NULL,
    donHangToiThieu  DECIMAL(12,2)   NOT NULL DEFAULT 0,
    soLuongTon       INT             NOT NULL,
    ngayBatDau       DATE            NULL,
    ngayHetHan       DATE            NOT NULL,
    trangThai        BIT             NOT NULL DEFAULT 1
);

-- 7. ComboQuaTang
CREATE TABLE ComboQuaTang (
    maCombo          INT             IDENTITY(1,1) PRIMARY KEY,
    maNguoiDung      INT             NOT NULL REFERENCES NguoiDung(maNguoiDung),
    tenCombo         NVARCHAR(100)   NOT NULL,
    loaiCombo        NVARCHAR(50)    NOT NULL,
    dipLe            NVARCHAR(100)   NULL,
    loiNhan          NVARCHAR(MAX)   NULL,
    tongTienTamTinh  DECIMAL(12,2)   NOT NULL DEFAULT 0,
    trangThaiCombo   NVARCHAR(30)    NOT NULL DEFAULT N'luuTam',
    ngayTao          DATETIME        NOT NULL DEFAULT GETDATE(),
    ngayCapNhat      DATETIME        NULL
);

-- 8. ChiTietCombo
CREATE TABLE ChiTietCombo (
    maChiTietCombo   INT             IDENTITY(1,1) PRIMARY KEY,
    maCombo          INT             NOT NULL REFERENCES ComboQuaTang(maCombo),
    maBienThe        INT             NOT NULL REFERENCES BienThe(maBienThe),
    soLuong          INT             NOT NULL,
    donGia           DECIMAL(12,2)   NOT NULL,
    thanhTien        DECIMAL(12,2)   NOT NULL,
    ghiChuSanPham    NVARCHAR(MAX)   NULL,
    CONSTRAINT UQ_ChiTietCombo UNIQUE (maCombo, maBienThe)
);

-- 9. DonHang
CREATE TABLE DonHang (
    maDonHang              INT             IDENTITY(1,1) PRIMARY KEY,
    maNguoiDung            INT             NOT NULL REFERENCES NguoiDung(maNguoiDung),
    maVoucher              INT             NULL REFERENCES Voucher(maVoucher),
    maCombo                INT             NULL REFERENCES ComboQuaTang(maCombo),
    hoTenNguoiNhan         NVARCHAR(80)    NOT NULL,
    soDienThoaiNguoiNhan   VARCHAR(11)     NOT NULL,
    diaChiGiaoHang         NVARCHAR(MAX)   NOT NULL,
    quanHuyen              NVARCHAR(100)   NULL,
    tinhThanhGiaoHang      NVARCHAR(100)   NOT NULL,
    ghiChuGiaoHang         NVARCHAR(MAX)   NULL,
    trangThaiDonHang       NVARCHAR(50)    NOT NULL DEFAULT N'choXacNhan',
    tongTienHang           DECIMAL(12,2)   NOT NULL,
    tienGiam               DECIMAL(12,2)   NOT NULL DEFAULT 0,
    phiVanChuyen           DECIMAL(12,2)   NOT NULL DEFAULT 0,
    tongThanhToan          DECIMAL(12,2)   NOT NULL,
    phuongThucThanhToan    NVARCHAR(50)    NOT NULL,
    trangThaiThanhToan     NVARCHAR(50)    NOT NULL DEFAULT N'choThanhToan',
    maGiaoDich             VARCHAR(100)    NULL,
    ngayThanhToan          DATETIME        NULL,
    lyDoHuy                NVARCHAR(MAX)   NULL,
    lyDoHoanHang           NVARCHAR(MAX)   NULL,
    hinhAnhMinhChung       NVARCHAR(MAX)   NULL,
    trangThaiHoanHang      NVARCHAR(50)    NOT NULL DEFAULT N'khongCo',
    maNhanVienXuLy         INT             NULL REFERENCES NguoiDung(maNguoiDung),
    ghiChuXuLy             NVARCHAR(MAX)   NULL,
    ngayDatHang            DATETIME        NOT NULL DEFAULT GETDATE(),
    ghiChu                 NVARCHAR(MAX)   NULL
);

-- 10. ChiTietDonHang
CREATE TABLE ChiTietDonHang (
    maChiTietDonHang    INT             IDENTITY(1,1) PRIMARY KEY,
    maDonHang           INT             NOT NULL REFERENCES DonHang(maDonHang),
    maBienThe           INT             NOT NULL REFERENCES BienThe(maBienThe),
    soLuong             INT             NOT NULL,
    donGia              DECIMAL(12,2)   NOT NULL,
    thanhTien           DECIMAL(12,2)   NOT NULL,
    soLuongHoan         INT             NOT NULL DEFAULT 0,
    donGiaHoan          DECIMAL(12,2)   NULL,
    soSao               INT             NULL,
    noiDungDanhGia      NVARCHAR(MAX)   NULL,
    ngayDanhGia         DATETIME        NULL,
    daKiemDuyetDanhGia  BIT             NOT NULL DEFAULT 0
);

-- 11. BlogAmThuc
CREATE TABLE BlogAmThuc (
    maBlog      INT             IDENTITY(1,1) PRIMARY KEY,
    maTacGia    INT             NOT NULL REFERENCES NguoiDung(maNguoiDung),
    tieuDe      NVARCHAR(200)   NOT NULL,
    moTa        NVARCHAR(MAX)   NULL,
    noiDung     NVARCHAR(MAX)   NULL,
    hinhAnh     NVARCHAR(255)   NULL,
    chuDe       NVARCHAR(100)   NULL,
    tenTinh     NVARCHAR(100)   NULL,
    ngayDang    DATETIME        NOT NULL DEFAULT GETDATE(),
    trangThai   BIT             NOT NULL DEFAULT 1
);

-- 12. BlogSanPham
CREATE TABLE BlogSanPham (
    maBlogSanPham   INT   IDENTITY(1,1) PRIMARY KEY,
    maBlog          INT   NOT NULL REFERENCES BlogAmThuc(maBlog),
    maSanPham       INT   NOT NULL REFERENCES SanPham(maSanPham),
    CONSTRAINT UQ_BlogSanPham UNIQUE (maBlog, maSanPham)
);

GO

-- ============================================================
--  INSERT DỮ LIỆU MẪU
-- ============================================================

-- ► 1. NguoiDung (2 admin, 2 nhân viên, 6 khách hàng)
INSERT INTO NguoiDung (hoTen, email, matKhau, soDienThoai, ngaySinh, vaiTro, trangThai, diemTichLuy, phanLoaiKhachHang, chucVu)
VALUES
(N'Nguyễn Văn An',    'admin.an@dacsan.vn',     '$2b$10$hashedpw1', '0901234501', '1985-03-15', N'quantrivien', 1, 0,   NULL,        N'Quản trị viên hệ thống'),
(N'Trần Thị Bình',   'admin.binh@dacsan.vn',   '$2b$10$hashedpw2', '0901234502', '1990-07-22', N'quantrivien', 1, 0,   NULL,        N'Quản trị viên nội dung'),
(N'Lê Minh Châu',    'nv.chau@dacsan.vn',      '$2b$10$hashedpw3', '0901234503', '1995-01-10', N'nhanvien',    1, 0,   NULL,        N'Nhân viên kho'),
(N'Phạm Quốc Dũng',  'nv.dung@dacsan.vn',      '$2b$10$hashedpw4', '0901234504', '1993-11-05', N'nhanvien',    1, 0,   NULL,        N'Nhân viên giao vận'),
(N'Hoàng Thị Lan',   'lan.hoang@gmail.com',    '$2b$10$hashedpw5', '0912345605', '1992-06-18', N'khachhang',   1, 850, N'bạc',      NULL),
(N'Võ Thanh Hùng',   'hung.vo@gmail.com',      '$2b$10$hashedpw6', '0912345606', '1988-12-30', N'khachhang',   1, 3200,N'vàng',     NULL),
(N'Đặng Thị Mai',    'mai.dang@yahoo.com',     '$2b$10$hashedpw7', '0923456707', '1997-04-25', N'khachhang',   1, 150, N'thường',   NULL),
(N'Bùi Trung Kiên',  'kien.bui@gmail.com',     '$2b$10$hashedpw8', '0934567808', '1991-09-14', N'khachhang',   1, 7500,N'kim cương', NULL),
(N'Ngô Thị Phương',  'phuong.ngo@gmail.com',   '$2b$10$hashedpw9', '0945678909', '1999-02-08', N'khachhang',   1, 0,   N'thường',   NULL),
(N'Tô Văn Quân',     'quan.to@outlook.com',    '$2b$10$hashedpwA', '0956789010', '1986-08-19', N'khachhang',   1, 1200,N'bạc',      NULL);

-- ► 2. DanhMuc – 8 danh mục lớn (cha), sau đó danh mục con
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
-- Danh mục cha
(NULL, N'Bánh Kẹo',      N'Các loại bánh và kẹo truyền thống miền Trung',        1, 1),
(NULL, N'Đá Phong Thủy', N'Đá tự nhiên phong thủy, đá quý, đá trang trí',        2, 1),
(NULL, N'Trà',           N'Trà xanh, trà thảo mộc, trà đặc sản các vùng',        3, 1),
(NULL, N'Tinh Dầu',      N'Tinh dầu thiên nhiên, tinh dầu thơm, tinh dầu dược liệu', 4, 1),
(NULL, N'Đặc Sản Khô',   N'Hải sản khô, thịt khô, nông sản khô miền Trung',      5, 1),
(NULL, N'Đồ Mỹ Nghệ',   N'Đồ thủ công mỹ nghệ, lưu niệm, trang trí nội thất',   6, 1),
(NULL, N'Đông Y',        N'Thảo dược, vị thuốc, sản phẩm đông y truyền thống',    7, 1),
(NULL, N'Vải',           N'Vải thổ cẩm, lụa, vải truyền thống các dân tộc miền Trung', 8, 1);

-- Danh mục con – Bánh Kẹo (maDanhMucCha = 1)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(1, N'Bánh',         N'Bánh in, bánh đậu xanh, bánh nậm, bánh lọc và các loại bánh khác',  1, 1),
(1, N'Kẹo',          N'Kẹo gừng, kẹo dừa, kẹo mè xửng và các loại kẹo đặc sản',           2, 1);

-- Danh mục con – Đá Phong Thủy (maDanhMucCha = 2)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(2, N'Đá Thô Tự Nhiên',   N'Đá nguyên khối, đá cuội, đá cảnh chưa qua chế tác',      1, 1),
(2, N'Đá Chế Tác',        N'Vòng tay, vòng cổ, tượng đá phong thủy đã qua chế tác',  2, 1);

-- Danh mục con – Trà (maDanhMucCha = 3)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(3, N'Trà Xanh',       N'Trà xanh Huế, trà xanh Quảng Nam nguyên chất',               1, 1),
(3, N'Trà Thảo Mộc',   N'Trà atiso, trà hoa cúc, trà gừng mật ong và thảo mộc khác', 2, 1),
(3, N'Trà Ướp Hoa',    N'Trà sen, trà nhài, trà hoa hồng ướp hương tự nhiên',         3, 1);

-- Danh mục con – Tinh Dầu (maDanhMucCha = 4)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(4, N'Tinh Dầu Thơm',     N'Tinh dầu sả, oải hương, bạch đàn dùng xông phòng',        1, 1),
(4, N'Tinh Dầu Dược Liệu',N'Tinh dầu tràm, tinh dầu gừng dùng trong trị liệu',        2, 1);

-- Danh mục con – Đặc Sản Khô (maDanhMucCha = 5)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(5, N'Hải Sản Khô',   N'Mực khô, tôm khô, cá khô, cua biển sấy',                        1, 1),
(5, N'Thịt Khô',      N'Bò một nắng, heo gác bếp, thịt trâu khô đặc sản vùng cao',      2, 1),
(5, N'Nông Sản Khô',  N'Tiêu Phú Quốc, quế Trà My, ớt khô, hạt sen khô miền Trung',     3, 1);

-- Danh mục con – Đồ Mỹ Nghệ (maDanhMucCha = 6)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(6, N'Đồ Gỗ Mỹ Nghệ', N'Tượng gỗ, bình hoa gỗ, tranh gỗ điêu khắc thủ công',         1, 1),
(6, N'Gốm Sứ',         N'Gốm Bát Tràng, gốm Thanh Hà, sứ Chu Đậu và gốm truyền thống', 2, 1),
(6, N'Tranh Thêu',     N'Tranh thêu tay Huế, tranh thêu phong cảnh và chân dung',       3, 1);

-- Danh mục con – Đông Y (maDanhMucCha = 7)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(7, N'Thảo Dược Khô',  N'Đinh lăng, đương quy, hoàng kỳ, các vị thuốc khô',           1, 1),
(7, N'Cao Dược Liệu',  N'Cao xương, cao đinh lăng, cao bạch hoa xà thiệt thảo',        2, 1);

-- Danh mục con – Vải (maDanhMucCha = 8)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(8, N'Vải Thổ Cẩm',    N'Thổ cẩm các dân tộc Tây Nguyên, vải dệt thủ công truyền thống', 1, 1),
(8, N'Lụa',            N'Lụa Mã Châu Quảng Nam, lụa tơ tằm tự nhiên cao cấp',             2, 1);

-- ► 3. SanPham – mỗi danh mục con có 2–3 sản phẩm mẫu
-- Bánh (maDanhMuc = 9)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(9,  N'Bánh Khô Mè Bà Liễu Mẹ', N'Bánh khô mè bà Liễu Mẹ đặc sản Đà Nẵng', N'bột gạo, bột nếp, đường, gừng, mè', N'Đà Nẵng', N'Nam Trung Bộ', 99000);

-- Kẹo (maDanhMuc = 10)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(10, N'Kẹo Mè Xửng Thiên Hương', N'Kẹo mè xửng đặc trưng xứ Huế', N'Mè, đường, mạch nha, đậu phộng, bánh tráng, bột gạo, vani', N'Thừa Thiên Huế', N'Bắc Trung Bộ', 55000);

-- Đá Thô Tự Nhiên (maDanhMuc = 11)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(11, N'Hang Thạch Anh Tím Nguyên Khối', N'Đá thạch anh tím tự nhiên thu hút tài lộc', N'Thạch anh tím tự nhiên', N'Đắk Lắk', N'Tây Nguyên', 17000000);

-- Đá Chế Tác (maDanhMuc = 12)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(12, N'Quả Cầu Phong Thủy Phong Thủy', N'Quả cầu ngọc phong thủy được chế tác từ các tinh thể thạch anh được tìm thấy trong mỏ sắt-mangan ở Đức Lập, Hà Tĩnh ', N'Thạch anh hồng tự nhiên', N'Hà Tĩnh', N'Bắc Trung Bộ', 1800000);

-- Trà Xanh (maDanhMuc = 13)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(13, N'Trà Sâm Dứa Hoa Lài Trà Tiên',    N'Vị thơm của từng búp chè non hoà quyện cùng lá dứa và hoa lài sẽ mang lại cảm giác khó quên khi thưởng thức', N'Trà búp xanh, trà tiên, lá dứa, hoa lài',   N'Đà Nẵng', N'Nam Trung Bộ', 120000);

-- Trà Thảo Mộc (maDanhMuc = 14)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(14, N'Trà Linh Chi Thảo Mộc',  N'Trà nấm Linh Chi được biết đến là dòng dược liệu có khả năng chữa trị được bách bệnh', N'Nấm Linh Chi, gạo lức, đậu đen xanh lòng, đậu đỏ,cam thảo, và hoa lài', N'Quảng Ngãi', N'Duyên hải Nam Trung Bộ', 149000);

-- Trà Ướp Hoa (maDanhMuc = 15)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(15, N'Trà Sen Huế Thượng Hạng',   N'Trà ướp sen hồ Tịnh Tâm theo phương pháp cổ truyền', N'Trà xanh, nhụy sen tươi', N'Thừa Thiên Huế', N'Bắc Trung Bộ', 450000);

-- Tinh Dầu Thơm (maDanhMuc = 16)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(16, N'Tinh Dầu Sả Chanh Quảng Nam', N'Tinh dầu sả chanh hữu cơ xông phòng, đuổi muỗi', N'Sả chanh tươi chưng cất', N'Quảng Nam', N'Nam Trung Bộ', 130000);

-- Tinh Dầu Dược Liệu (maDanhMuc = 17)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(17, N'Tinh Dầu Tràm Huế',          N'Tinh dầu tràm nguyên chất từ vùng đầm phá Huế',  N'Lá tràm chưng cất thủ công', N'Thừa Thiên Huế', N'Bắc Trung Bộ', 95000);

-- Hải Sản Khô (maDanhMuc = 18)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(18, N'Mực Khô Lý Sơn Đại',         N'Mực khô đại cỡ đảo Lý Sơn đánh bắt tự nhiên', N'Mực ống tươi phơi nắng',  N'Quảng Ngãi', N'Nam Trung Bộ', 380000);

-- Thịt Khô (maDanhMuc = 19)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(19, N'Bò Một Nắng Phú Yên',        N'Bò một nắng chấm muối kiến vàng đặc sản Phú Yên', N'Thịt bò tươi, muối, gia vị', N'Phú Yên', N'Nam Trung Bộ', 480000);

-- Nông Sản Khô (maDanhMuc = 20)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(20, N'Quế Trà My Nguyên Thanh',    N'Quế thanh dài thơm cay đặc trưng Trà My',         N'Quế tự nhiên vùng cao',    N'Quảng Nam', N'Nam Trung Bộ', 95000);

-- Đồ Gỗ Mỹ Nghệ (maDanhMuc = 21)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(21, N'Tượng Phật Gỗ Trầm Hương',   N'Tượng Phật điêu khắc thủ công từ gỗ trầm hương', N'Gỗ trầm hương tự nhiên',   N'Khánh Hòa', N'Nam Trung Bộ', 1800000);

-- Gốm Sứ (maDanhMuc = 22)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(22, N'Ấm Trà Gốm Thanh Hà',        N'Ấm trà gốm thủ công làng Thanh Hà Hội An',        N'Đất sét đỏ nung thủ công',  N'Quảng Nam', N'Nam Trung Bộ', 280000);

-- Tranh Thêu (maDanhMuc = 23)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(23, N'Tranh Thêu Hoa Sen Huế',      N'Tranh thêu tay hoa sen cỡ 40x60cm tinh xảo',      N'Chỉ tơ lụa, vải canvas',    N'Thừa Thiên Huế', N'Bắc Trung Bộ', 550000);

-- Thảo Dược Khô (maDanhMuc = 24)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(24, N'Đinh Lăng Rừng Quảng Bình',  N'Rễ đinh lăng rừng nguyên chất tăng cường sức khỏe', N'Rễ đinh lăng khô',         N'Quảng Bình', N'Bắc Trung Bộ', 165000);

-- Cao Dược Liệu (maDanhMuc = 25)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(25, N'Cao Chè Vằng', N'Đặc sản thảo dược nổi tiếng, được chiết xuất 100% từ lá cây chè vằng sẻ tự nhiên',          N'Lá cây chè vằng sẻ tự nhiên',  N'Quảng Trị', N'Bắc Trung Bộ', 320000);

-- Vải Thổ Cẩm (maDanhMuc = 26)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(26, N'Vải Thổ Cẩm Ba Na 1 Mét',    N'Thổ cẩm dệt tay của người Ba Na hoa văn truyền thống', N'Sợi cotton nhuộm tự nhiên', N'Kon Tum', N'Tây Nguyên', 240000);

-- Lụa (maDanhMuc = 27)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(27, N'Lụa Tơ Tằm Mã Châu 1 Mét',  N'Lụa Mã Châu mịn óng ánh dệt thủ công từ Quảng Nam',  N'Tơ tằm tự nhiên',          N'Quảng Nam', N'Nam Trung Bộ', 350000);


-- ► 4. BienThe – sửa lại maSanPham đúng theo 19 sản phẩm thực tế
-- maSanPham thực tế:
-- 1=Bánh In, 2=Kẹo Mè Xửng, 3=Đá Thạch Anh Tím, 4=Vòng Tay Thạch Anh Hồng
-- 5=Trà Xanh Cổ Thụ, 6=Trà Atiso, 7=Trà Sen Huế
-- 8=Tinh Dầu Sả Chanh, 9=Tinh Dầu Tràm
-- 10=Mực Khô Lý Sơn, 11=Bò Một Nắng, 12=Quế Trà My
-- 13=Tượng Phật Gỗ, 14=Ấm Trà Gốm, 15=Tranh Thêu Hoa Sen
-- 16=Đinh Lăng Rừng, 17=Cao Đinh Lăng Mật Ong
-- 18=Vải Thổ Cẩm Ba Na, 19=Lụa Tơ Tằm Mã Châu

-- Bánh khô mè (1)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(1, N'250g', N'Hộp', 99000,  120, '2025-12-31'),
(1, N'500g', N'Hộp', 155000,  80, '2025-12-31');

-- Kẹo Mè Xửng (2)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(2, N'200g', N'Túi', 55000,  150, '2026-01-31'),
(2, N'400g', N'Túi', 115000,  150, '2026-01-31');

-- Hang Thạch Anh Tím Nguyên Khối (3)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(3, N'3-5kg', N'Nguyên khối', 17000000, 30),
(3, N'5-8kg',   N'Nguyên khối', 28000000, 15);

-- Quả cầu Đá Thạch Anh Hồng (4)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(4, N'Size S', N'Hộp nhung', 1800000, 80),
(4, N'Size M', N'Hộp nhung', 1800000, 90);

-- Trà Sâm Dứa Hoa Lài (5)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(5, N'200g', N'Túi zip',   120000, 200, '2026-12-31'),
(5, N'500g', N'Túi',   230000, 200, '2026-12-31'),
(5, N'150g', N'Hộp', 100000, 100, '2026-12-31');

-- Trà Linh Chi (6)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(6, N'20 túi', N'Hộp',  149000, 180, '2026-09-30'),
(6, N'120g', N'Hộp', 155000,  90, '2026-09-30');

-- Trà Sen Huế Thượng Hạng (7)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(7, N'50g',  N'Hộp gỗ', 450000, 40, '2025-12-31'),
(7, N'100g', N'Hộp gỗ', 850000, 20, '2025-12-31');

-- Tinh Dầu Sả Chanh Quảng Nam (8)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(8, N'10ml', N'Chai thủy tinh', 130000, 100),
(8, N'30ml', N'Chai thủy tinh', 320000,  50);

-- Tinh Dầu Tràm Huế (9)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(9, N'10ml', N'Chai thủy tinh',  95000, 200),
(9, N'30ml', N'Chai thủy tinh', 240000, 100);

-- Mực Khô Lý Sơn (10)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(10, N'200g', N'Túi hút chân không', 380000, 80, '2026-06-30'),
(10, N'500g', N'Túi hút chân không', 880000, 35, '2026-06-30');

-- Bò Một Nắng Phú Yên (11)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(11, N'300g', N'Hộp xốp + màng co', 480000, 60, '2025-12-31'),
(11, N'500g', N'Hộp xốp + màng co', 750000, 30, '2025-12-31');

-- Quế Trà My (12)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(12, N'100g', N'Túi zip',  95000, 200, '2026-12-31'),
(12, N'250g', N'Hộp gỗ',  220000,  80, '2026-12-31');

-- Tượng Phật Gỗ Trầm Hương (13)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(13, N'Cỡ nhỏ 15cm', N'Hộp gỗ', 1800000, 15),
(13, N'Cỡ vừa 25cm', N'Hộp gỗ', 3200000,  8);

-- Ấm Trà Gốm Thanh Hà (14)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(14, N'400ml', N'Hộp gỗ', 280000, 40),
(14, N'600ml', N'Hộp gỗ', 380000, 25);

-- Tranh Thêu Hoa Sen Huế (15)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(15, N'40x60cm', N'Đóng khung', 550000, 20),
(15, N'60x80cm', N'Đóng khung', 850000, 10);

-- Đinh Lăng Rừng Quảng Bình (16)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(16, N'200g', N'Túi zip', 165000, 120, '2026-12-31'),
(16, N'500g', N'Túi zip', 380000,  50, '2026-12-31');

-- Cao Chè Vằng (17)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(17, N'500g', N'Hộp', 320000, 70, '2026-06-30'),
(17, N'1kg', N'Hộp', 580000, 35, '2026-06-30');

-- Vải Thổ Cẩm Ba Na (18)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(18, N'1 mét', N'Cuộn', 240000, 60),
(18, N'3 mét', N'Cuộn', 680000, 25);

-- Lụa Tơ Tằm Mã Châu (19)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon) VALUES
(19, N'1 mét', N'Cuộn',       350000, 50),
(19, N'3 mét', N'Cuộn',       990000, 20);


-- ► 5. Voucher
INSERT INTO Voucher (maCode, loaiGiam, giaTriGiam, donHangToiThieu, soLuongTon, ngayBatDau, ngayHetHan)
VALUES
(N'WELCOME10',   N'phanTram', 10,     0,       500, '2025-01-01', '2026-12-31'),
(N'SALE50K',     N'soTien',   50000,  300000,  200, '2025-06-01', '2025-12-31'),
(N'VIP15',       N'phanTram', 15,     500000,  100, '2025-01-01', '2026-06-30'),
(N'TETTRUNG25',  N'phanTram', 25,     800000,  50,  '2025-09-01', '2025-10-31'),
(N'FREESHIP30K', N'soTien',   30000,  150000,  300, '2025-01-01', '2026-12-31');


-- ► 6. GioHang (5 dòng mẫu)
INSERT INTO GioHang (maNguoiDung, maBienThe, soLuong, donGia)
VALUES
(5, 1,  2, 85000),
(5, 21, 1, 380000),
(6, 37, 1, 320000),
(7, 9,  1, 180000),
(8, 15, 2, 450000);


-- ► 7. ComboQuaTang (5 combo mẫu)
INSERT INTO ComboQuaTang (maNguoiDung, tenCombo, loaiCombo, dipLe, loiNhan, tongTienTamTinh, trangThaiCombo)
VALUES
(5,  N'Quà Tết Dành Cho Mẹ',         N'nguyenDan',  N'Tết Nguyên Đán 2026', N'Chúc mẹ năm mới sức khỏe dồi dào!', 850000,  N'luuTam'),
(6,  N'Combo Quà Trung Thu',     N'trungThu',   N'Trung Thu 2025',       N'Trăng thu rằm tháng tám sen vàng',   1200000, N'daDatHang'),
(7,  N'Quà Sinh Nhật',  N'sinhNhat',   N'Sinh nhật Lan',        N'Happy Birthday nhớ mày nhiều!',      560000,  N'luuTam'),
(8,  N'Quà Biếu Sếp',       N'quaBieu',    N'Kỷ niệm công ty',      N'Kính chúc sức khỏe và thịnh vượng', 2500000, N'daDatHang'),
(10, N'Combo Đặc Sản',       N'khac',       N'Quà tặng bạn bè',      N'Hương vị miền Trung gửi đến bạn',    780000,  N'luuTam');

-- ► 8. ChiTietCombo (mỗi combo 2 dòng)
INSERT INTO ChiTietCombo (maCombo, maBienThe, soLuong, donGia, thanhTien, ghiChuSanPham)
VALUES
(1, 1,  1, 155000, 155000, N'Bánh khô mè hộp lớn cho mẹ'),
(1, 5,  1, 120000, 120000, N'Trà sâm dứa lài thơm ngon'),
(2, 7, 1, 450000, 450000, N'Trà sen thượng hạng'),
(2, 2,  2, 85000,  170000, N'Kẹo mè xừng cho bà'),
(3, 19,  1, 180000, 180000, N'Lụa tơ tằm cao cấp tặng bạn gái'),
(3, 6, 1, 95000,  95000,  N'Trà linh chi thảo mộc bổ dưỡng'),
(4, 13, 1, 1800000,1800000,N'Tượng Phật trang trọng'),
(4, 16, 1, 320000, 320000, N'Cao đinh lăng bổ sức'),
(5, 10, 1, 380000, 380000, N'Mực khô ngon nhất Lý Sơn'),
(5, 12, 1, 95000,  95000,  N'Quế thơm đặc trưng');


-- ► 9. DonHang (5 đơn hàng mẫu)
INSERT INTO DonHang (
    maNguoiDung, maVoucher, maCombo,
    hoTenNguoiNhan, soDienThoaiNguoiNhan, diaChiGiaoHang, quanHuyen, tinhThanhGiaoHang,
    trangThaiDonHang, tongTienHang, tienGiam, phiVanChuyen, tongThanhToan,
    phuongThucThanhToan, trangThaiThanhToan, ngayThanhToan, maNhanVienXuLy
)
VALUES
(5,  1,    NULL, N'Hoàng Thị Lan',  '0912345605', N'45 Lê Lợi', N'Hải Châu',  N'Đà Nẵng',
     N'daGiao',    550000,  55000,  25000,  520000,  N'COD',            N'thanhCong',    '2025-10-05 14:30:00', 3),
(6,  NULL, 2,    N'Nguyễn Thu Hà',  '0901234599', N'12 Nguyễn Trãi', N'Thanh Khê', N'Đà Nẵng',
     N'daGiao',    1250000, 0,      30000,  1280000, N'chuyenKhoan',    N'thanhCong',    '2025-09-20 09:15:00', 3),
(7,  2,    NULL, N'Đặng Thị Mai',   '0923456707', N'78 Trần Phú', N'Hoàn Kiếm', N'Hà Nội',
     N'dangGiao',  560000,  50000,  40000,  550000,  N'vi',             N'thanhCong',    '2025-10-10 16:00:00', 4),
(8,  3,    4,    N'Bùi Trung Kiên', '0934567808', N'25 Hai Bà Trưng', N'Quận 1', N'Hồ Chí Minh',
     N'daGiao',    2500000, 375000, 0,      2125000, N'theTinDung',     N'thanhCong',    '2025-08-15 11:45:00', 3),
(10, NULL, NULL, N'Tô Văn Quân',    '0956789010', N'56 Phan Bội Châu', N'Hải Châu', N'Đà Nẵng',
     N'choXacNhan',475000,  0,      25000,  500000,  N'COD',            N'choThanhToan', NULL,                  NULL);


-- ► 10. ChiTietDonHang (mỗi đơn 2–3 dòng, kèm đánh giá cho đơn đã giao)
INSERT INTO ChiTietDonHang (maDonHang, maBienThe, soLuong, donGia, thanhTien, soSao, noiDungDanhGia, ngayDanhGia, daKiemDuyetDanhGia)
VALUES
-- Đơn 1 (đã giao, có đánh giá)
(1, 1,  2, 85000,  170000, 5, N'Bánh ngon đúng vị Huế, đóng gói đẹp, giao hàng nhanh!', '2025-10-07', 1),
(1, 21, 1, 380000, 380000, 4, N'Mực khô thơm, tuy hơi mặn nhưng chất lượng tốt.', '2025-10-07', 1),
-- Đơn 2 (đã giao, có đánh giá)
(2, 15, 1, 450000, 450000, 5, N'Trà sen Huế tuyệt hảo, thơm và thanh tuyệt vời!', '2025-09-22', 1),
(2, 1,  2, 85000,  170000, 5, N'Bánh khô mè ngon, tặng mẹ rất thích.', '2025-09-22', 1),
-- Đơn 3 (đang giao, chưa đánh giá)
(3, 9,  1, 180000, 180000, NULL, NULL, NULL, 0),
(3, 16, 1, 95000,  95000,  NULL, NULL, NULL, 0),
-- Đơn 4 (đã giao, có đánh giá)
(4, 29, 1, 1800000,1800000, 5, N'Tượng Phật gỗ trầm rất đẹp, đóng hộp cẩn thận, hài lòng 100%.', '2025-08-18', 1),
(4, 37, 1, 320000, 320000,  4, N'Cao đinh lăng chất lượng, nhưng lọ hơi nhỏ so với giá tiền.', '2025-08-18', 0),
-- Đơn 5 (chờ xác nhận, chưa đánh giá)
(5, 21, 1, 380000, 380000, NULL, NULL, NULL, 0),
(5, 26, 1, 95000,  95000,  NULL, NULL, NULL, 0);


-- ► 11. BlogAmThuc (5 bài viết mẫu)
INSERT INTO BlogAmThuc (maTacGia, tieuDe, moTa, noiDung, chuDe, tenTinh, trangThai)
VALUES
(2, N'Hành trình khám phá ẩm thực Huế Cổ Đô',
    N'Cố đô Huế sở hữu kho tàng ẩm thực phong phú từ cung đình đến dân gian',
    N'Huế không chỉ nổi tiếng với các di sản văn hóa mà còn là thiên đường ẩm thực...',
    N'Ẩm thực', N'Thừa Thiên Huế', 1),
(1, N'Đặc sản miền biển Đà Nẵng – Vị mặn mòi của biển khơi',
    N'Biển Đà Nẵng mang đến nguồn hải sản phong phú và các món ăn đậm đà',
    N'Đà Nẵng với bờ biển dài hơn 30km là kho tàng hải sản tươi ngon...',
    N'Hải sản', N'Đà Nẵng', 1),
(2, N'Trà Huế – Nghệ thuật thưởng trà của người xứ Cố Đô',
    N'Uống trà là nét văn hóa tinh tế của người Huế từ cung đình đến thường dân',
    N'Người Huế uống trà như một nghi lễ, từ cách pha, cách rót đến không gian thưởng thức...',
    N'Văn hóa', N'Thừa Thiên Huế', 1),
(1, N'Tây Nguyên và câu chuyện của những loài thảo dược quý',
    N'Đại ngàn Tây Nguyên ẩn chứa vô số thảo dược quý từ ngàn xưa',
    N'Từ rừng Kon Tum đến Đắk Lắk, người dân tộc bản địa đã biết sử dụng thảo dược...',
    N'Dược liệu', N'Kon Tum', 1),
(2, N'Hội An – Nơi lưu giữ hồn vải dệt truyền thống',
    N'Làng dệt lụa Mã Châu và làng gốm Thanh Hà là linh hồn của phố cổ Hội An',
    N'Cách Hội An 10km về phía nam, làng lụa Mã Châu vẫn giữ nguyên tiếng thoi đưa...',
    N'Làng nghề', N'Quảng Nam', 1);


-- ► 12. BlogSanPham (sửa lại maSanPham đúng 1-19)
INSERT INTO BlogSanPham (maBlog, maSanPham)
VALUES
(1, 1),   -- Blog Huế        → Bánh In Đậu Xanh Huế      (maSanPham=1)
(1, 7),   -- Blog Huế        → Trà Sen Huế Thượng Hạng    (maSanPham=7)
(2, 10),  -- Blog Đà Nẵng    → Mực Khô Lý Sơn             (maSanPham=10)
(2, 11),  -- Blog Đà Nẵng    → Bò Một Nắng Phú Yên        (maSanPham=11)
(3, 5),   -- Blog Trà        → Trà Xanh Cổ Thụ A Lưới     (maSanPham=5)
(3, 7),   -- Blog Trà        → Trà Sen Huế Thượng Hạng    (maSanPham=7)
(4, 16),  -- Blog Tây Nguyên → Đinh Lăng Rừng Quảng Bình  (maSanPham=16)
(4, 17),  -- Blog Tây Nguyên → Cao Đinh Lăng Mật Ong      (maSanPham=17)
(5, 19),  -- Blog Hội An     → Lụa Tơ Tằm Mã Châu         (maSanPham=19)
(5, 14);  -- Blog Hội An     → Ấm Trà Gốm Thanh Hà        (maSanPham=14)

GO

PRINT N'✔  Database DacSanMienTrung đã được tạo và insert dữ liệu mẫu thành công!';
GO