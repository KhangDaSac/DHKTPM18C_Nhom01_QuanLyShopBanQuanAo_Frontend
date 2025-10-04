import React, { useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Image,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Popconfirm,
    Checkbox,
    Slider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UploadOutlined,
    DownloadOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    InboxOutlined,
    TagOutlined,
    CopyOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '../../components/common-styles.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Interface cho variant sản phẩm  
interface ProductVariant {
    id: string;
    color?: string;
    size?: string;
    material?: string;
    price?: number;
    stock: number;
    sku: string;
}

// Interface cho Product với variants
interface Product {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    salePrice?: number;
    stock: number;
    status: 'active' | 'inactive' | 'deleted';
    image: string;
    description: string;
    tags: string[];
    createdAt: string;
    variants?: ProductVariant[];
}

// Mock data - 40 sản phẩm với hình ảnh thật
const initialProductsRaw = [
    {
        id: 1, name: 'Áo Thun Nam Cổ Tròn Basic', sku: 'ATN001', category: 'Áo Nam', price: 199000, salePrice: 179000, stock: 150,
        status: 'active', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
        description: 'Áo thun nam chất liệu cotton 100%, form regular fit, phù hợp mọi dáng người',
        tags: ['Nam', 'Cotton', 'Basic'], createdAt: '2024-01-15'
    },
    {
        id: 2, name: 'Váy Maxi Hoa Nhí Nữ', sku: 'VMN002', category: 'Váy Nữ', price: 350000, salePrice: 315000, stock: 75,
        status: 'active', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
        description: 'Váy maxi họa tiết hoa nhí, chất liệu voan mềm mại, phong cách thanh lịch',
        tags: ['Nữ', 'Maxi', 'Hoa'], createdAt: '2024-01-16'
    },
    {
        id: 3, name: 'Quần Jeans Slim Fit Nam', sku: 'QJN003', category: 'Quần Nam', price: 450000, salePrice: 0, stock: 89,
        status: 'active', image: 'https://images.unsplash.com/photo-1542272454315-7ad9f6620c3c?w=300&h=300&fit=crop',
        description: 'Quần jeans nam form slim fit, chất liệu denim cao cấp, bền đẹp',
        tags: ['Nam', 'Jeans', 'Slim'], createdAt: '2024-01-17'
    },
    {
        id: 4, name: 'Áo Blouse Nữ Tay Dài', sku: 'ABN004', category: 'Áo Nữ', price: 280000, salePrice: 0, stock: 120,
        status: 'active', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
        description: 'Áo blouse nữ tay dài, chất liệu silk cao cấp, thiết kế thanh lịch',
        tags: ['Nữ', 'Blouse', 'Silk'], createdAt: '2024-01-18'
    },
    {
        id: 5, name: 'Giày Sneaker Nam Trắng', sku: 'GSN005', category: 'Giày Nam', price: 850000, salePrice: 765000, stock: 45,
        status: 'active', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
        description: 'Giày sneaker nam màu trắng, chất liệu da cao cấp, đế cao su chống trượt',
        tags: ['Nam', 'Sneaker', 'Da'], createdAt: '2024-01-19'
    },
    {
        id: 6, name: 'Túi Xách Nữ Da Thật', sku: 'TXN006', category: 'Phụ Kiện', price: 1200000, salePrice: 0, stock: 25,
        status: 'active', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
        description: 'Túi xách nữ chất liệu da thật 100%, thiết kế sang trọng, đựng được laptop',
        tags: ['Nữ', 'Túi', 'Da'], createdAt: '2024-01-20'
    },
    {
        id: 7, name: 'Áo Khoác Hoodie Unisex', sku: 'AKH007', category: 'Áo Khoác', price: 380000, salePrice: 342000, stock: 95,
        status: 'active', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
        description: 'Áo khoác hoodie unisex, chất liệu nỉ cotton ấm áp, form oversized',
        tags: ['Unisex', 'Hoodie', 'Cotton'], createdAt: '2024-01-21'
    },
    {
        id: 8, name: 'Chân Váy Chữ A Nữ', sku: 'CVA008', category: 'Váy Nữ', price: 220000, salePrice: 0, stock: 110,
        status: 'active', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a13d77?w=300&h=300&fit=crop',
        description: 'Chân váy chữ A, chất liệu kaki cao cấp, dáng đẹp tôn vóc dáng',
        tags: ['Nữ', 'Váy', 'Kaki'], createdAt: '2024-01-22'
    },
    {
        id: 9, name: 'Áo Polo Nam Cao Cấp', sku: 'APN009', category: 'Áo Nam', price: 320000, salePrice: 288000, stock: 85,
        status: 'active', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop',
        description: 'Áo polo nam chất liệu pique cotton, form regular fit, màu sắc đa dạng',
        tags: ['Nam', 'Polo', 'Cotton'], createdAt: '2024-01-23'
    },
    {
        id: 10, name: 'Giày Cao Gót Nữ 7cm', sku: 'GCG010', category: 'Giày Nữ', price: 650000, salePrice: 0, stock: 35,
        status: 'active', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop',
        description: 'Giày cao gót nữ 7cm, chất liệu da bóng, thiết kế thanh lịch phù hợp công sở',
        tags: ['Nữ', 'Cao gót', 'Da'], createdAt: '2024-01-24'
    },
    {
        id: 11, name: 'Quần Short Nam Thể Thao', sku: 'QSN011', category: 'Quần Nam', price: 180000, salePrice: 162000, stock: 200,
        status: 'active', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop',
        description: 'Quần short nam thể thao, chất liệu polyester thoáng mát, có túi zip',
        tags: ['Nam', 'Short', 'Thể thao'], createdAt: '2024-01-25'
    },
    {
        id: 12, name: 'Áo Sơ Mi Nữ Sọc', sku: 'ASM012', category: 'Áo Nữ', price: 250000, salePrice: 0, stock: 70,
        status: 'active', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop',
        description: 'Áo sơ mi nữ họa tiết sọc, chất liệu cotton mềm mại, phong cách công sở',
        tags: ['Nữ', 'Sơ mi', 'Sọc'], createdAt: '2024-01-26'
    },
    {
        id: 13, name: 'Đồng Hồ Nam Thể Thao', sku: 'DHN013', category: 'Phụ Kiện', price: 890000, salePrice: 0, stock: 40,
        status: 'active', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300&h=300&fit=crop',
        description: 'Đồng hồ nam thể thao, chống nước 50m, màn hình LED đa chức năng',
        tags: ['Nam', 'Đồng hồ', 'Thể thao'], createdAt: '2024-01-27'
    },
    {
        id: 14, name: 'Áo Len Nữ Cổ Lọ', sku: 'ALN014', category: 'Áo Nữ', price: 420000, salePrice: 378000, stock: 60,
        status: 'active', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
        description: 'Áo len nữ cổ lọ, chất liệu wool cao cấp, form fitted tôn dáng',
        tags: ['Nữ', 'Len', 'Wool'], createdAt: '2024-01-28'
    },
    {
        id: 15, name: 'Quần Jogger Nam', sku: 'QJN015', category: 'Quần Nam', price: 290000, salePrice: 0, stock: 130,
        status: 'active', image: 'https://images.unsplash.com/photo-1506629905607-9b61e7e5b88b?w=300&h=300&fit=crop',
        description: 'Quần jogger nam, chất liệu cotton blend, dáng slim fit hiện đại',
        tags: ['Nam', 'Jogger', 'Cotton'], createdAt: '2024-01-29'
    },
    {
        id: 16, name: 'Sandal Nữ Đi Biển', sku: 'SND016', category: 'Giày Nữ', price: 320000, salePrice: 288000, stock: 80,
        status: 'active', image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=300&h=300&fit=crop',
        description: 'Sandal nữ đi biển, chất liệu cao su chống trượt, thiết kế nhẹ nhàng',
        tags: ['Nữ', 'Sandal', 'Biển'], createdAt: '2024-01-30'
    },
    {
        id: 17, name: 'Áo Tank Top Nữ', sku: 'ATT017', category: 'Áo Nữ', price: 150000, salePrice: 135000, stock: 180,
        status: 'active', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
        description: 'Áo tank top nữ, chất liệu modal mềm mịn, form body fit',
        tags: ['Nữ', 'Tank top', 'Modal'], createdAt: '2024-02-01'
    },
    {
        id: 18, name: 'Quần Âu Nam Công Sở', sku: 'QAN018', category: 'Quần Nam', price: 520000, salePrice: 0, stock: 55,
        status: 'active', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
        description: 'Quần âu nam công sở, chất liệu wool blend, dáng straight fit',
        tags: ['Nam', 'Âu', 'Công sở'], createdAt: '2024-02-02'
    },
    {
        id: 19, name: 'Mũ Lưỡi Trai Unisex', sku: 'MLT019', category: 'Phụ Kiện', price: 120000, salePrice: 108000, stock: 160,
        status: 'active', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop',
        description: 'Mũ lưỡi trai unisex, chất liệu cotton twill, có thể điều chỉnh size',
        tags: ['Unisex', 'Mũ', 'Cotton'], createdAt: '2024-02-03'
    },
    {
        id: 20, name: 'Váy Ôm Body Nữ', sku: 'VOB020', category: 'Váy Nữ', price: 380000, salePrice: 0, stock: 45,
        status: 'active', image: 'https://images.unsplash.com/photo-1566479179817-c2b90a032f2b?w=300&h=300&fit=crop',
        description: 'Váy ôm body nữ, chất liệu spandex co giãn, form fitted quyến rũ',
        tags: ['Nữ', 'Ôm', 'Spandex'], createdAt: '2024-02-04'
    },
    {
        id: 21, name: 'Áo Thun Polo Nữ', sku: 'ATP021', category: 'Áo Nữ', price: 280000, salePrice: 252000, stock: 90,
        status: 'active', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
        description: 'Áo thun polo nữ, chất liệu pique cotton, phong cách thể thao thanh lịch',
        tags: ['Nữ', 'Polo', 'Cotton'], createdAt: '2024-02-05'
    },
    {
        id: 22, name: 'Giày Lười Nam Da', sku: 'GLN022', category: 'Giày Nam', price: 750000, salePrice: 0, stock: 30,
        status: 'active', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&h=300&fit=crop',
        description: 'Giày lười nam da thật, thiết kế lịch lãm, phù hợp đi làm và dạo phố',
        tags: ['Nam', 'Lười', 'Da'], createdAt: '2024-02-06'
    },
    {
        id: 23, name: 'Balo Laptop 15 inch', sku: 'BLL023', category: 'Phụ Kiện', price: 680000, salePrice: 612000, stock: 70,
        status: 'active', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
        description: 'Balo laptop 15 inch, chất liệu vải Oxford chống nước, nhiều ngăn tiện dụng',
        tags: ['Unisex', 'Balo', 'Laptop'], createdAt: '2024-02-07'
    },
    {
        id: 24, name: 'Quần Legging Nữ', sku: 'QLN024', category: 'Quần Nữ', price: 180000, salePrice: 0, stock: 140,
        status: 'active', image: 'https://images.unsplash.com/photo-1506629905607-9b61e7e5b88b?w=300&h=300&fit=crop',
        description: 'Quần legging nữ, chất liệu spandex co giãn 4 chiều, tập gym và yoga',
        tags: ['Nữ', 'Legging', 'Yoga'], createdAt: '2024-02-08'
    },
    {
        id: 25, name: 'Áo Vest Nam Slim', sku: 'AVN025', category: 'Áo Khoác', price: 890000, salePrice: 0, stock: 25,
        status: 'active', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
        description: 'Áo vest nam slim fit, chất liệu wool cao cấp, phong cách doanh nhân',
        tags: ['Nam', 'Vest', 'Wool'], createdAt: '2024-02-09'
    },
    {
        id: 26, name: 'Dép Tông Nữ Đi Trong Nhà', sku: 'DTN026', category: 'Giày Nữ', price: 95000, salePrice: 85500, stock: 200,
        status: 'active', image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=300&h=300&fit=crop',
        description: 'Dép tông nữ đi trong nhà, chất liệu EVA mềm nhẹ, đế chống trượt',
        tags: ['Nữ', 'Dép', 'EVA'], createdAt: '2024-02-10'
    },
    {
        id: 27, name: 'Áo Croptop Nữ', sku: 'ACT027', category: 'Áo Nữ', price: 190000, salePrice: 0, stock: 110,
        status: 'active', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
        description: 'Áo croptop nữ, chất liệu cotton co giãn, phong cách trẻ trung năng động',
        tags: ['Nữ', 'Croptop', 'Cotton'], createdAt: '2024-02-11'
    },
    {
        id: 28, name: 'Thắt Lưng Nam Da', sku: 'TLN028', category: 'Phụ Kiện', price: 380000, salePrice: 342000, stock: 85,
        status: 'active', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
        description: 'Thắt lưng nam da thật, khóa kim loại cao cấp, độ rộng 3.5cm',
        tags: ['Nam', 'Thắt lưng', 'Da'], createdAt: '2024-02-12'
    },
    {
        id: 29, name: 'Quần Culotte Nữ', sku: 'QCN029', category: 'Quần Nữ', price: 320000, salePrice: 0, stock: 75,
        status: 'active', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
        description: 'Quần culotte nữ, chất liệu voan mềm mại, dáng ống rộng thanh lịch',
        tags: ['Nữ', 'Culotte', 'Voan'], createdAt: '2024-02-13'
    },
    {
        id: 30, name: 'Áo Khoác Jeans Nam', sku: 'AKJ030', category: 'Áo Khoác', price: 450000, salePrice: 405000, stock: 60,
        status: 'active', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
        description: 'Áo khoác jeans nam, chất liệu denim wash vintage, form regular fit',
        tags: ['Nam', 'Jeans', 'Vintage'], createdAt: '2024-02-14'
    },
    {
        id: 31, name: 'Túi Đeo Chéo Nữ Mini', sku: 'TDC031', category: 'Phụ Kiện', price: 280000, salePrice: 0, stock: 95,
        status: 'active', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop',
        description: 'Túi đeo chéo nữ mini, chất liệu PU cao cấp, thiết kế nhỏ gọn tiện lợi',
        tags: ['Nữ', 'Túi', 'Mini'], createdAt: '2024-02-15'
    },
    {
        id: 32, name: 'Quần Tây Nữ Ống Suông', sku: 'QTN032', category: 'Quần Nữ', price: 420000, salePrice: 0, stock: 50,
        status: 'active', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop',
        description: 'Quần tây nữ ống suông, chất liệu polyester cao cấp, phong cách công sở',
        tags: ['Nữ', 'Tây', 'Công sở'], createdAt: '2024-02-16'
    },
    {
        id: 33, name: 'Giày Thể Thao Nữ Trắng', sku: 'GTT033', category: 'Giày Nữ', price: 690000, salePrice: 621000, stock: 40,
        status: 'active', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop',
        description: 'Giày thể thao nữ màu trắng, chất liệu canvas và da, đế cao su chống trượt',
        tags: ['Nữ', 'Thể thao', 'Canvas'], createdAt: '2024-02-17'
    },
    {
        id: 34, name: 'Áo Kiểu Nữ Họa Tiết', sku: 'AKN034', category: 'Áo Nữ', price: 350000, salePrice: 0, stock: 65,
        status: 'active', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop',
        description: 'Áo kiểu nữ họa tiết hoa lá, chất liệu chiffon nhẹ nhàng, phong cách nữ tính',
        tags: ['Nữ', 'Kiểu', 'Chiffon'], createdAt: '2024-02-18'
    },
    {
        id: 35, name: 'Quần Kaki Nam Chinos', sku: 'QKN035', category: 'Quần Nam', price: 380000, salePrice: 342000, stock: 80,
        status: 'active', image: 'https://images.unsplash.com/photo-1542272454315-7ad9f6620c3c?w=300&h=300&fit=crop',
        description: 'Quần kaki nam chinos, chất liệu cotton twill, form slim fit hiện đại',
        tags: ['Nam', 'Kaki', 'Chinos'], createdAt: '2024-02-19'
    },
    {
        id: 36, name: 'Kính Mát Nam Pilot', sku: 'KMN036', category: 'Phụ Kiện', price: 450000, salePrice: 0, stock: 35,
        status: 'active', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=300&fit=crop',
        description: 'Kính mát nam kiểu pilot, tròng polarized chống UV, gọng kim loại cao cấp',
        tags: ['Nam', 'Kính', 'Pilot'], createdAt: '2024-02-20'
    },
    {
        id: 37, name: 'Váy Sơ Mi Nữ Dài', sku: 'VSM037', category: 'Váy Nữ', price: 390000, salePrice: 351000, stock: 55,
        status: 'active', image: 'https://images.unsplash.com/photo-1566479179817-c2b90a032f2b?w=300&h=300&fit=crop',
        description: 'Váy sơ mi nữ dài, chất liệu cotton mềm mại, phong cách thanh lịch',
        tags: ['Nữ', 'Sơ mi', 'Cotton'], createdAt: '2024-02-21'
    },
    {
        id: 38, name: 'Áo Phông Nam In Hình', sku: 'APN038', category: 'Áo Nam', price: 220000, salePrice: 0, stock: 120,
        status: 'active', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
        description: 'Áo phông nam in hình độc đáo, chất liệu cotton 100%, form oversize',
        tags: ['Nam', 'Phông', 'In hình'], createdAt: '2024-02-22'
    },
    {
        id: 39, name: 'Giày Boot Nữ Cổ Cao', sku: 'GBN039', category: 'Giày Nữ', price: 850000, salePrice: 0, stock: 20,
        status: 'active', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=300&fit=crop',
        description: 'Giày boot nữ cổ cao, chất liệu da lộn, gót vuông 5cm, phong cách cá tính',
        tags: ['Nữ', 'Boot', 'Da lộn'], createdAt: '2024-02-23'
    },
    {
        id: 40, name: 'Áo Blazer Nữ Công Sở', sku: 'ABN040', category: 'Áo Khoác', price: 680000, salePrice: 612000, stock: 30,
        status: 'active', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop',
        description: 'Áo blazer nữ công sở, chất liệu polyester cao cấp, form fitted thanh lịch',
        tags: ['Nữ', 'Blazer', 'Công sở'], createdAt: '2024-02-24'
    }
];

// Convert raw data to proper Product type
const initialProducts: Product[] = initialProductsRaw.map(product => ({
    ...product,
    status: product.status as 'active' | 'inactive' | 'deleted'
}));

const categories = [
    'Áo Nam', 'Áo Nữ', 'Quần Nam', 'Quần Nữ', 'Váy Nữ', 'Giày Nam', 'Giày Nữ', 'Áo Khoác', 'Phụ Kiện'
];

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // States cho bulk actions và filtering  
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // State cho variant modal
    const [isVariantModalVisible, setIsVariantModalVisible] = useState(false);
    const [editingVariants, setEditingVariants] = useState<ProductVariant[]>([]);

    // Filtered products (excluding deleted unless showDeleted is true)
    const filteredProducts = products.filter(p => {
        if (!showDeleted && p.status === 'deleted') return false;
        if (filterCategory !== 'all' && p.category !== filterCategory) return false;
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
        return true;
    });

    // Statistics
    const totalProducts = products.filter(p => p.status !== 'deleted').length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const outOfStockProducts = products.filter(p => p.stock === 0 && p.status !== 'deleted').length;
    const totalValue = products.filter(p => p.status !== 'deleted').reduce((sum, p) => sum + (p.price * p.stock), 0);
    const deletedProducts = products.filter(p => p.status === 'deleted').length;

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (image: string) => (
                <Image
                    width={50}
                    height={50}
                    src={image}
                    fallback="/api/placeholder/50/50"
                    style={{ borderRadius: '4px' }}
                />
            ),
        },
        {
            title: 'Thông tin sản phẩm',
            key: 'product_info',
            render: (record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {record.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        SKU: {record.sku}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.category}
                    </div>
                </div>
            ),
        },
        {
            title: 'Giá',
            key: 'price',
            render: (record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {record.salePrice > 0 ? (
                            <>
                                <span style={{ color: '#ff4d4f', textDecoration: 'line-through' }}>
                                    {record.price.toLocaleString()}đ
                                </span>
                                <br />
                                <span className="text-primary">
                                    {record.salePrice.toLocaleString()}đ
                                </span>
                            </>
                        ) : (
                            <span className="text-primary">
                                {record.price.toLocaleString()}đ
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => (
                <span style={{
                    color: stock === 0 ? '#ff4d4f' : stock < 20 ? '#faad14' : '#52c41a',
                    fontWeight: 'bold'
                }}>
                    {stock}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string, record: Product) => {
                if (status === 'deleted') {
                    return (
                        <div className="status-tag-container">
                            <Tag color="red">Đã xóa</Tag>
                        </div>
                    );
                }

                const handleToggleStatusClick = () => {
                    handleToggleStatus(record.id, status);
                };

                const getText = () => {
                    switch (status) {
                        case 'active': return 'Đang bán';
                        case 'inactive': return 'Ngừng bán';
                        default: return status;
                    }
                };

                return (
                    <div className="status-button-container">
                        <Button
                            size="small"
                            onClick={handleToggleStatusClick}
                            className={`status-button ${status}`}
                        >
                            {getText()}
                        </Button>
                    </div>
                );
            },
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string[]) => (
                <div>
                    {tags.map(tag => (
                        <Tag key={tag} style={{ marginBottom: '2px', fontSize: '12px' }}>
                            {tag}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            title: 'Biến thể',
            key: 'variants',
            width: 120,
            render: (record: Product) => (
                <div>
                    {record.variants && record.variants.length > 0 ? (
                        <>
                            <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                                {record.variants.length} biến thể
                            </Text>
                            <br />
                            <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                    setEditingVariants(record.variants || []);
                                    setIsVariantModalVisible(true);
                                }}
                            >
                                Quản lý
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                setEditingVariants([]);
                                setIsVariantModalVisible(true);
                            }}
                        >
                            Thêm biến thể
                        </Button>
                    )}
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (record: Product) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        title="Xem chi tiết"
                    />
                    {record.status !== 'deleted' && (
                        <>
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEdit(record)}
                                title="Chỉnh sửa"
                            />
                            <Button
                                type="text"
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(record)}
                                title="Sao chép"
                            />
                            <Popconfirm
                                title="Bạn có chắc muốn xóa sản phẩm này?"
                                onConfirm={() => handleSoftDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Xóa mềm"
                                />
                            </Popconfirm>
                        </>
                    )}
                    {record.status === 'deleted' && (
                        <>
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={() => handleRestore(record.id)}
                                title="Khôi phục"
                            />
                            <Popconfirm
                                title="Bạn có chắc muốn xóa vĩnh viễn sản phẩm này?"
                                onConfirm={() => handleHardDelete(record.id)}
                                okText="Xóa vĩnh viễn"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Xóa vĩnh viễn"
                                />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        form.setFieldsValue({
            ...product,
            tags: product.tags.join(', ')
        });
        setIsModalVisible(true);
    };

    const handleView = (product: any) => {
        setViewingProduct(product);
        setIsViewModalVisible(true);
    };

    // Soft delete - đánh dấu là deleted
    const handleSoftDelete = (id: number) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, status: 'deleted' as const } : p
        ));
        message.success('Đã xóa sản phẩm (có thể khôi phục)');
    };

    // Hard delete - xóa vĩnh viễn
    const handleHardDelete = (id: number) => {
        setProducts(products.filter(p => p.id !== id));
        message.success('Đã xóa vĩnh viễn sản phẩm');
    };

    // Khôi phục sản phẩm đã xóa
    const handleRestore = (id: number) => {
        setProducts(products.map(p =>
            p.id === id ? { ...p, status: 'active' as const } : p
        ));
        message.success('Đã khôi phục sản phẩm');
    };

    // Sao chép sản phẩm
    const handleCopy = (product: Product) => {
        const newProduct: Product = {
            ...product,
            id: Math.max(...products.map(p => p.id)) + 1,
            name: `${product.name} (Copy)`,
            sku: `${product.sku}_COPY_${Date.now().toString().slice(-4)}`,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setProducts([...products, newProduct]);
        message.success('Đã sao chép sản phẩm');
    };

    // Toggle status function
    const handleToggleStatus = (id: number, currentStatus: string) => {
        if (currentStatus === 'deleted') {
            message.warning('Không thể thay đổi trạng thái sản phẩm đã xóa');
            return;
        }

        const newStatus = currentStatus === 'active' ? 'inactive' as const : 'active' as const;
        setProducts(products.map(p =>
            p.id === id ? { ...p, status: newStatus } : p
        ));
        message.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} sản phẩm`);
    };

    // Bulk actions
    const handleBulkAction = (action: string) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn ít nhất một sản phẩm');
            return;
        }

        const selectedIds = selectedRowKeys as number[];

        switch (action) {
            case 'delete':
                setProducts(products.map(p =>
                    selectedIds.includes(p.id) ? { ...p, status: 'deleted' as const } : p
                ));
                message.success(`Đã xóa ${selectedIds.length} sản phẩm`);
                break;
            case 'activate':
                setProducts(products.map(p =>
                    selectedIds.includes(p.id) ? { ...p, status: 'active' as const } : p
                ));
                message.success(`Đã kích hoạt ${selectedIds.length} sản phẩm`);
                break;
            case 'deactivate':
                setProducts(products.map(p =>
                    selectedIds.includes(p.id) ? { ...p, status: 'inactive' as const } : p
                ));
                message.success(`Đã vô hiệu hóa ${selectedIds.length} sản phẩm`);
                break;
        }
        setSelectedRowKeys([]);
    };    // Chức năng xuất Excel
    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(products.map(product => ({
            'ID': product.id,
            'Tên sản phẩm': product.name,
            'SKU': product.sku,
            'Danh mục': product.category,
            'Giá gốc': product.price,
            'Giá khuyến mãi': product.salePrice || '',
            'Tồn kho': product.stock,
            'Trạng thái': product.status === 'active' ? 'Hoạt động' : 'Ngừng bán',
            'Mô tả': product.description,
            'Tags': product.tags.join(', '),
            'Ngày tạo': product.createdAt
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
        XLSX.writeFile(workbook, `san-pham-${new Date().toISOString().split('T')[0]}.xlsx`);
        message.success('Đã xuất file Excel thành công!');
    };

    // Chức năng nhập Excel
    const handleImportExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

                const importedProducts = jsonData.map((row, index) => ({
                    id: Math.max(...products.map(p => p.id)) + index + 1,
                    name: row['Tên sản phẩm'] || '',
                    sku: row['SKU'] || `SKU${Date.now()}${index}`,
                    category: row['Danh mục'] || 'Khác',
                    price: parseInt(row['Giá gốc']) || 0,
                    salePrice: parseInt(row['Giá khuyến mãi']) || 0,
                    stock: parseInt(row['Tồn kho']) || 0,
                    status: (row['Trạng thái'] === 'Hoạt động' ? 'active' : 'inactive') as 'active' | 'inactive',
                    image: '/api/placeholder/150/150',
                    description: row['Mô tả'] || '',
                    tags: row['Tags'] ? row['Tags'].split(', ') : [],
                    createdAt: row['Ngày tạo'] || new Date().toISOString().split('T')[0]
                }));

                setProducts([...products, ...importedProducts]);
                message.success(`Đã nhập ${importedProducts.length} sản phẩm từ Excel!`);
            } catch (error) {
                message.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
            }
        };
        reader.readAsArrayBuffer(file);
        return false; // Prevent default upload behavior
    };

    const handleSave = async (values: any) => {
        setLoading(true);
        try {
            const productData = {
                ...values,
                tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [],
                id: editingProduct ? editingProduct.id : Date.now(),
                createdAt: editingProduct?.createdAt || new Date().toISOString().split('T')[0]
            };

            if (editingProduct) {
                setProducts(products.map(p =>
                    p.id === editingProduct.id ? { ...p, ...productData } : p
                ));
                message.success('Đã cập nhật sản phẩm thành công');
            } else {
                setProducts([...products, productData]);
                message.success('Đã thêm sản phẩm thành công');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2} className="text-primary" style={{ marginBottom: '24px' }}>
                Quản lý Sản phẩm
            </Title>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={5}>
                    <Card>
                        <Statistic
                            title="Tổng sản phẩm"
                            value={totalProducts}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                    <Card>
                        <Statistic
                            title="Đang bán"
                            value={activeProducts}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Hết hàng"
                            value={outOfStockProducts}
                            prefix={<TagOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Đã xóa"
                            value={deletedProducts}
                            prefix={<DeleteOutlined />}
                            valueStyle={{ color: '#8c8c8c' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={24} lg={6}>
                    <Card>
                        <Statistic
                            title="Giá trị kho"
                            value={totalValue}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                            valueStyle={{ color: '#722ed1' }}
                            formatter={(value) => `${Number(value).toLocaleString()}`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Action Bar */}
            <Card style={{ marginBottom: '16px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space wrap>
                            <Input.Search
                                placeholder="Tìm kiếm sản phẩm..."
                                style={{ width: 300 }}
                                allowClear
                            />
                            <Select
                                placeholder="Danh mục"
                                style={{ width: 150 }}
                                allowClear
                                value={filterCategory === 'all' ? undefined : filterCategory}
                                onChange={(value) => setFilterCategory(value || 'all')}
                            >
                                {categories.map(cat => (
                                    <Option key={cat} value={cat}>{cat}</Option>
                                ))}
                            </Select>
                            <div style={{ width: 200 }}>
                                <Text style={{ fontSize: '12px', color: '#666' }}>Giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ</Text>
                                <Slider
                                    range
                                    min={0}
                                    max={2000000}
                                    step={50000}
                                    value={priceRange}
                                    onChange={(value) => setPriceRange(value as [number, number])}
                                />
                            </div>
                            <div>
                                <Checkbox
                                    checked={showDeleted}
                                    onChange={(e) => setShowDeleted(e.target.checked)}
                                >
                                    Hiện sản phẩm đã xóa ({deletedProducts})
                                </Checkbox>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="default"
                                icon={<DownloadOutlined />}
                                onClick={handleExportExcel}
                            >
                                Xuất Excel
                            </Button>
                            <Upload
                                accept=".xlsx,.xls"
                                beforeUpload={handleImportExcel}
                                showUploadList={false}
                            >
                                <Button icon={<UploadOutlined />}>
                                    Nhập Excel
                                </Button>
                            </Upload>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                className="btn-primary"
                            >
                                Thêm sản phẩm
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Bulk Actions */}
            {selectedRowKeys.length > 0 && (
                <Card style={{ marginBottom: '16px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text strong>Đã chọn {selectedRowKeys.length} sản phẩm</Text>
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    onClick={() => handleBulkAction('activate')}
                                    type="default"
                                >
                                    Kích hoạt
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('deactivate')}
                                    type="default"
                                >
                                    Vô hiệu hóa
                                </Button>
                                <Button
                                    onClick={() => handleBulkAction('delete')}
                                    danger
                                >
                                    Xóa tất cả
                                </Button>
                                <Button
                                    onClick={() => setSelectedRowKeys([])}
                                >
                                    Bỏ chọn
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Products Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredProducts}
                    rowKey="id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        getCheckboxProps: (record: Product) => ({
                            disabled: record.status === 'deleted'
                        })
                    }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={loading}
                width={800}
                okText={editingProduct ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                            >
                                <Input placeholder="Nhập tên sản phẩm" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="sku"
                                label="SKU"
                                rules={[{ required: true, message: 'Vui lòng nhập SKU' }]}
                            >
                                <Input placeholder="Nhập mã SKU" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục">
                                    {categories.map(cat => (
                                        <Option key={cat} value={cat}>{cat}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value="active">Đang bán</Option>
                                    <Option value="inactive">Ngừng bán</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="price"
                                label="Giá gốc (đ)"
                                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="salePrice"
                                label="Giá khuyến mãi (đ)"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="stock"
                                label="Số lượng tồn kho"
                                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả sản phẩm"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Nhập mô tả sản phẩm"
                        />
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags (phân cách bằng dấu phẩy)"
                    >
                        <Input placeholder="Ví dụ: Nam, Thun, Basic" />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="Hình ảnh sản phẩm"
                    >
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Product Modal */}
            <Modal
                title="Chi tiết sản phẩm"
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {viewingProduct && (
                    <div>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Image
                                    width="100%"
                                    src={viewingProduct.image}
                                    fallback="/api/placeholder/200/200"
                                />
                            </Col>
                            <Col span={16}>
                                <Title level={4}>{viewingProduct.name}</Title>
                                <p><strong>SKU:</strong> {viewingProduct.sku}</p>
                                <p><strong>Danh mục:</strong> {viewingProduct.category}</p>
                                <p><strong>Giá:</strong>
                                    {viewingProduct.salePrice && viewingProduct.salePrice > 0 ? (
                                        <>
                                            <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                                {viewingProduct.price.toLocaleString()}đ
                                            </span>
                                            {' → '}
                                            <span className="text-primary" style={{ fontWeight: 'bold' }}>
                                                {viewingProduct.salePrice?.toLocaleString()}đ
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-primary" style={{ fontWeight: 'bold' }}>
                                            {viewingProduct.price.toLocaleString()}đ
                                        </span>
                                    )}
                                </p>
                                <p><strong>Tồn kho:</strong> {viewingProduct.stock}</p>
                                <p><strong>Trạng thái:</strong>
                                    <Tag color={viewingProduct.status === 'active' ? 'green' : 'red'} style={{ marginLeft: '8px' }}>
                                        {viewingProduct.status === 'active' ? 'Đang bán' : 'Hết hàng'}
                                    </Tag>
                                </p>
                                <p><strong>Tags:</strong></p>
                                <div>
                                    {viewingProduct.tags.map((tag: string) => (
                                        <Tag key={tag}>{tag}</Tag>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                        {viewingProduct.description && (
                            <div style={{ marginTop: '16px' }}>
                                <Title level={5}>Mô tả:</Title>
                                <p>{viewingProduct.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Variants Management Modal */}
            <Modal
                title="Quản lý biến thể sản phẩm"
                open={isVariantModalVisible}
                onCancel={() => setIsVariantModalVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setIsVariantModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="save" type="primary" onClick={() => {
                        // Save variants logic would go here
                        setIsVariantModalVisible(false);
                        message.success('Đã lưu biến thể');
                    }}>
                        Lưu biến thể
                    </Button>
                ]}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            const newVariant: ProductVariant = {
                                id: `variant_${Date.now()}`,
                                color: '',
                                size: '',
                                material: '',
                                price: 0,
                                stock: 0,
                                sku: `VAR_${Date.now()}`
                            };
                            setEditingVariants([...editingVariants, newVariant]);
                        }}
                        block
                    >
                        Thêm biến thể mới
                    </Button>
                </div>

                {editingVariants.map((variant, index) => (
                    <Card key={variant.id} size="small" style={{ marginBottom: '12px' }}>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Input
                                    placeholder="Màu sắc"
                                    value={variant.color}
                                    onChange={(e) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].color = e.target.value;
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                            <Col span={4}>
                                <Input
                                    placeholder="Size"
                                    value={variant.size}
                                    onChange={(e) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].size = e.target.value;
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                            <Col span={6}>
                                <Input
                                    placeholder="Chất liệu"
                                    value={variant.material}
                                    onChange={(e) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].material = e.target.value;
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    placeholder="Giá"
                                    value={variant.price}
                                    onChange={(value) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].price = value || 0;
                                        setEditingVariants(newVariants);
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={3}>
                                <InputNumber
                                    placeholder="Kho"
                                    value={variant.stock}
                                    onChange={(value) => {
                                        const newVariants = [...editingVariants];
                                        newVariants[index].stock = value || 0;
                                        setEditingVariants(newVariants);
                                    }}
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={1}>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                        const newVariants = editingVariants.filter((_, i) => i !== index);
                                        setEditingVariants(newVariants);
                                    }}
                                />
                            </Col>
                        </Row>
                    </Card>
                ))}

                {editingVariants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Chưa có biến thế nào. Nhấn "Thêm biến thể mới" để bắt đầu.
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Products;