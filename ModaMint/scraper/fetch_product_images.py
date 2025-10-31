#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script để lấy hình ảnh sản phẩm từ Picsum Photos và tạo SQL UPDATE script
Sử dụng Picsum Photos API (miễn phí, không cần API key)
"""

import requests
import json
import time
import random
from typing import List, Dict, Optional
import logging
import re

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ProductImageFetcher:
    """Class để lấy ảnh sản phẩm từ Picsum Photos"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Mapping từ tên sản phẩm/category sang seeds để có ảnh nhất quán
        # Mỗi product sẽ có 4 seeds khác nhau để có 4 ảnh khác nhau
        self.category_seeds = {
            # Áo Nam
            9: {'base': 1000, 'name': 'Áo Sơ Mi'},    # Áo Sơ Mi Nam
            10: {'base': 2000, 'name': 'Áo Thun'},    # Áo Thun Nam
            11: {'base': 3000, 'name': 'Áo Khoác'},   # Áo Khoác Nam
            12: {'base': 4000, 'name': 'Áo Vest'},    # Áo Vest
            
            # Áo Nữ
            13: {'base': 5000, 'name': 'Áo Sơ Mi'},   # Áo Sơ Mi Nữ
            14: {'base': 6000, 'name': 'Áo Thun'},    # Áo Thun Nữ
            15: {'base': 7000, 'name': 'Áo Khoác'},   # Áo Khoác Nữ
            16: {'base': 8000, 'name': 'Đầm'},        # Đầm
            
            # Quần Nam
            17: {'base': 9000, 'name': 'Quần Jeans'}, # Quần Jeans Nam
            18: {'base': 10000, 'name': 'Quần Kaki'}, # Quần Kaki
            19: {'base': 11000, 'name': 'Quần Short'},# Quần Short Nam
            
            # Quần Nữ
            20: {'base': 12000, 'name': 'Quần Jeans'},# Quần Jeans Nữ
            21: {'base': 13000, 'name': 'Quần Legging'},# Legging
            22: {'base': 14000, 'name': 'Quần Short'},# Quần Short Nữ
        }
        
    def get_picsum_images(self, product_id: int, category_id: int, count: int = 4, width: int = 800, height: int = 1000) -> List[str]:
        """
        Lấy ảnh từ Picsum Photos với seed để có ảnh nhất quán
        Mỗi sản phẩm sẽ có các ảnh khác nhau nhưng cùng style
        """
        try:
            images = []
            
            # Lấy base seed từ category
            base_seed = self.category_seeds.get(category_id, {}).get('base', 1000)
            
            # Tạo seeds cho từng ảnh: base_seed + product_id + index
            # Điều này đảm bảo mỗi sản phẩm có 4 ảnh khác nhau nhưng cùng category có style tương tự
            for i in range(count):
                seed = base_seed + (product_id * 10) + i
                # Picsum Photos với seed
                url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
                images.append(url)
                
            logger.info(f"Đã tạo {len(images)} URLs ảnh cho product ID {product_id} (category {category_id})")
            return images
            
        except Exception as e:
            logger.error(f"Lỗi khi tạo URLs ảnh: {e}")
            # Fallback: random images
            return [f"https://picsum.photos/{width}/{height}?random={random.randint(1, 10000)}" for _ in range(count)]
    
    def get_variant_image(self, variant_id: int, product_id: int, category_id: Optional[int] = None, width: int = 600, height: int = 600) -> str:
        base_seed = self.category_seeds.get(category_id or 0, {}).get('base', 15000)
        seed = base_seed + (product_id * 100) + variant_id
        return f"https://picsum.photos/seed/{seed}/{width}/{height}"
    
    def generate_sql_updates(self, products: List[Dict], output_file: str = 'update_product_images_picsum.sql') -> str:
        """
        Tạo SQL UPDATE statements từ danh sách sản phẩm và ảnh
        """
        sql_statements = []
        sql_statements.append("-- Script to update product images from Picsum Photos")
        sql_statements.append("-- Generated automatically by fetch_product_images.py")
        sql_statements.append("-- Images format: url1|url2|url3|url4 (using | delimiter)")
        sql_statements.append("-- Image size: 800x1000px")
        sql_statements.append("")
        
        for product in products:
            product_id = product['id']
            product_name = product['name']
            images = product['images']
            
            # Format: url1|url2|url3|url4
            images_str = '|'.join(images)
            
            # Escape single quotes trong SQL
            images_str_escaped = images_str.replace("'", "''")
            
            sql = f"UPDATE products SET images = '{images_str_escaped}' WHERE id = {product_id};"
            sql_statements.append(f"-- {product_name}")
            sql_statements.append(sql)
            sql_statements.append("")
        
        # Ghi vào file
        sql_content = '\n'.join(sql_statements)
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(sql_content)
            logger.info(f"Đã lưu SQL script vào: {output_file}")
        except Exception as e:
            logger.error(f"Lỗi khi ghi file SQL: {e}")
        
        return sql_content


def load_products_from_sql(sql_file: str) -> List[Dict]:
    """
    Đọc danh sách sản phẩm từ file SQL
    """
    products = []
    
    # Category mapping từ category_id sang tên category
    category_map = {
        9: 'Áo Sơ Mi', 10: 'Áo Thun', 11: 'Áo Khoác', 12: 'Áo Vest',
        13: 'Áo Sơ Mi', 14: 'Áo Thun', 15: 'Áo Khoác', 16: 'Đầm',
        17: 'Quần Jeans', 18: 'Quần Kaki', 19: 'Quần Short',
        20: 'Quần Jeans', 21: 'Quần Legging', 22: 'Quần Short'
    }
    
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Tìm tất cả INSERT statements cho products
        # Pattern: (1, 'Áo Sơ Mi Trắng Nam', 1, 9, ...
        pattern = r"\((\d+),\s*'([^']+)',\s*(\d+),\s*(\d+)"
        matches = re.findall(pattern, content)
        
        for match in matches:
            product_id = int(match[0])
            product_name = match[1]
            brand_id = int(match[2])
            category_id = int(match[3])
            
            category_name = category_map.get(category_id, '')
            
            products.append({
                'id': product_id,
                'name': product_name,
                'brand_id': brand_id,
                'category_id': category_id,
                'category': category_name
            })
        
        logger.info(f"Đã đọc {len(products)} sản phẩm từ SQL file")
        
    except Exception as e:
        logger.error(f"Lỗi khi đọc file SQL: {e}")
    
    return products


def create_product_list() -> List[Dict]:
    """
    Tạo danh sách sản phẩm dựa trên SQL file (fallback nếu không parse được)
    """
    category_map = {
        9: 'Áo Sơ Mi', 10: 'Áo Thun', 11: 'Áo Khoác', 12: 'Áo Vest',
        13: 'Áo Sơ Mi', 14: 'Áo Thun', 15: 'Áo Khoác', 16: 'Đầm',
        17: 'Quần Jeans', 18: 'Quần Kaki', 19: 'Quần Short',
        20: 'Quần Jeans', 21: 'Quần Legging', 22: 'Quần Short'
    }
    
    products = []
    
    # Áo Nam (1-15)
    ao_nam_data = [
        (1, 'Áo Sơ Mi Trắng Nam', 9), (2, 'Áo Sơ Mi Xanh Nam', 9), (3, 'Áo Thun Basic Nam', 10),
        (4, 'Áo Thun Polo Nam', 10), (5, 'Áo Khoác Bomber Nam', 11), (6, 'Áo Khoác Hoodie Nam', 11),
        (7, 'Áo Vest Nam', 12), (8, 'Áo Vest Kẻ Sọc Nam', 12), (9, 'Áo Sơ Mi Kẻ Sọc Nam', 9),
        (10, 'Áo Thun Graphic Nam', 10), (11, 'Áo Khoác Denim Nam', 11), (12, 'Áo Khoác Blazer Nam', 11),
        (13, 'Áo Sơ Mi Flannel Nam', 9), (14, 'Áo Thun Tank Top Nam', 10), (15, 'Áo Vest 3 Mảnh Nam', 12)
    ]
    
    # Áo Nữ (16-30)
    ao_nu_data = [
        (16, 'Áo Sơ Mi Trắng Nữ', 13), (17, 'Áo Sơ Mi Hoa Nữ', 13), (18, 'Áo Thun Basic Nữ', 14),
        (19, 'Áo Thun Crop Top Nữ', 14), (20, 'Áo Khoác Cardigan Nữ', 15), (21, 'Áo Khoác Blazer Nữ', 15),
        (22, 'Đầm Dài Nữ', 16), (23, 'Đầm Ngắn Nữ', 16), (24, 'Áo Sơ Mi Oversize Nữ', 13),
        (25, 'Áo Thun Long Sleeve Nữ', 14), (26, 'Áo Khoác Hoodie Nữ', 15), (27, 'Áo Khoác Bomber Nữ', 15),
        (28, 'Đầm Maxi Nữ', 16), (29, 'Đầm Mini Nữ', 16), (30, 'Áo Sơ Mi Silk Nữ', 13)
    ]
    
    # Quần Nam (31-40)
    quan_nam_data = [
        (31, 'Quần Jeans Nam', 17), (32, 'Quần Jeans Đen Nam', 17), (33, 'Quần Kaki Nam', 18),
        (34, 'Quần Kaki Xanh Nam', 18), (35, 'Quần Short Nam', 19), (36, 'Quần Short Thể Thao Nam', 19),
        (37, 'Quần Jeans Skinny Nam', 17), (38, 'Quần Kaki Cargo Nam', 18), (39, 'Quần Short Bermuda Nam', 19),
        (40, 'Quần Jeans Ripped Nam', 17)
    ]
    
    # Quần Nữ (41-50)
    quan_nu_data = [
        (41, 'Quần Jeans Nữ', 20), (42, 'Quần Jeans Đen Nữ', 20), (43, 'Quần Legging Nữ', 21),
        (44, 'Quần Legging Thể Thao Nữ', 21), (45, 'Quần Short Nữ', 22), (46, 'Quần Short Denim Nữ', 22),
        (47, 'Quần Jeans Skinny Nữ', 20), (48, 'Quần Legging Yoga Nữ', 21), (49, 'Quần Short High Waist Nữ', 22),
        (50, 'Quần Jeans Mom Fit Nữ', 20)
    ]
    
    all_data = ao_nam_data + ao_nu_data + quan_nam_data + quan_nu_data
    
    for product_id, name, category_id in all_data:
        products.append({
            'id': product_id,
            'name': name,
            'category_id': category_id,
            'category': category_map.get(category_id, '')
        })
    
    return products


def load_variants_from_sql(sql_file: str) -> List[Dict]:
    """
    Đọc danh sách variant (id, product_id) từ file SQL
    """
    variants = []
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            content = f.read()
        # Tìm các dòng VALUES của product_variants: (id, product_id, size, color, image, ...)
        pattern_values_block = r"INSERT INTO product_variants\s*\([^)]*\)\s*VALUES\s*(.*?);"
        matches = re.findall(pattern_values_block, content, flags=re.DOTALL | re.IGNORECASE)
        for block in matches:
            rows = re.split(r"\),\s*\(", block.strip().strip(';').strip())
            for row in rows:
                row = row.strip().strip('()')
                cols = [v.strip() for v in re.split(r",\s*(?=(?:[^']*'[^']*')*[^']*$)", row)]
                if len(cols) >= 2:
                    try:
                        vid = int(cols[0])
                        pid = int(cols[1])
                        variants.append({'id': vid, 'product_id': pid})
                    except ValueError:
                        continue
        logger.info(f"Đã đọc {len(variants)} variants từ SQL file")
    except Exception as e:
        logger.error(f"Lỗi khi đọc variants từ SQL: {e}")
    return variants


def generate_variant_sql_updates(variants: List[Dict], product_category_map: Dict[int, int], output_file: str) -> str:
    """
    Tạo SQL UPDATE cho bảng product_variants.image
    """
    sql_statements = []
    sql_statements.append("-- Script to update product_variants images from Picsum Photos")
    sql_statements.append("-- Generated automatically by fetch_product_images.py")
    sql_statements.append("-- Image size: 600x600px")
    sql_statements.append("")

    fetcher = ProductImageFetcher()
    for v in variants:
        variant_id = v['id']
        product_id = v['product_id']
        category_id = product_category_map.get(product_id)
        url = fetcher.get_variant_image(variant_id, product_id, category_id, width=600, height=600)
        url_escaped = url.replace("'", "''")
        sql_statements.append(f"UPDATE product_variants SET image = '{url_escaped}' WHERE id = {variant_id};")
    
    content = "\n".join(sql_statements)
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(content)
        logger.info(f"Đã lưu SQL variant images vào: {output_file}")
    except Exception as e:
        logger.error(f"Lỗi khi ghi file variant SQL: {e}")
    return content


def main():
    """Hàm main để chạy script"""
    print("=" * 60)
    print("SCRIPT TỰ ĐỘNG LẤY ẢNH SẢN PHẨM TỪ PIXABAY/PICSUM")
    print("=" * 60)
    print()
    
    # Khởi tạo fetcher
    fetcher = ProductImageFetcher()
    
    # Option 1: Đọc sản phẩm từ SQL file
    sql_file = '../../../BE/OrientalFashionShop_Backend/data/modamint_db.sql'
    
    print("📖 Đang đọc danh sách sản phẩm từ SQL file...")
    products = load_products_from_sql(sql_file)
    
    if not products:
        print("⚠️  Không đọc được sản phẩm từ SQL. Dùng danh sách mẫu...")
        products = create_product_list()
    
    print(f"✅ Đã tìm thấy {len(products)} sản phẩm")
    print()
    
    # Lấy ảnh cho từng sản phẩm
    print("🖼️  Đang tạo URLs ảnh...")
    print()
    
    products_with_images = []
    
    for product in products:
        print(f"[{product['id']}/50] {product['name']} - {product['category']}")
        
        # Lấy ảnh (4 ảnh cho mỗi sản phẩm)
        images = fetcher.get_picsum_images(
            product['id'],
            product['category_id'],
            count=4,
            width=800,
            height=1000
        )
        
        product['images'] = images
        products_with_images.append(product)
    
    print()
    print("✅ Đã tạo URLs ảnh cho tất cả sản phẩm!")
    print()
    
    # Tạo SQL script
    print("📝 Đang tạo SQL UPDATE script...")
    output_file = '../../../BE/OrientalFashionShop_Backend/data/update_product_images_picsum.sql'
    sql_content = fetcher.generate_sql_updates(products_with_images, output_file)
    
    # Sau khi tạo product images SQL, tiếp tục tạo variant images SQL
    variants = load_variants_from_sql(sql_file)
    # Map product_id -> category_id
    product_category_map = {p['id']: p['category_id'] for p in products}
    variant_sql_output = '../../../BE/OrientalFashionShop_Backend/data/update_product_variant_images_picsum.sql'
    generate_variant_sql_updates(variants, product_category_map, variant_sql_output)

    print()
    print("=" * 60)
    print("✅ HOÀN THÀNH!")
    print("=" * 60)
    print(f"📁 SQL script đã được lưu tại: {output_file}")
    print()
    print("📋 HƯỚNG DẪN SỬ DỤNG:")
    print("1. Mở file SQL script vừa tạo")
    print("2. Chạy script trong MySQL/PostgreSQL của bạn")
    print("3. Kiểm tra lại dữ liệu trong bảng products")
    print()
    print("💡 LƯU Ý:")
    print("- Ảnh được lấy từ Picsum Photos (miễn phí, không cần API key)")
    print("- Mỗi sản phẩm có 4 ảnh, định dạng: 800x1000px")
    print("- URLs được phân cách bằng dấu | (theo StringSetConverter)")
    print("- Sử dụng seed để đảm bảo ảnh nhất quán cho mỗi sản phẩm")


if __name__ == "__main__":
    main()
