-- ============================================================
--  WEBSITE ??C S?N MI?N TRUNG
--  Script: Xóa (n?u t?n t?i) ? T?o l?i Database ? T?o b?ng ? Insert d? li?u
--  Ch? c?n nh?n Execute 1 l?n là ch?y h?t
-- ============================================================

-- ? XÓA VÀ T?O L?I DATABASE
USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DacSanMienTrung')
BEGIN
    ALTER DATABASE DacSanMienTrung SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DacSanMienTrung;
END
GO

CREATE DATABASE DacSanMienTrung
    COLLATE Vietnamese_CI_AS;
GO

USE DacSanMienTrung;
GO

-- ============================================================
--  T?O B?NG
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
--  INSERT D? LI?U M?U
-- ============================================================

-- ? 1. NguoiDung (2 admin, 2 nhân viên, 6 khách hàng)
INSERT INTO NguoiDung (hoTen, email, matKhau, soDienThoai, ngaySinh, vaiTro, trangThai, diemTichLuy, phanLoaiKhachHang, chucVu)
VALUES
(N'Nguy?n V?n An',    'admin.an@dacsan.vn',     '$2b$10$hashedpw1', '0901234501', '1985-03-15', N'quantrivien', 1, 0,   NULL,        N'Qu?n tr? viên h? th?ng'),
(N'Tr?n Th? Bình',   'admin.binh@dacsan.vn',   '$2b$10$hashedpw2', '0901234502', '1990-07-22', N'quantrivien', 1, 0,   NULL,        N'Qu?n tr? viên n?i dung'),
(N'Lê Minh Châu',    'nv.chau@dacsan.vn',      '$2b$10$hashedpw3', '0901234503', '1995-01-10', N'nhanvien',    1, 0,   NULL,        N'Nhân viên kho'),
(N'Ph?m Qu?c D?ng',  'nv.dung@dacsan.vn',      '$2b$10$hashedpw4', '0901234504', '1993-11-05', N'nhanvien',    1, 0,   NULL,        N'Nhân viên giao v?n'),
(N'Hoàng Th? Lan',   'lan.hoang@gmail.com',    '$2b$10$hashedpw5', '0912345605', '1992-06-18', N'khachhang',   1, 850, N'b?c',      NULL),
(N'Võ Thanh Hùng',   'hung.vo@gmail.com',      '$2b$10$hashedpw6', '0912345606', '1988-12-30', N'khachhang',   1, 3200,N'vàng',     NULL),
(N'??ng Th? Mai',    'mai.dang@yahoo.com',     '$2b$10$hashedpw7', '0923456707', '1997-04-25', N'khachhang',   1, 150, N'th??ng',   NULL),
(N'Bùi Trung Kiên',  'kien.bui@gmail.com',     '$2b$10$hashedpw8', '0934567808', '1991-09-14', N'khachhang',   1, 7500,N'kim c??ng', NULL),
(N'Ngô Th? Ph??ng',  'phuong.ngo@gmail.com',   '$2b$10$hashedpw9', '0945678909', '1999-02-08', N'khachhang',   1, 0,   N'th??ng',   NULL),
(N'Tô V?n Quân',     'quan.to@outlook.com',    '$2b$10$hashedpwA', '0956789010', '1986-08-19', N'khachhang',   1, 1200,N'b?c',      NULL);

-- ? 2. DanhMuc – 8 danh m?c l?n (cha), sau ?ó danh m?c con
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
-- Danh m?c cha
(NULL, N'Bánh K?o',      N'Các lo?i bánh và k?o truy?n th?ng mi?n Trung',        1, 1),
(NULL, N'?á Phong Th?y', N'?á t? nhiên phong th?y, ?á quý, ?á trang trí',        2, 1),
(NULL, N'Trà',           N'Trà xanh, trà th?o m?c, trà ??c s?n các vùng',        3, 1),
(NULL, N'Tinh D?u',      N'Tinh d?u thiên nhiên, tinh d?u th?m, tinh d?u d??c li?u', 4, 1),
(NULL, N'??c S?n Khô',   N'H?i s?n khô, th?t khô, nông s?n khô mi?n Trung',      5, 1),
(NULL, N'?? M? Ngh?',   N'?? th? công m? ngh?, l?u ni?m, trang trí n?i th?t',   6, 1),
(NULL, N'?ông Y',        N'Th?o d??c, v? thu?c, s?n ph?m ?ông y truy?n th?ng',    7, 1),
(NULL, N'V?i',           N'V?i th? c?m, l?a, v?i truy?n th?ng các dân t?c mi?n Trung', 8, 1);

-- Danh m?c con – Bánh K?o (maDanhMucCha = 1)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(1, N'Bánh',         N'Bánh in, bánh ??u xanh, bánh n?m, bánh l?c và các lo?i bánh khác',  1, 1),
(1, N'K?o',          N'K?o g?ng, k?o d?a, k?o mè x?ng và các lo?i k?o ??c s?n',           2, 1);

-- Danh m?c con – ?á Phong Th?y (maDanhMucCha = 2)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(2, N'?á Thô T? Nhiên',   N'?á nguyên kh?i, ?á cu?i, ?á c?nh ch?a qua ch? tác',      1, 1),
(2, N'?á Ch? Tác',        N'Vòng tay, vòng c?, t??ng ?á phong th?y ?ã qua ch? tác',  2, 1);

-- Danh m?c con – Trà (maDanhMucCha = 3)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(3, N'Trà Xanh',       N'Trà xanh Hu?, trà xanh Qu?ng Nam nguyên ch?t',               1, 1),
(3, N'Trà Th?o M?c',   N'Trà atiso, trà hoa cúc, trà g?ng m?t ong và th?o m?c khác', 2, 1),
(3, N'Trà ??p Hoa',    N'Trà sen, trà nhài, trà hoa h?ng ??p h??ng t? nhiên',         3, 1);

-- Danh m?c con – Tinh D?u (maDanhMucCha = 4)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(4, N'Tinh D?u Th?m',     N'Tinh d?u s?, o?i h??ng, b?ch ?àn dùng xông phòng',        1, 1),
(4, N'Tinh D?u D??c Li?u',N'Tinh d?u tràm, tinh d?u g?ng dùng trong tr? li?u',        2, 1);

-- Danh m?c con – ??c S?n Khô (maDanhMucCha = 5)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(5, N'H?i S?n Khô',   N'M?c khô, tôm khô, cá khô, cua bi?n s?y',                        1, 1),
(5, N'Th?t Khô',      N'Bò m?t n?ng, heo gác b?p, th?t trâu khô ??c s?n vùng cao',      2, 1),
(5, N'Nông S?n Khô',  N'Tiêu Phú Qu?c, qu? Trà My, ?t khô, h?t sen khô mi?n Trung',     3, 1);

-- Danh m?c con – ?? M? Ngh? (maDanhMucCha = 6)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(6, N'?? G? M? Ngh?', N'T??ng g?, bình hoa g?, tranh g? ?iêu kh?c th? công',         1, 1),
(6, N'G?m S?',         N'G?m Bát Tràng, g?m Thanh Hà, s? Chu ??u và g?m truy?n th?ng', 2, 1),
(6, N'Tranh Thêu',     N'Tranh thêu tay Hu?, tranh thêu phong c?nh và chân dung',       3, 1);

-- Danh m?c con – ?ông Y (maDanhMucCha = 7)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(7, N'Th?o D??c Khô',  N'?inh l?ng, ???ng quy, hoàng k?, các v? thu?c khô',           1, 1),
(7, N'Cao D??c Li?u',  N'Cao x??ng, cao ?inh l?ng, cao b?ch hoa xà thi?t th?o',        2, 1);

-- Danh m?c con – V?i (maDanhMucCha = 8)
INSERT INTO DanhMuc (maDanhMucCha, tenDanhMuc, moTa, thuTuHienThi, trangThai)
VALUES
(8, N'V?i Th? C?m',    N'Th? c?m các dân t?c Tây Nguyên, v?i d?t th? công truy?n th?ng', 1, 1),
(8, N'L?a',            N'L?a Mã Châu Qu?ng Nam, l?a t? t?m t? nhiên cao c?p',             2, 1);

-- ? 3. SanPham – m?i danh m?c con có 2–3 s?n ph?m m?u
-- Bánh (maDanhMuc = 9)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(9,  N'Bánh In ??u Xanh Hu?',      N'Bánh in truy?n th?ng C? ?ô Hu?', N'??u xanh, ???ng, b?t n?p', N'Th?a Thiên Hu?', N'B?c Trung B?', 85000),
(9,  N'Bánh N?m Hu?',              N'Bánh n?m lá chu?i h?p chín', N'B?t g?o, tôm, th?t, lá chu?i', N'Th?a Thiên Hu?', N'B?c Trung B?', 65000),
(9,  N'Bánh ??u Xanh H?i An',      N'Bánh ??u xanh ??c s?n ph? c?', N'??u xanh, ???ng th?t n?t, v?ng', N'Qu?ng Nam', N'Nam Trung B?', 75000);

-- K?o (maDanhMuc = 10)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(10, N'K?o Mè X?ng Hu?',           N'K?o mè x?ng giòn tan ??c tr?ng Hu?', N'Mè, ???ng, m?ch nha', N'Th?a Thiên Hu?', N'B?c Trung B?', 55000),
(10, N'K?o G?ng M?t Ong',          N'K?o g?ng t??i k?t h?p m?t ong r?ng', N'G?ng t??i, m?t ong, ???ng', N'Qu?ng Ngãi', N'Nam Trung B?', 45000),
(10, N'K?o D?a Bình ??nh',         N'K?o d?a m?m d?o ??c s?n Bình ??nh', N'Cùi d?a, ???ng, m?ch nha', N'Bình ??nh', N'Nam Trung B?', 40000);

-- ?á Thô T? Nhiên (maDanhMuc = 11)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(11, N'?á Th?ch Anh Tím Nguyên Kh?i', N'?á th?ch anh tím t? nhiên thu hút tài l?c', N'Th?ch anh tím t? nhiên', N'??k L?k', N'Tây Nguyên', 350000),
(11, N'?á M?t H? Thô',              N'?á m?t h? vàng t? nhiên ch?a ch? tác',      N'?á m?t h? t? nhiên',    N'Kon Tum',  N'Tây Nguyên', 280000);

-- ?á Ch? Tác (maDanhMuc = 12)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(12, N'Vòng Tay ?á Th?ch Anh H?ng', N'Vòng tay th?ch anh h?ng 14 h?t tình duyên', N'Th?ch anh h?ng t? nhiên', N'??k Nông', N'Tây Nguyên', 180000),
(12, N'T??ng Thi?m Th? ?á Ng?c',    N'T??ng cóc ng?m ti?n b?ng ?á ng?c phong th?y', N'?á ng?c nephrite',     N'Qu?ng Ngãi', N'Nam Trung B?', 420000);

-- Trà Xanh (maDanhMuc = 13)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(13, N'Trà Xanh C? Th? A L??i',    N'Trà xanh hái t? cây c? th? vùng cao A L??i', N'Lá trà xanh c? th?',   N'Th?a Thiên Hu?', N'B?c Trung B?', 120000),
(13, N'Trà Nõn Tôm Nam ?ông',       N'Trà nõn tôm m?t tôm hai lá tinh tuy?n',      N'Búp trà non ??nh núi', N'Th?a Thiên Hu?', N'B?c Trung B?', 195000);

-- Trà Th?o M?c (maDanhMuc = 14)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(14, N'Trà Atiso ?à L?t Túi L?c',  N'Trà atiso thanh nhi?t mát gan h?u c?',       N'Hoa atiso khô, cúc la mã', N'Lâm ??ng', N'Tây Nguyên', 85000),
(14, N'Trà G?ng M?t Ong R?ng',     N'Trà g?ng hòa tan k?t h?p m?t ong r?ng nguyên ch?t', N'G?ng, m?t ong r?ng, qu?', N'Qu?ng Nam', N'Nam Trung B?', 110000);

-- Trà ??p Hoa (maDanhMuc = 15)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(15, N'Trà Sen Hu? Th??ng H?ng',   N'Trà ??p sen h? T?nh Tâm theo ph??ng pháp c? truy?n', N'Trà xanh, nh?y sen t??i', N'Th?a Thiên Hu?', N'B?c Trung B?', 450000),
(15, N'Trà Nhài H?i An',            N'Trà nhài th?m d?u h??ng hoa t??i ??c s?c',           N'Trà xanh, hoa nhài t??i', N'Qu?ng Nam',      N'Nam Trung B?', 95000);

-- Tinh D?u Th?m (maDanhMuc = 16)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(16, N'Tinh D?u S? Chanh Qu?ng Nam', N'Tinh d?u s? chanh h?u c? xông phòng, ?u?i mu?i', N'S? chanh t??i ch?ng c?t', N'Qu?ng Nam', N'Nam Trung B?', 130000),
(16, N'Tinh D?u O?i H??ng ?à L?t',  N'Tinh d?u lavender th? giãn, h? tr? ng? ngon',    N'Hoa o?i h??ng nguyên ch?t', N'Lâm ??ng', N'Tây Nguyên', 185000);

-- Tinh D?u D??c Li?u (maDanhMuc = 17)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(17, N'Tinh D?u Tràm Hu?',          N'Tinh d?u tràm nguyên ch?t t? vùng ??m phá Hu?',  N'Lá tràm ch?ng c?t th? công', N'Th?a Thiên Hu?', N'B?c Trung B?', 95000),
(17, N'Tinh D?u G?ng Qu?ng Ngãi',   N'Tinh d?u g?ng nóng gi?m ?au, kháng khu?n',      N'G?ng t??i vùng cao',         N'Qu?ng Ngãi',     N'Nam Trung B?', 115000);

-- H?i S?n Khô (maDanhMuc = 18)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(18, N'M?c Khô Lý S?n ??i',         N'M?c khô ??i c? ??o Lý S?n ?ánh b?t t? nhiên', N'M?c ?ng t??i ph?i n?ng',  N'Qu?ng Ngãi', N'Nam Trung B?', 380000),
(18, N'Tôm Khô Nha Trang Lo?i 1',   N'Tôm khô ?? ??c, th?m ng?t t? nhiên',           N'Tôm sú t??i ph?i khô',    N'Khánh Hòa',  N'Nam Trung B?', 320000),
(18, N'Cá Bò Da Khô ?à N?ng',       N'Cá bò da khô giòn ??c s?n bi?n ?à N?ng',       N'Cá bò da t??i ph?i n?ng', N'?à N?ng',    N'Nam Trung B?', 145000);

-- Th?t Khô (maDanhMuc = 19)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(19, N'Bò M?t N?ng Phú Yên',        N'Bò m?t n?ng ch?m mu?i ki?n vàng ??c s?n Phú Yên', N'Th?t bò t??i, mu?i, gia v?', N'Phú Yên', N'Nam Trung B?', 480000),
(19, N'Heo Gác B?p Kontum',         N'Th?t heo gác b?p hun khói c?a ng??i Ba Na',       N'Th?t heo b?n ??a, mu?i r?ng', N'Kon Tum', N'Tây Nguyên', 420000);

-- Nông S?n Khô (maDanhMuc = 20)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(20, N'Qu? Trà My Nguyên Thanh',    N'Qu? thanh dài th?m cay ??c tr?ng Trà My',         N'Qu? t? nhiên vùng cao',    N'Qu?ng Nam', N'Nam Trung B?', 95000),
(20, N'H?t Sen ??m Phá Tam Giang',  N'H?t sen khô th?m bùi t? ??m phá Hu?',             N'H?t sen t??i s?y khô',     N'Th?a Thiên Hu?', N'B?c Trung B?', 135000),
(20, N'?t Xiêm Quê Qu?ng Tr?',      N'?t xiêm khô cay th?m t? nhiên vùng gò ??i',      N'?t xiêm ph?i n?ng',        N'Qu?ng Tr?', N'B?c Trung B?', 55000);

-- ?? G? M? Ngh? (maDanhMuc = 21)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(21, N'T??ng Ph?t G? Tr?m H??ng',   N'T??ng Ph?t ?iêu kh?c th? công t? g? tr?m h??ng', N'G? tr?m h??ng t? nhiên',   N'Khánh Hòa', N'Nam Trung B?', 1800000),
(21, N'B? Tranh G? Trúc Lâm',       N'Tranh g? kh?m ?c xà c? phong c?nh Vi?t',          N'G? c?m lai, ?c xà c?',    N'Bình ??nh',  N'Nam Trung B?', 650000);

-- G?m S? (maDanhMuc = 22)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(22, N'?m Trà G?m Thanh Hà',        N'?m trà g?m th? công làng Thanh Hà H?i An',        N'??t sét ?? nung th? công',  N'Qu?ng Nam', N'Nam Trung B?', 280000),
(22, N'B? Chén G?m Chu ??u 6 Cái',  N'B? chén u?ng trà g?m Chu ??u hoa v?n c?',         N'G?m men xanh tr?ng',        N'Qu?ng Nam', N'Nam Trung B?', 420000);

-- Tranh Thêu (maDanhMuc = 23)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(23, N'Tranh Thêu Hoa Sen Hu?',      N'Tranh thêu tay hoa sen c? 40x60cm tinh x?o',      N'Ch? t? l?a, v?i canvas',    N'Th?a Thiên Hu?', N'B?c Trung B?', 550000),
(23, N'Tranh Thêu Phong C?nh Sông H??ng', N'Tranh thêu sông H??ng c?u Tr??ng Ti?n c? 60x80cm', N'Ch? thêu nhi?u màu, khung g?', N'Th?a Thiên Hu?', N'B?c Trung B?', 980000);

-- Th?o D??c Khô (maDanhMuc = 24)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(24, N'?inh L?ng R?ng Qu?ng Bình',  N'R? ?inh l?ng r?ng nguyên ch?t t?ng c??ng s?c kh?e', N'R? ?inh l?ng khô',         N'Qu?ng Bình', N'B?c Trung B?', 165000),
(24, N'???ng Quy ?à L?t Thái Lát',  N'???ng quy thái lát b? huy?t ho?t huy?t',             N'C? ???ng quy thái lát s?y', N'Lâm ??ng',   N'Tây Nguyên',   210000);

-- Cao D??c Li?u (maDanhMuc = 25)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(25, N'Cao ?inh L?ng M?t Ong',      N'Cao ?inh l?ng cô ??c pha s?n v?i m?t ong',          N'?inh l?ng, m?t ong, n??c',  N'Qu?ng Bình', N'B?c Trung B?', 320000),
(25, N'Cao X??ng Ng?a H?m Thu?c',   N'Cao x??ng ng?a b? gân c?t theo bài thu?c c? truy?n', N'X??ng ng?a, thu?c b?c t?ng h?p', N'Kon Tum', N'Tây Nguyên', 580000);

-- V?i Th? C?m (maDanhMuc = 26)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(26, N'V?i Th? C?m Ba Na 1 Mét',    N'Th? c?m d?t tay c?a ng??i Ba Na hoa v?n truy?n th?ng', N'S?i cotton nhu?m t? nhiên', N'Kon Tum', N'Tây Nguyên', 240000),
(26, N'Túi Th? C?m Ê ?ê',           N'Túi ?eo chéo th? c?m Ê ?ê thêu tay',                   N'Th? c?m, ch? thêu',        N'??k L?k', N'Tây Nguyên', 185000);

-- L?a (maDanhMuc = 27)
INSERT INTO SanPham (maDanhMuc, tenSanPham, moTa, thanhPhan, tenTinh, vungMien, giaNiemYet)
VALUES
(27, N'L?a T? T?m Mã Châu 1 Mét',  N'L?a Mã Châu m?n óng ánh d?t th? công t? Qu?ng Nam',  N'T? t?m t? nhiên',          N'Qu?ng Nam', N'Nam Trung B?', 350000),
(27, N'Kh?n L?a T? T?m Thêu Tay',  N'Kh?n quàng l?a m?c thêu hoa v?n ?ông ph??ng',          N'L?a t? t?m, ch? thêu vàng', N'Qu?ng Nam', N'Nam Trung B?', 420000);


-- ? 4. BienThe – m?i s?n ph?m 2 bi?n th?
-- Bánh In (maSanPham=1), Bánh N?m (2), Bánh ??u (3)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(1,  N'200g',  N'H?p', 85000,  120, '2025-12-31'),
(1,  N'400g',  N'H?p', 155000, 80,  '2025-12-31'),
(2,  N'10 cái',N'H?p', 65000,  60,  '2025-08-30'),
(2,  N'20 cái',N'H?p', 120000, 40,  '2025-08-30'),
(3,  N'150g',  N'Túi', 75000,  90,  '2026-03-31'),
(3,  N'300g',  N'H?p', 140000, 55,  '2026-03-31');

-- K?o Mè X?ng (4), K?o G?ng (5), K?o D?a (6)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(4,  N'250g',  N'Túi', 55000,  150, '2026-01-31'),
(4,  N'500g',  N'H?p', 100000, 70,  '2026-01-31'),
(5,  N'200g',  N'Túi', 45000,  130, '2026-06-30'),
(5,  N'400g',  N'Túi', 85000,  80,  '2026-06-30'),
(6,  N'300g',  N'Túi', 40000,  200, '2026-06-30'),
(6,  N'500g',  N'H?p', 65000,  100, '2026-06-30');

-- ?á Th?ch Anh Tím (7), ?á M?t H? (8)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(7,  N'0.5kg', N'Nguyên kh?i', 350000, 30),
(7,  N'1kg',   N'Nguyên kh?i', 650000, 15),
(8,  N'100g',  N'Túi',         280000, 50),
(8,  N'250g',  N'Túi',         600000, 20);

-- Vòng Tay Th?ch Anh (9), T??ng Cóc (10)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(9,  N'Size S', N'H?p nhung', 180000, 80),
(9,  N'Size M', N'H?p nhung', 180000, 90),
(10, N'Nh?',   N'H?p g?',    420000, 25),
(10, N'V?a',   N'H?p g?',    750000, 10);

-- Trà Xanh C? Th? (11), Trà Nõn Tôm (12)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(11, N'100g',  N'Túi zip',   120000, 200, '2026-12-31'),
(11, N'250g',  N'H?p thi?c', 280000, 100, '2026-12-31'),
(12, N'50g',   N'H?p thi?c', 195000, 60,  '2026-12-31'),
(12, N'100g',  N'H?p thi?c', 370000, 30,  '2026-12-31');

-- Trà Atiso (13), Trà G?ng (14)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(13, N'20 túi',N'H?p',       85000,  180, '2026-09-30'),
(13, N'40 túi',N'H?p',       155000, 90,  '2026-09-30'),
(14, N'200g',  N'L? th?y tinh', 110000, 120, '2026-09-30'),
(14, N'400g',  N'L? th?y tinh', 200000, 60,  '2026-09-30');

-- Trà Sen (15), Trà Nhài (16)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(15, N'50g',   N'H?p g?',   450000, 40, '2025-12-31'),
(15, N'100g',  N'H?p g?',   850000, 20, '2025-12-31'),
(16, N'100g',  N'Túi zip',   95000,  150, '2026-06-30'),
(16, N'250g',  N'H?p thi?c', 220000, 80,  '2026-06-30');

-- Tinh D?u S? (17), Tinh D?u O?i H??ng (18)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(17, N'10ml',  N'Chai th?y tinh', 130000, 100),
(17, N'30ml',  N'Chai th?y tinh', 320000, 50),
(18, N'10ml',  N'Chai th?y tinh', 185000, 80),
(18, N'30ml',  N'Chai th?y tinh', 480000, 35);

-- Tinh D?u Tràm (19), Tinh D?u G?ng (20)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(19, N'10ml',  N'Chai th?y tinh', 95000,  200),
(19, N'30ml',  N'Chai th?y tinh', 240000, 100),
(20, N'10ml',  N'Chai th?y tinh', 115000, 90),
(20, N'30ml',  N'Chai th?y tinh', 290000, 45);

-- M?c Khô Lý S?n (21), Tôm Khô (22), Cá Bò Da (23)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(21, N'200g',  N'Túi hút chân không', 380000, 80,  '2026-06-30'),
(21, N'500g',  N'Túi hút chân không', 880000, 35,  '2026-06-30'),
(22, N'200g',  N'Túi hút chân không', 320000, 100, '2026-06-30'),
(22, N'500g',  N'Túi hút chân không', 750000, 40,  '2026-06-30'),
(23, N'300g',  N'Túi hút chân không', 145000, 120, '2026-06-30'),
(23, N'600g',  N'Túi hút chân không', 270000, 55,  '2026-06-30');

-- Bò M?t N?ng (24), Heo Gác B?p (25)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(24, N'300g',  N'H?p x?p + màng co', 480000, 60,  '2025-12-31'),
(24, N'500g',  N'H?p x?p + màng co', 750000, 30,  '2025-12-31'),
(25, N'250g',  N'Túi hút chân không', 420000, 50,  '2025-12-31'),
(25, N'500g',  N'Túi hút chân không', 800000, 25,  '2025-12-31');

-- Qu? Trà My (26), H?t Sen (27), ?t Xiêm (28)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(26, N'100g',  N'Túi zip',   95000,  200, '2026-12-31'),
(26, N'250g',  N'H?p g?',   220000, 80,  '2026-12-31'),
(27, N'200g',  N'Túi zip',   135000, 150, '2026-09-30'),
(27, N'500g',  N'Túi zip',   310000, 60,  '2026-09-30'),
(28, N'100g',  N'Túi zip',   55000,  300, '2026-12-31'),
(28, N'250g',  N'Túi zip',   120000, 120, '2026-12-31');

-- T??ng Ph?t G? (29), Tranh G? (30)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(29, N'C? nh? 15cm', N'H?p g?', 1800000, 15),
(29, N'C? v?a 25cm', N'H?p g?', 3200000, 8),
(30, N'40x60cm',     N'?óng khung', 650000, 25),
(30, N'60x80cm',     N'?óng khung', 1100000, 12);

-- ?m Trà G?m (31), B? Chén (32)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(31, N'400ml', N'H?p g?',  280000, 40),
(31, N'600ml', N'H?p g?',  380000, 25),
(32, N'B? 6 cái 120ml', N'H?p g?', 420000, 30),
(32, N'B? 6 cái 200ml', N'H?p g?', 580000, 18);

-- Tranh Thêu Hoa Sen (33), Tranh Thêu Sông H??ng (34)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(33, N'40x60cm', N'?óng khung', 550000, 20),
(33, N'60x80cm', N'?óng khung', 850000, 10),
(34, N'60x80cm', N'?óng khung', 980000, 12),
(34, N'80x100cm',N'?óng khung', 1600000, 5);

-- ?inh L?ng (35), ???ng Quy (36)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(35, N'200g',  N'Túi zip',    165000, 120, '2026-12-31'),
(35, N'500g',  N'Túi zip',    380000, 50,  '2026-12-31'),
(36, N'200g',  N'Túi zip',    210000, 90,  '2026-12-31'),
(36, N'500g',  N'H?p',        490000, 40,  '2026-12-31');

-- Cao ?inh L?ng (37), Cao X??ng Ng?a (38)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon, hanSuDung)
VALUES
(37, N'250g',  N'H? th?y tinh', 320000, 70, '2026-06-30'),
(37, N'500g',  N'H? th?y tinh', 580000, 35, '2026-06-30'),
(38, N'250g',  N'H? th?y tinh', 580000, 30, '2026-06-30'),
(38, N'500g',  N'H? th?y tinh', 1050000, 15, '2026-06-30');

-- V?i Th? C?m Ba Na (39), Túi Th? C?m (40)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(39, N'1 mét',  N'Cu?n',   240000, 60),
(39, N'3 mét',  N'Cu?n',   680000, 25),
(40, N'Size nh?', N'Túi v?i', 185000, 80),
(40, N'Size v?a', N'Túi v?i', 250000, 50);

-- L?a Mã Châu (41), Kh?n L?a (42)
INSERT INTO BienThe (maSanPham, trongLuong, quyCachDongGoi, giaBan, soLuongTon)
VALUES
(41, N'1 mét',  N'Cu?n',      350000, 50),
(41, N'3 mét',  N'Cu?n',      990000, 20),
(42, N'180x50cm', N'H?p thi?c', 420000, 45),
(42, N'200x70cm', N'H?p thi?c', 620000, 20);


-- ? 5. Voucher
INSERT INTO Voucher (maCode, loaiGiam, giaTriGiam, donHangToiThieu, soLuongTon, ngayBatDau, ngayHetHan)
VALUES
(N'WELCOME10',   N'phanTram', 10,     0,       500, '2025-01-01', '2026-12-31'),
(N'SALE50K',     N'soTien',   50000,  300000,  200, '2025-06-01', '2025-12-31'),
(N'VIP15',       N'phanTram', 15,     500000,  100, '2025-01-01', '2026-06-30'),
(N'TETTRUNG25',  N'phanTram', 25,     800000,  50,  '2025-09-01', '2025-10-31'),
(N'FREESHIP30K', N'soTien',   30000,  150000,  300, '2025-01-01', '2026-12-31');


-- ? 6. GioHang (5 dòng m?u)
INSERT INTO GioHang (maNguoiDung, maBienThe, soLuong, donGia)
VALUES
(5, 1,  2, 85000),
(5, 21, 1, 380000),
(6, 37, 1, 320000),
(7, 9,  1, 180000),
(8, 15, 2, 450000);


-- ? 7. ComboQuaTang (5 combo m?u)
INSERT INTO ComboQuaTang (maNguoiDung, tenCombo, loaiCombo, dipLe, loiNhan, tongTienTamTinh, trangThaiCombo)
VALUES
(5,  N'Quà T?t M?',         N'nguyenDan',  N'T?t Nguyên ?án 2026', N'Chúc m? n?m m?i s?c kh?e d?i dào!', 850000,  N'luuTam'),
(6,  N'Combo Trung Thu',     N'trungThu',   N'Trung Thu 2025',       N'Tr?ng thu r?m tháng tám sen vàng',   1200000, N'daDatHang'),
(7,  N'Quà Sinh Nh?t B?n',  N'sinhNhat',   N'Sinh nh?t Lan',        N'Happy Birthday nh? mày nhi?u!',      560000,  N'luuTam'),
(8,  N'Quà Bi?u S?p',       N'quaBieu',    N'K? ni?m công ty',      N'Kính chúc s?c kh?e và th?nh v??ng', 2500000, N'daDatHang'),
(10, N'Combo ??c S?n',       N'khac',       N'Quà t?ng b?n bè',      N'H??ng v? mi?n Trung g?i ??n b?n',    780000,  N'luuTam');

-- ? 8. ChiTietCombo (m?i combo 2 dòng)
INSERT INTO ChiTietCombo (maCombo, maBienThe, soLuong, donGia, thanhTien, ghiChuSanPham)
VALUES
(1, 2,  1, 155000, 155000, N'Bánh in h?p l?n cho m?'),
(1, 7,  1, 120000, 120000, N'Trà nõn tôm th?m ngon'),
(2, 15, 1, 450000, 450000, N'Trà sen th??ng h?ng'),
(2, 1,  2, 85000,  170000, N'Bánh in cho bé'),
(3, 9,  1, 180000, 180000, N'Vòng tay t?ng b?n gái'),
(3, 16, 1, 95000,  95000,  N'Trà nhài h??ng th?m'),
(4, 29, 1, 1800000,1800000,N'T??ng Ph?t trang tr?ng'),
(4, 37, 1, 320000, 320000, N'Cao ?inh l?ng b? s?c'),
(5, 21, 1, 380000, 380000, N'M?c khô ngon nh?t Lý S?n'),
(5, 26, 1, 95000,  95000,  N'Qu? th?m ??c tr?ng');


-- ? 9. DonHang (5 ??n hàng m?u)
INSERT INTO DonHang (
    maNguoiDung, maVoucher, maCombo,
    hoTenNguoiNhan, soDienThoaiNguoiNhan, diaChiGiaoHang, quanHuyen, tinhThanhGiaoHang,
    trangThaiDonHang, tongTienHang, tienGiam, phiVanChuyen, tongThanhToan,
    phuongThucThanhToan, trangThaiThanhToan, ngayThanhToan, maNhanVienXuLy
)
VALUES
(5,  1,    NULL, N'Hoàng Th? Lan',  '0912345605', N'45 Lê L?i', N'H?i Châu',  N'?à N?ng',
     N'daGiao',    550000,  55000,  25000,  520000,  N'COD',            N'thanhCong',    '2025-10-05 14:30:00', 3),
(6,  NULL, 2,    N'Nguy?n Thu Hà',  '0901234599', N'12 Nguy?n Trãi', N'Thanh Khê', N'?à N?ng',
     N'daGiao',    1250000, 0,      30000,  1280000, N'chuyenKhoan',    N'thanhCong',    '2025-09-20 09:15:00', 3),
(7,  2,    NULL, N'??ng Th? Mai',   '0923456707', N'78 Tr?n Phú', N'Hoàn Ki?m', N'Hà N?i',
     N'dangGiao',  560000,  50000,  40000,  550000,  N'vi',             N'thanhCong',    '2025-10-10 16:00:00', 4),
(8,  3,    4,    N'Bùi Trung Kiên', '0934567808', N'25 Hai Bà Tr?ng', N'Qu?n 1', N'H? Chí Minh',
     N'daGiao',    2500000, 375000, 0,      2125000, N'theTinDung',     N'thanhCong',    '2025-08-15 11:45:00', 3),
(10, NULL, NULL, N'Tô V?n Quân',    '0956789010', N'56 Phan B?i Châu', N'H?i Châu', N'?à N?ng',
     N'choXacNhan',475000,  0,      25000,  500000,  N'COD',            N'choThanhToan', NULL,                  NULL);


-- ? 10. ChiTietDonHang (m?i ??n 2–3 dòng, kèm ?ánh giá cho ??n ?ã giao)
INSERT INTO ChiTietDonHang (maDonHang, maBienThe, soLuong, donGia, thanhTien, soSao, noiDungDanhGia, ngayDanhGia, daKiemDuyetDanhGia)
VALUES
-- ??n 1 (?ã giao, có ?ánh giá)
(1, 1,  2, 85000,  170000, 5, N'Bánh ngon ?úng v? Hu?, ?óng gói ??p, giao hàng nhanh!', '2025-10-07', 1),
(1, 21, 1, 380000, 380000, 4, N'M?c khô th?m, tuy h?i m?n nh?ng ch?t l??ng t?t.', '2025-10-07', 1),
-- ??n 2 (?ã giao, có ?ánh giá)
(2, 15, 1, 450000, 450000, 5, N'Trà sen Hu? tuy?t h?o, th?m và thanh tuy?t v?i!', '2025-09-22', 1),
(2, 1,  2, 85000,  170000, 5, N'Bánh in ngon, t?ng m? r?t thích.', '2025-09-22', 1),
-- ??n 3 (?ang giao, ch?a ?ánh giá)
(3, 9,  1, 180000, 180000, NULL, NULL, NULL, 0),
(3, 16, 1, 95000,  95000,  NULL, NULL, NULL, 0),
-- ??n 4 (?ã giao, có ?ánh giá)
(4, 29, 1, 1800000,1800000, 5, N'T??ng Ph?t g? tr?m r?t ??p, ?óng h?p c?n th?n, hài lòng 100%.', '2025-08-18', 1),
(4, 37, 1, 320000, 320000,  4, N'Cao ?inh l?ng ch?t l??ng, nh?ng l? h?i nh? so v?i giá ti?n.', '2025-08-18', 0),
-- ??n 5 (ch? xác nh?n, ch?a ?ánh giá)
(5, 21, 1, 380000, 380000, NULL, NULL, NULL, 0),
(5, 26, 1, 95000,  95000,  NULL, NULL, NULL, 0);


-- ? 11. BlogAmThuc (5 bài vi?t m?u)
INSERT INTO BlogAmThuc (maTacGia, tieuDe, moTa, noiDung, chuDe, tenTinh, trangThai)
VALUES
(2, N'Hành trình khám phá ?m th?c Hu? C? ?ô',
    N'C? ?ô Hu? s? h?u kho tàng ?m th?c phong phú t? cung ?ình ??n dân gian',
    N'Hu? không ch? n?i ti?ng v?i các di s?n v?n hóa mà còn là thiên ???ng ?m th?c...',
    N'?m th?c', N'Th?a Thiên Hu?', 1),
(1, N'??c s?n mi?n bi?n ?à N?ng – V? m?n mòi c?a bi?n kh?i',
    N'Bi?n ?à N?ng mang ??n ngu?n h?i s?n phong phú và các món ?n ??m ?à',
    N'?à N?ng v?i b? bi?n dài h?n 30km là kho tàng h?i s?n t??i ngon...',
    N'H?i s?n', N'?à N?ng', 1),
(2, N'Trà Hu? – Ngh? thu?t th??ng trà c?a ng??i x? C? ?ô',
    N'U?ng trà là nét v?n hóa tinh t? c?a ng??i Hu? t? cung ?ình ??n th??ng dân',
    N'Ng??i Hu? u?ng trà nh? m?t nghi l?, t? cách pha, cách rót ??n không gian th??ng th?c...',
    N'V?n hóa', N'Th?a Thiên Hu?', 1),
(1, N'Tây Nguyên và câu chuy?n c?a nh?ng loài th?o d??c quý',
    N'??i ngàn Tây Nguyên ?n ch?a vô s? th?o d??c quý t? ngàn x?a',
    N'T? r?ng Kon Tum ??n ??k L?k, ng??i dân t?c b?n ??a ?ã bi?t s? d?ng th?o d??c...',
    N'D??c li?u', N'Kon Tum', 1),
(2, N'H?i An – N?i l?u gi? h?n v?i d?t truy?n th?ng',
    N'Làng d?t l?a Mã Châu và làng g?m Thanh Hà là linh h?n c?a ph? c? H?i An',
    N'Cách H?i An 10km v? phía nam, làng l?a Mã Châu v?n gi? nguyên ti?ng thoi ??a...',
    N'Làng ngh?', N'Qu?ng Nam', 1);


-- ? 12. BlogSanPham (m?i bài 2 s?n ph?m liên quan)
INSERT INTO BlogSanPham (maBlog, maSanPham)
VALUES
(1, 1),  -- Blog Hu? ? Bánh In
(1, 15), -- Blog Hu? ? Trà Sen
(2, 21), -- Blog ?à N?ng ? M?c Khô Lý S?n
(2, 22), -- Blog ?à N?ng ? Tôm Khô Nha Trang
(3, 11), -- Blog Trà ? Trà Xanh C? Th?
(3, 15), -- Blog Trà ? Trà Sen Hu?
(4, 35), -- Blog Tây Nguyên ? ?inh L?ng
(4, 37), -- Blog Tây Nguyên ? Cao ?inh L?ng
(5, 41), -- Blog H?i An ? L?a Mã Châu
(5, 31); -- Blog H?i An ? ?m Trà G?m

GO

PRINT N'?  Database DacSanMienTrung ?ã ???c t?o và insert d? li?u m?u thành công!';
GO