-- ============================================================
--  WEBSITE ĐẶC SẢN MIỀN TRUNG
--  Script: Xóa (nếu tồn tại) → Tạo lại Database → Tạo bảng → Insert dữ liệu
--  Chỉ cần nhấn Execute 1 lần là chạy hết
-- ============================================================

-- ► XÓA VÀ TẠO LẠI DATABASE
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DacSanMienTrung06')
BEGIN
    ALTER DATABASE DacSanMienTrung06 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DacSanMienTrung06;
END
GO

CREATE DATABASE DacSanMienTrung06
    COLLATE Vietnamese_CI_AS;
GO

USE DacSanMienTrung06;
GO

-- ============================================================
--  TẠO BẢNG
-- ============================================================

-- 1. NguoiDung
CREATE TABLE NguoiDung (
    maNguoiDung       INT            IDENTITY(1,1) PRIMARY KEY,
    hoTen             NVARCHAR(80)   NOT NULL,
    email             VARCHAR(150)   NOT NULL UNIQUE,
    matKhau           VARCHAR(50)   NOT NULL,
    soDienThoai       VARCHAR(11)    NULL,
    ngaySinh          DATE           NULL,
    diaChi            NVARCHAR(150) NOT NULL DEFAULT N'Chưa cập nhật',
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
    hinhAnh        NVARCHAR(255) NULL,
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

--13. HinhAnhSanPham
CREATE TABLE HinhAnhSanPham
(
    maHinhAnh INT IDENTITY PRIMARY KEY,
    maSanPham INT NOT NULL,
    duongDanAnh NVARCHAR(255) NOT NULL,
    thuTu INT DEFAULT 1,

    FOREIGN KEY (maSanPham)
        REFERENCES SanPham(maSanPham)
);

GO



-- ============================================================
--  INSERT DỮ LIỆU MẪU
-- ============================================================

-- ► 1. NguoiDung (2 admin, 2 nhân viên, 6 khách hàng)
INSERT INTO NguoiDung (hoTen, email, matKhau, soDienThoai, ngaySinh, vaiTro, trangThai, diemTichLuy, phanLoaiKhachHang, chucVu)
VALUES
(N'Nguyễn Văn An',    'admin.an@dacsan.vn',     'admin1', '0901234501', '1985-03-15', N'quantrivien', 1, 0,   NULL,        N'Quản trị viên hệ thống'),
(N'Trần Thị Bình',   'admin.binh@dacsan.vn',   'admin2', '0901234502', '1990-07-22', N'quantrivien', 1, 0,   NULL,        N'Quản trị viên nội dung'),
(N'Lê Minh Châu',    'nv.chau@dacsan.vn',      'nvien1', '0901234503', '1995-01-10', N'nhanvien',    1, 0,   NULL,        N'Nhân viên kho'),
(N'Phạm Quốc Dũng',  'nv.dung@dacsan.vn',      'nvien2', '0901234504', '1993-11-05', N'nhanvien',    1, 0,   NULL,        N'Nhân viên giao vận'),
(N'Hoàng Thị Lan',   'lan.hoang@gmail.com',    'lan123', '0912345605', '1992-06-18', N'khachhang',   1, 850, N'bạc',      NULL),
(N'Võ Thanh Hùng',   'hung.vo@gmail.com',      'hung123', '0912345606', '1988-12-30', N'khachhang',   1, 3200,N'vàng',     NULL),
(N'Đặng Thị Mai',    'mai.dang@yahoo.com',     'mai123', '0923456707', '1997-04-25', N'khachhang',   1, 150, N'thường',   NULL),
(N'Bùi Trung Kiên',  'kien.bui@gmail.com',     'kien123', '0934567808', '1991-09-14', N'khachhang',   1, 7500,N'kim cương', NULL),
(N'Ngô Thị Phương',  'phuong.ngo@gmail.com',   'phuong123', '0945678909', '1999-02-08', N'khachhang',   1, 0,   N'thường',   NULL),
(N'Tô Văn Quân',     'quan.to@outlook.com',    'quan123', '0956789010', '1986-08-19', N'khachhang',   1, 1200,N'bạc',      NULL);

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
(1, N'250g', N'Hộp', 99000,  120, '2026-12-31'),
(1, N'500g', N'Hộp', 155000,  80, '2026-12-31');

-- Kẹo Mè Xửng (2)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(2, N'200g', N'Túi', 55000,  150, '2027-01-31'),
(2, N'500g', N'Túi', 115000,  150, '2028-01-31');

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
(7, N'50g',  N'Hộp gỗ', 450000, 40, '2027-12-31'),
(7, N'100g', N'Hộp gỗ', 850000, 20, '2027-12-31');

-- Tinh Dầu Sả Chanh Quảng Nam (8)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(8, N'10ml', N'Chai thủy tinh', 130000, 100, '2027-12-31'),
(8, N'30ml', N'Chai thủy tinh', 320000,  50, '2027-12-31');

-- Tinh Dầu Tràm Huế (9)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(9, N'10ml', N'Chai thủy tinh',  95000, 200, '2027-12-31'),
(9, N'30ml', N'Chai thủy tinh', 240000, 100, '2027-12-31');

-- Mực Khô Lý Sơn (10)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(10, N'200g', N'Túi hút chân không', 380000, 80, '2026-06-30'),
(10, N'500g', N'Túi hút chân không', 880000, 35, '2026-06-30');

-- Bò Một Nắng Phú Yên (11)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(11, N'300g', N'Hộp xốp + màng co', 480000, 60, '2028-12-31'),
(11, N'500g', N'Hộp xốp + màng co', 750000, 30, '2028-12-31');

-- Quế Trà My (12)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung) VALUES
(12, N'100g', N'Túi zip',  95000, 200, '2026-12-31'),
(12, N'250g', N'Hũ thủy tinh',  220000,  80, '2026-12-31');

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
(16, N'75ml', N'Hũ thủy tinh', 165000, 120, '2026-12-31');

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
(N'SALE50K',     N'soTien',   50000,  300000,  200, '2025-06-01', '2026-12-31'),
(N'VIP15',       N'phanTram', 15,     500000,  100, '2025-01-01', '2026-06-30'),
(N'TETTRUNG25',  N'phanTram', 25,     800000,  50,  '2025-09-01', '2025-10-31'),
(N'FREESHIP30K', N'soTien',   30000,  150000,  300, '2025-01-01', '2027-12-31');

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
(1, 5,  1, 1700000, 170000, N'Hang thạch anh tím nguyên khối mang phỏng thủy tốt đến nhà của bạn'),
(2, 14, 1, 450000, 450000, N'Trà sen thượng hạng'),
(2, 3,  2, 55000,  110000, N'Kẹo mè xửng cho bà'),
(3, 38,  1, 350000, 350000, N'Lụa tơ tằm cao cấp tặng bạn gái'),
(3, 13, 1, 155000,  155000,  N'Trà linh chi thảo mộc bổ dưỡng'),
(4, 26, 1, 1800000,1800000,N'Tượng Phật trang trọng'),
(4, 33, 1, 380000, 380000, N'Cao đinh lăng bổ sức'),
(5, 20, 1, 380000, 380000, N'Mực khô ngon nhất Lý Sơn'),
(5, 24, 1, 95000,  95000,  N'Quế thơm đặc trưng');


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
(1, 1,  2, 99000,  198000, 5, N'Bánh ngon đúng vị, đóng gói đẹp, giao hàng nhanh!', '2025-10-07', 1),
(1, 20, 1, 380000, 380000, 4, N'Mực khô thơm, tuy hơi mặn nhưng chất lượng tốt.', '2025-10-07', 1),
-- Đơn 2 (đã giao, có đánh giá)
(2, 15, 1, 850000, 850000, 5, N'Trà sen Huế tuyệt hảo, thơm và thanh tuyệt vời!', '2025-09-22', 1),
(2, 1,  3, 99000,  265000, 5, N'Kẹo mè xửng ngon, tặng mẹ rất thích.', '2025-09-22', 1),
-- Đơn 3 (đang giao, chưa đánh giá)
(3, 9,  1, 120000, 120000, NULL, NULL, NULL, 0),
(3, 16, 1, 130000,  130000,  NULL, NULL, NULL, 0),
-- Đơn 4 (đã giao, có đánh giá)
(4, 26, 1, 1800000,1800000, 5, N'Tượng Phật gỗ trầm rất đẹp, đóng hộp cẩn thận, hài lòng 100%.', '2025-08-18', 1),
(4, 33, 1, 380000, 380000,  4, N'Cao đinh lăng chất lượng, nhưng lọ hơi nhỏ so với giá tiền.', '2025-08-18', 0),
-- Đơn 5 (chờ xác nhận, chưa đánh giá)
(5, 21, 1, 880000, 880000, NULL, NULL, NULL, 0),
(5, 38, 1, 990000,  990000,  NULL, NULL, NULL, 0);






GO

ALTER TABLE ChiTietDonHang
ADD CONSTRAINT CK_SoSao
CHECK (soSao BETWEEN 1 AND 5 OR soSao IS NULL);

PRINT N'✔  Database DacSanMienTrung đã được tạo và insert dữ liệu mẫu thành công!';
GO

SELECT * FROM NguoiDung
SELECT * FROM DanhMuc
SELECT * FROM SanPham
SELECT * FROM Bienthe
SELECT * FROM GioHang
SELECT * FROM Voucher
SELECT * FROM ComboQuaTang 
SELECT * FROM ChiTietCombo
SELECT * FROM DonHang
SELECT * FROM ChiTietDonHang
SELECT * FROM BlogAmThuc
SELECT * FROM BlogSanPham
SELECT * FROM HinhAnhSanPham




INSERT INTO HinhAnhSanPham (maSanPham, duongDanAnh, thuTu)
VALUES
-- 1. Bánh Khô Mè Bà Liễu Mẹ
(1, N'products/banh-kho-me-trang-ba-lieu-me-lam-qua-tai-da-nang.jpg', 1),
(1, N'products/banh-kho-me-250g.jpg', 2),
(1, N'products/banh-kho-me-500g.png', 3),

-- 2. Kẹo Mè Xửng Thiên Hương
(2, N'products/Đặc-sản-Huế-Mè-xửng-Thiên-Hương-Túi-màu-500gr-1.jpg', 1),
(2, N'products/me-xung-deo-hue-200g.jpg', 2),

-- 3. Hang Thạch Anh Tím Nguyên Khối
(3, N'products/hang_thanh_anh_tim.jpg', 1),
(3, N'products/hang-da-thach-anh-tim-3-5kg.jpg', 2),
(3, N'products/hang-thach-anh-tim-chieu-tai-114cm-348htt114-01.jpg', 3),
(3, N'products/da_phong_thuy.jpg', 4),

-- 4. Quả Cầu Phong Thủy / Thạch Anh Hồng
(4, N'products/qua-cau-thach-anh-hong.webp', 1),
(4, N'products/qua-cau-thach-anh-hong-size-s.webp', 2),
(4, N'products/y-nghia-qua-cau-thach-anh-hong.jpg', 3),

-- 5. Trà Sâm Dứa Hoa Lài Trà Tiên
(5, N'products/Tra-sam-dua-da-nang-chinh-goc-tra-tien.jpg', 1),
(5, N'products/tra_sam_dua_hop.jpg', 2),
(5, N'products/tra_sam_dua_lai_tui_loc.webp', 3),
(5, N'products/tra_sam_dua_tui_zip.jpg', 4),
(5, N'products/Tra-sam-dua-tui.jpg', 5),

-- 6. Trà Linh Chi Thảo Mộc
(6, N'products/tra_linh_chi.jpg', 1),
(6, N'products/tra_linh_chi_hop.jpg', 2),
(6, N'products/tra_linh_chi_tui_loc.webp', 3),

-- 7. Trà Sen Huế Thượng Hạng
(7, N'products/tra-sen.jpg', 1),
(7, N'products/tra-sen-hue.jpg', 2),
(7, N'products/tra-sen-hue.png', 3),

-- 8. Tinh Dầu Sả Chanh Quảng Nam
(8, N'products/sa-chanh-5ml-1-600x600.jpg', 1),
(8, N'products/tinh-dau-nguyen-chat-sa-chanh-10ml.jpg', 2),

-- 9. Tinh Dầu Tràm Huế
(9, N'products/tinh-dau-tram-hue-10ml.jpg', 1),
(9, N'products/dau-tram-cung-dinh-gold-50ml-0.jpg', 2),

-- 10. Mực Khô Lý Sơn Đại
(10, N'products/muc-kho-ly-son.jpg', 1),
(10, N'products/muc-kho-ly-son-100g.jpg', 2),
(10, N'products/muc-kho-ly-son-200g.jpg', 3),

-- 11. Bò Một Nắng Phú Yên
(11, N'products/bo_1_nang_diep_an_300g.jpg', 1),
(11, N'products/bo-1-nang-muoi-kien-vang-2.jpg', 2),
(11, N'products/bo-mot-nang-500g.jpg', 3),

-- 12. Quế Trà My Nguyên Thanh
(12, N'products/bot-que-tra-my-2678.jpg', 1),
(12, N'products/que-tra-my-cat-khuc_grande.jpg', 2),

-- 13. Tượng Phật Gỗ Trầm Hương
(13, N'products/tuong-phat-go-15cm.jpg', 1),
(13, N'products/tuong-go-tram-huong-20cm.webp', 2),
(13, N'products/tuong-go-tram-huong-phat-to-de-xe-hoi-1.webp', 3),

-- 14. Ấm Trà Gốm Thanh Hà
-- Hiện chưa thấy ảnh ấm trà gốm trong danh sách ảnh bạn gửi.
-- Tạm thời chưa insert, frontend sẽ dùng placeholder.

-- 15. Tranh Thêu Hoa Sen Huế
-- Hiện chưa thấy ảnh tranh thêu trong danh sách ảnh bạn gửi.
-- Tạm thời chưa insert, frontend sẽ dùng placeholder.

-- 16. Đinh Lăng Rừng Quảng Bình
(16, N'products/dinh_lang.webp', 1),
(16, N'products/cao-dinh-lang-ml.jpg', 2),

-- 17. Cao Chè Vằng
(17, N'products/Cao-che-vang.jpg', 1),
(17, N'products/Cao-che-vang-hu.jpg', 2),
(17, N'products/me-doan-cao-che-vang-250gr-1661950105191.webp', 3),

-- 18. Vải Thổ Cẩm Ba Na 1 Mét
(18, N'products/det-tho-cam-ba-na-2-5320.jpg', 1),
(18, N'products/tho-cam-27.jpg', 2),

-- 19. Lụa Tơ Tằm Mã Châu 1 Mét
(19, N'products/lua_ma_chau.jpg', 1);


USE DacSanMienTrung06;
GO

IF COL_LENGTH('SanPham', 'hinhAnh') IS NULL
BEGIN
    ALTER TABLE SanPham ADD hinhAnh NVARCHAR(255) NULL;
END
GO

UPDATE sp
SET sp.hinhAnh = ha.duongDanAnh
FROM SanPham sp
OUTER APPLY (
    SELECT TOP 1 duongDanAnh
    FROM HinhAnhSanPham ha
    WHERE ha.maSanPham = sp.maSanPham
    ORDER BY ha.thuTu ASC, ha.maHinhAnh ASC
) ha
WHERE ha.duongDanAnh IS NOT NULL;
GO


-- Ảnh danh mục cha
UPDATE DanhMuc
SET hinhAnh = N'categories/danh-muc-banh-keo.jpg'
WHERE maDanhMuc = 1;

UPDATE DanhMuc
SET hinhAnh = N'categories/danh-mucda-phong-thuy.png'
WHERE maDanhMuc = 2;

UPDATE DanhMuc
SET hinhAnh = N'categories/danh-muc-tra.jpg'
WHERE maDanhMuc = 3;

UPDATE DanhMuc
SET hinhAnh = N'categories/danh-muc-tinh-dau.jpg'
WHERE maDanhMuc = 4;

UPDATE DanhMuc
SET hinhAnh = N'categories/danh-muc-dac-san-kho.jpg'
WHERE maDanhMuc = 5;

UPDATE DanhMuc
SET hinhAnh = N'categories/danh-muc-do-my-nghe.jpg'
WHERE maDanhMuc = 6;

UPDATE DanhMuc
SET hinhAnh = N'categories/danh-muc-dong-y.webp'
WHERE maDanhMuc = 7;

UPDATE DanhMuc
SET hinhAnh = N'categories/danh-muc-vai.jpg'
WHERE maDanhMuc = 8;



-- ► 11. BlogAmThuc (5 bài viết mẫu - nội dung hoàn chỉnh)
INSERT INTO BlogAmThuc (maTacGia, tieuDe, moTa, noiDung, chuDe, tenTinh, trangThai)
VALUES
(
  2,
  N'Hành trình khám phá ẩm thực Huế Cổ Đô',
  N'Cố đô Huế sở hữu kho tàng ẩm thực phong phú từ cung đình đến dân gian',
  N'<h2>Dấu ấn lịch sử trên từng đĩa thức ăn</h2>
<p>Huế không chỉ nổi tiếng với các di sản văn hóa mà còn là thiên đường ẩm thực mang đậm dấu ấn cung đình và dân gian hòa quyện. Trong suốt hơn 150 năm là kinh đô của triều Nguyễn (1802–1945), Huế đã phát triển một nền ẩm thực cung đình hoàn chỉnh với những quy tắc chặt chẽ về hình thức, màu sắc và hương vị. Mỗi bữa ăn của vua được phục vụ đến 50 món trở lên, bày trên mâm son thếp vàng, do các đầu bếp cung đình — gọi là "thượng thiện" — phụ trách. Ngày nay, những tinh hoa đó đã lan tỏa ra dân gian, trở thành món ăn quen thuộc của người Huế trên từng góc phố.</p>

<h2>Bún bò Huế — linh hồn của buổi sáng cố đô</h2>
<p>Nhắc đến Huế mà bỏ qua bún bò là một thiếu sót không thể tha thứ. Khác với phở Hà Nội thanh tao hay hủ tiếu Nam Bộ ngọt lịm, bún bò Huế mang vị đậm đà riêng biệt: nước dùng được ninh từ xương bò nhiều giờ, quyện cùng mắm ruốc Huế, sả, gừng và ớt tươi. Màu đỏ cam rực rỡ của tô bún không chỉ hấp dẫn mắt mà còn báo hiệu độ cay nồng đặc trưng khiến thực khách vừa ăn vừa xuýt xoa. Tô bún đầy đủ phải có bắp bò, chả Huế, huyết và móng giò, ăn kèm rổ rau sống gồm bắp chuối bào, giá, húng quế và chanh tươi.</p>

<h2>Nem lụi, bánh khoái và những đặc sản không thể bỏ lỡ</h2>
<p>Dọc bờ sông Hương và trong các ngõ hẻm quanh Thành Nội, mùi khói than hồng từ những xiên nem lụi nướng luôn là sức hút khó cưỡng. Nem lụi Huế được làm từ thịt heo xay, quết với mỡ, tỏi và các gia vị bí truyền, nhào nặn quanh cọng sả rồi nướng trực tiếp trên than hoa. Ăn kèm với bánh tráng mỏng, rau sống và tương đậu phộng ngọt ngào — đây là sự kết hợp hoàn hảo giữa những nguyên liệu giản dị nhất.</p>
<p>Bánh khoái — người anh em giòn rụm của bánh xèo — cũng là một đặc sản không thể bỏ qua. Nhỏ hơn bánh xèo miền Nam, bánh khoái Huế giòn tan, nhân tôm tươi, thịt và giá đỗ, ăn cùng nước lèo sền sệt pha từ gan heo và đậu phộng. Nổi tiếng nhất là hàng bánh khoái dưới chân cầu Trường Tiền, nơi người dân địa phương xếp hàng từ xế chiều.</p>
<h2>Ẩm thực cung đình — tinh hoa còn lưu giữ</h2>
<p>Nhiều nhà hàng trong nội thành Huế ngày nay vẫn phục dựng những bữa tiệc cung đình với đầy đủ nghi lễ: khăn ăn thêu hoa, đũa ngà, âm nhạc nhã nhạc vang lên trong không gian bài trí theo phong cách hoàng cung. Các món như cơm hến, chả tôm Huế, bánh bèo, bánh nậm, bánh lọc — thoạt nhìn nhỏ bé nhưng đòi hỏi kỹ thuật chế biến tỉ mỉ đến từng chi tiết — đều có nguồn gốc từ những bàn tay khéo léo của các nghệ nhân thượng thiện xưa.</p>

<h2>Lời kết của một người lữ hành</h2>
<p>Ẩm thực Huế không phải là thứ bạn có thể cảm nhận hết trong một lần ghé thăm. Mỗi món ăn là một tầng ký ức, một câu chuyện dài về lịch sử, con người và văn hóa. Hãy đến Huế với một cái bụng trống và một tâm hồn rộng mở — cố đô sẽ chiêu đãi bạn theo cách không thể quên.',
  N'Ẩm thực',
  N'Thừa Thiên Huế',
  1
),

(
  1,
  N'Đặc sản miền biển Đà Nẵng – Vị mặn mòi của biển khơi',
  N'Biển Đà Nẵng mang đến nguồn hải sản phong phú và các món ăn đậm đà',
  N'<h2>Vùng biển giàu có — kho báu dưới lòng đại dương</h2>
<p>Đà Nẵng với bờ biển dài hơn 30 km là kho tàng hải sản tươi ngon bậc nhất miền Trung. Nằm ở vị trí địa lý đặc biệt, nơi dòng biển lạnh và dòng biển ấm giao thoa, vùng biển Đà Nẵng tạo ra một hệ sinh thái đa dạng với hàng trăm loài cá, tôm, cua, mực và các loài nhuyễn thể quý hiếm. Mỗi sáng sớm, ngư dân từ các làng chài Nam Ô, Mân Thái, Thọ Quang kéo lưới về bến, mang theo những khoang thuyền đầy ắp tôm hùm, cá thu, cá ngừ, ghẹ xanh còn nhảy tanh tách.</p>

<h2>Mì Quảng hải sản — bản hòa tấu của đất và biển</h2>
<p>Mì Quảng là linh hồn ẩm thực của cả vùng đất Quảng Nam – Đà Nẵng, nhưng phiên bản hải sản tại đây mang một đẳng cấp riêng. Những sợi mì vàng tươi, dày dặn, được làm từ bột gạo ngâm, tráng mỏng rồi thái sợi — ăn kèm với tôm tươi, cua thịt, trứng cút, rau sống và bánh tráng nướng giòn. Nước nhân đậm đà nhưng không nhiều, chỉ đủ thấm vào từng sợi mì — đây là điểm khác biệt lớn nhất so với các loại mì nước khác.</p>

<h2>Bánh tráng cuốn thịt heo — niềm tự hào dân dã</h2>
<p>Người Đà Nẵng tự hào gọi đây là đặc sản quốc dân của thành phố. Bánh tráng mỏng dai, thịt heo luộc vừa chín tới, rau sống đủ loại — húng lủi, xà lách, dưa leo, chuối xanh — cuốn chặt rồi chấm vào bát mắm nêm đặc trưng pha tỏi ớt. Sự kết hợp tưởng chừng đơn giản này lại tạo ra một vũ trụ hương vị hoàn chỉnh: béo, tươi, giòn, chua, cay và mặn — tất cả trong một miếng cuốn.</p>

<h2>Các món hải sản tươi sống — chân chất mà sang</h2>
<p>Dọc tuyến đường Hoàng Sa, Trường Sa và khu vực bãi biển Mỹ Khê, hàng trăm nhà hàng hải sản phục vụ nguyên liệu tươi ngay từ thuyền ngư dân. Tôm hùm hấp nước dừa, cua Huỳnh Đế rang muối, ghẹ hấp gừng lá sả, mực một nắng nướng mỡ hành — những món này không cần kỹ thuật chế biến cầu kỳ, chỉ cần nguyên liệu thật tươi và bàn tay khéo léo của đầu bếp là đã chinh phục mọi thực khách.</p>

<h2>Nam Ô — làng nghề nước mắm trăm tuổi</h2>
<p>Không thể nói về ẩm thực Đà Nẵng mà bỏ qua làng Nam Ô — nơi sản xuất nước mắm truyền thống đã tồn tại hơn 100 năm. Nước mắm Nam Ô được làm hoàn toàn từ cá cơm than, ủ trong lu sành theo phương pháp cổ truyền trong 12–18 tháng. Màu đỏ cánh gián, hương thơm nồng nàn và vị mặn ngọt hài hòa — giọt nước mắm Nam Ô là linh hồn không thể thiếu trong bếp ăn người dân Đà Nẵng và cả miền Trung.</p>

<h2>Một thành phố biển đáng để trở lại</h2>
<p>Đà Nẵng đang ngày càng khẳng định vị thế là điểm đến ẩm thực hàng đầu miền Trung. Từ những quán ăn vỉa hè bình dị đến các nhà hàng cao cấp view biển, thành phố này luôn có cách chiều lòng mọi thực khách — bởi nguyên liệu tươi ngon từ biển cả chưa bao giờ là thứ Đà Nẵng thiếu.</p>',
  N'Hải sản',
  N'Đà Nẵng',
  1
),

(
  2,
  N'Trà Huế – Nghệ thuật thưởng trà của người xứ Cố Đô',
  N'Uống trà là nét văn hóa tinh tế của người Huế từ cung đình đến thường dân',
  N'<h2>Trà trong cung đình Nguyễn — khởi nguồn của một mỹ tục</h2>
<p>Người Huế uống trà như một nghi lễ, từ cách pha, cách rót đến không gian thưởng thức — tất cả đều mang chiều sâu văn hóa hàng trăm năm. Dưới triều Nguyễn, trà không đơn giản là thức uống — đó là một phần trong nghi lễ cung đình. Vua Minh Mạng và vua Thiệu Trị đặc biệt yêu thích trà, và có hẳn đội ngũ chuyên trách việc tuyển chọn, bảo quản và pha chế trà theo đúng quy chuẩn cung đình. Trà được pha bằng nước sương mai thu từ lá sen trên hồ Tịnh Tâm, đun sôi trong ấm đồng, rót ra chén sứ men ngọc lam mỏng như giấy. Phong cách này dần lan ra dân gian và trở thành nét văn hóa bền bỉ của người Huế.</p>

<h2>Bộ trà — tinh tế đến từng chi tiết</h2>
<p>Người Huế sành trà có thể bỏ ra nhiều tháng tiền lương chỉ để sở hữu một bộ ấm chén Tử Sa Nghi Hưng từ Trung Quốc, hoặc bộ chén bạch sứ Huế tráng men trong vắt do các nghệ nhân làng Phước Tích chế tác. Bộ trà đủ chuẩn gồm: ấm pha dung tích nhỏ thường 100–150 ml, chén tống để rót trà ra tập trung trước khi chia đều, chén uống nhỏ như lòng bàn tay vừa một ngụm, khay trà bằng gỗ sơn mài hoặc mây tre đan, và hộp đựng trà bằng thiếc hay gốm.</p>

<h2>Nghệ thuật pha trà — khi kiên nhẫn trở thành thiền định</h2>
<p>Quy trình pha một ấm trà đúng kiểu Huế có thể kéo dài 15–20 phút. Đầu tiên, tráng ấm chén bằng nước sôi để làm nóng dụng cụ và khử mùi lạ. Tiếp theo, cho trà vào ấm — người Huế ưa trà móc câu, trà đinh hay trà ướp hoa nhài, hoa sen — lượng trà chiếm khoảng 1/3 thể tích ấm. Rót nước sôi lần đầu vào rồi đổ đi ngay để đánh thức lá trà. Lần rót thứ hai mới là ấm trà thật sự — để ngấm đúng 60–90 giây tùy loại trà, rồi rót đều ra chén tống, sau đó phân đều vào từng chén nhỏ.</p>

<h2>Không gian thưởng trà — yếu tố quyết định hồn trà</h2>
<p>Người Huế tin rằng trà ngon một phần, không gian ngon chín phần. Những căn nhà vườn Huế cổ kính với hàng chè tàu xanh mướt, giàn hoa giấy đỏ thắm và tiếng chim hót xa xa chính là không gian lý tưởng để thưởng trà. Trà được uống trong yên lặng hoặc trong tiếng đàn tranh nhẹ nhàng, tuyệt đối không ồn ào, không vội vã. Một buổi trà chiều thường kéo dài 2–3 giờ đồng hồ với nhiều ấm trà nối tiếp nhau.</p>

<h2>Trà sen Huế — đỉnh cao của nghệ thuật ướp trà</h2>
<p>Nếu có một loại trà đại diện cho tinh thần Huế, đó chắc chắn là trà sen. Mỗi năm chỉ một mùa sen nở trên đầm Tịnh Tâm và các ao sen quanh thành nội, người Huế thức từ 4 giờ sáng để nhẹ nhàng bỏ trà vào từng bông sen còn đọng sương, buộc lại để trà hút trọn hương hoa trong vài giờ. Mỗi lạng trà sen đòi hỏi hàng trăm bông hoa và hàng chục giờ lao động tỉ mỉ — đó là lý do trà sen Huế có giá từ vài trăm nghìn đến hàng triệu đồng mỗi lạng, nhưng người sành trà vẫn sẵn sàng chi trả.</p>

<h2>Văn hóa trà trong đời sống hiện đại</h2>
<p>Dù nhịp sống hiện đại đang thay đổi nhiều thứ, văn hóa trà Huế vẫn được thế hệ trẻ trân trọng và kế thừa. Nhiều quán trà đạo theo phong cách cổ truyền mở ra ở trung tâm thành phố, thu hút không chỉ người lớn tuổi mà cả các bạn trẻ tìm về với sự chậm rãi, tĩnh lặng giữa cuộc sống xô bồ. Trà Huế — hơn cả một thức uống — là lời nhắc nhở về nghệ thuật sống chậm, sống có chiều sâu.</p>',
  N'Văn hóa',
  N'Thừa Thiên Huế',
  1
),

(
  1,
  N'Tây Nguyên và câu chuyện của những loài thảo dược quý',
  N'Đại ngàn Tây Nguyên ẩn chứa vô số thảo dược quý từ ngàn xưa',
  N'<h2>Đại ngàn — nơi thiên nhiên còn giữ bí mật</h2>
<p>Từ rừng Kon Tum đến Đắk Lắk, người dân tộc bản địa đã biết sử dụng thảo dược từ ngàn đời để chữa bệnh và bồi bổ sức khỏe. Tây Nguyên là một trong số ít vùng lãnh thổ ở Đông Nam Á còn lưu giữ được những khu rừng nguyên sinh quy mô lớn. Theo thống kê của Viện Dược liệu Việt Nam, riêng khu vực Tây Nguyên đã ghi nhận hơn 1.500 loài cây có tác dụng dược lý, trong đó nhiều loài chỉ tồn tại ở đây và không thể tìm thấy ở bất kỳ đâu khác trên thế giới.</p>

<h2>Tri thức bản địa — di sản vô giá đang dần mai một</h2>
<p>Người Ba Na ở Kon Tum, người Gia Rai ở Gia Lai, người Ê Đê ở Đắk Lắk — mỗi tộc người đều sở hữu một kho tri thức y học dân gian phong phú được truyền miệng qua nhiều thế hệ. Các già làng và thầy thuốc bản địa biết cách dùng lá cây, rễ cây, vỏ cây để chữa từ những bệnh thông thường như sốt, ho, đau bụng đến những bệnh mãn tính như viêm khớp, tiểu đường, cao huyết áp. Tiếc thay, kho tri thức quý báu này đang dần thất truyền khi lớp người cao tuổi ra đi mà không kịp truyền dạy cho thế hệ kế tiếp.</p>

<h2>Sâm Ngọc Linh — báu vật quốc gia</h2>
<p>Trong số tất cả các loài thảo dược Tây Nguyên, Sâm Ngọc Linh (Panax vietnamensis) xứng đáng được gọi là báu vật quốc gia. Chỉ mọc ở độ cao từ 1.500m trở lên trên dãy núi Ngọc Linh thuộc địa phận Kon Tum và Quảng Nam, loài sâm này chứa hàm lượng saponin — hoạt chất chống oxy hóa và tăng cường miễn dịch — cao hơn cả sâm Hàn Quốc lẫn sâm Mỹ. Sau nhiều thập kỷ bị khai thác tự phát gần như kiệt quệ, hiện nay chính quyền tỉnh Kon Tum đã thiết lập vùng bảo tồn và khuyến khích người dân bản địa trồng sâm theo hướng bền vững.</p>

<h2>Những thảo dược quý khác của đại ngàn</h2>
<p>Ngoài sâm Ngọc Linh, Tây Nguyên còn có hàng chục loài thảo dược quý đang dần được khoa học chú ý. Lan kim tuyến (Anoectochilus setaceus) — loài lan mọc dưới tán rừng già — có tác dụng bổ thận, tăng sức đề kháng và điều trị các bệnh về gan. Cây đinh lăng Tây Nguyên mọc tự nhiên ở độ cao lớn cho hàm lượng hoạt chất vượt trội so với đinh lăng trồng ở đồng bằng. Nấm linh chi đỏ mọc trên thân cây gỗ mục ở rừng già Kon Tum từ lâu được người bản địa dùng để tăng cường sức khỏe, ngày nay được nghiên cứu về khả năng hỗ trợ điều trị ung thư.</p>

<h2>Bảo tồn hay khai thác — bài toán khó của thời đại</h2>
<p>Sức hút của thảo dược quý đang tạo ra áp lực khai thác khổng lồ lên hệ sinh thái rừng Tây Nguyên. Sâm Ngọc Linh giả bán tràn lan trên thị trường với giá từ một phần mười đến một phần năm mươi giá thật; nhiều loài dược liệu quý đang bị thu hái vô tội vạ không theo mùa vụ. Các chuyên gia khuyến nghị cần nhanh chóng xây dựng hệ thống chứng nhận nguồn gốc, bảo hộ địa lý và quan trọng hơn — ghi chép, hệ thống hóa tri thức y học bản địa trước khi những người già cuối cùng mang theo bí quyết của mình về với đại ngàn.</p>

<h2>Hành trình tiếp nối</h2>
<p>Tây Nguyên không chỉ là vùng đất của cà phê và cồng chiêng — đây còn là một kho tàng y học thiên nhiên đang chờ được khám phá, bảo tồn và phát huy đúng nghĩa. Mỗi chuyến đi vào rừng, mỗi cuộc trò chuyện với già làng, mỗi cây thảo dược được định danh là một bước nhỏ trong hành trình gìn giữ di sản thiên nhiên vô giá đó cho các thế hệ mai sau.</p>',
  N'Dược liệu',
  N'Kon Tum',
  1
),

(
  2,
  N'Hội An – Nơi lưu giữ hồn vải dệt truyền thống',
  N'Làng dệt lụa Mã Châu và làng gốm Thanh Hà là linh hồn của phố cổ Hội An',
N'<h2>Mã Châu — 500 năm tiếng thoi không dứt</h2>
<p>Cách Hội An 10 km về phía nam, làng lụa Mã Châu vẫn giữ nguyên tiếng thoi đưa lách cách, đều đặn như nhịp thở của một nền văn minh dệt vải đã tồn tại hơn 500 năm. Làng dệt Mã Châu thuộc thị xã Duy Xuyên, Quảng Nam, được hình thành từ khoảng thế kỷ 15–16, khi các thương nhân Nhật Bản, Trung Quốc và Bồ Đào Nha đổ về cảng thị Hội An tìm kiếm tơ lụa và gốm sứ. Thời kỳ cực thịnh thế kỷ 17–18, Mã Châu có hàng trăm khung dệt hoạt động suốt ngày đêm, cung cấp lụa và các loại vải quý cho cả vùng.</p>

<h2>Nghệ thuật dệt thủ công — kiên nhẫn của bàn tay và trái tim</h2>
<p>Để tạo ra một tấm lụa Mã Châu thực sự, người thợ cần trải qua ít nhất 12 công đoạn tỉ mỉ: từ việc nuôi tằm, ươm tơ, nhuộm màu bằng thảo mộc tự nhiên như lá bàng, củ nâu, vỏ cây vang — đến lên khung, mắc sợi, dệt và hoàn thiện. Một tấm lụa dài 5 mét rộng 0,6 mét đòi hỏi người thợ lành nghề làm việc liên tục trong 3–4 ngày. Hoa văn trên lụa Mã Châu thường là các họa tiết hoa cúc, hoa sen, chim phượng — những biểu tượng của văn hóa Á Đông được biến tấu theo phong cách duyên dáng của người Quảng.</p>

<h2>Làng gốm Thanh Hà — đất và lửa ngàn năm</h2>
<p>Cách Mã Châu khoảng 5 km, nằm bên bờ bắc sông Thu Bồn, làng gốm Thanh Hà là một di sản sống khác của vùng đất Hội An. Gốm Thanh Hà không phủ men như gốm Bát Tràng mà giữ nguyên màu đất nung đỏ au tự nhiên — đây chính là nét đặc trưng phân biệt gốm Thanh Hà với tất cả các dòng gốm khác tại Việt Nam. Những chiếc bình hoa, chậu cảnh, tượng nhỏ và đặc biệt là các loại lu, chum, vại dùng trong đời sống hằng ngày được tạo hình hoàn toàn bằng tay trên bàn xoay cổ truyền, nung trong lò củi theo kỹ thuật gia truyền.</p>

<h2>Hội An — thành phố biết trân quý nghề cũ</h2>
<p>Điều đáng trân trọng nhất ở Hội An không phải chỉ là vẻ đẹp của những ngôi nhà cổ hay những con đèn lồng rực rỡ — mà là thái độ của cộng đồng đối với di sản. Chính quyền thành phố đã có những chính sách thiết thực để hỗ trợ các nghệ nhân làng nghề: miễn giảm thuế, tổ chức các tour tham quan trải nghiệm dệt và làm gốm, kết nối nghệ nhân với thị trường trong và ngoài nước. Nhiều bạn trẻ thế hệ 8x, 9x tại Hội An đã chọn quay về học nghề thay vì theo đuổi công việc văn phòng ở thành phố lớn.</p>
<h2>Thách thức trong thời đại công nghiệp</h2>
<p>Dẫu vậy, con đường phía trước vẫn còn nhiều chông gai. Vải dệt công nghiệp giá rẻ cạnh tranh trực tiếp với lụa thủ công, trong khi chi phí nguyên liệu và công lao động ngày càng tăng khiến nhiều hộ dệt khó duy trì. Không ít gia đình đã buộc phải chuyển sang bán đồ lưu niệm giả cổ hoặc dịch vụ du lịch. Những nghệ nhân kiên trì giữ nghề dệt thuần túy ngày càng trở nên hiếm hoi — và quý giá hơn bao giờ hết.</p>

<h2>Đến Hội An, đừng chỉ ngắm — hãy chạm vào</h2>
<p>Nếu bạn có dịp đến Hội An, hãy dành nửa ngày để đến Mã Châu tự tay ngồi vào khung dệt, thử cảm giác điều khiển thoi qua từng hàng sợi tơ mỏng manh. Hãy đến Thanh Hà đặt bàn tay lên đất sét ướt và cảm nhận hình hài của một chiếc bình dần hiện ra dưới những ngón tay mình. Đó không chỉ là trải nghiệm du lịch — đó là khoảnh khắc bạn thực sự kết nối với linh hồn của một vùng đất.</p>',
  N'Làng nghề',
  N'Quảng Nam',
  1
);
UPDATE BlogAmThuc
SET hinhAnh = N'blogs/co_do_hue.jpg'
WHERE maBlog = 1;
UPDATE BlogAmThuc
SET hinhAnh = N'blogs/bien_da_nang.jpg'
WHERE maBLog = 2;
UPDATE BlogAmThuc
SET hinhAnh = N'blogs/Tra_hue.jpg'
WHERE maBlog = 3;
UPDATE BlogAmThuc
SET hinhAnh = N'blogs/Tay_nguyen.jpg'
WHERE maBlog = 4;
UPDATE BlogAmThuc
SET hinhAnh = N'blogs/Hoi_an.jpg'
WHERE maBlog = 5;

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