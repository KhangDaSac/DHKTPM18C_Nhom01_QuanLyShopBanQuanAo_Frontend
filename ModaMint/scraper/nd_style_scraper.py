#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ND Style Web Scraper
Cào dữ liệu từ trang web ND Style (https://nd-style.mysapo.net/)
Lấy thông tin sản phẩm, danh mục, nhãn hiệu và xuất ra file JSON
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin, urlparse
import logging
from typing import Dict, List, Optional
import os

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper/scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class NDStyleScraper:
    def __init__(self, base_url: str = "https://nd-style.mysapo.net"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        self.scraped_data = {
            'categories': [],
            'products': [],
            'brands': [],
            'promotions': [],
            'metadata': {
                'scraped_at': None,
                'total_products': 0,
                'total_categories': 0,
                'base_url': base_url
            }
        }

    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """Lấy và parse trang web"""
        try:
            logger.info(f"Đang truy cập: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            logger.error(f"Lỗi khi truy cập {url}: {e}")
            return None

    def extract_price(self, price_text: str) -> Dict[str, float]:
        """Trích xuất giá từ text"""
        if not price_text:
            return {'original': 0, 'sale': 0, 'discount_percent': 0}
        
        # Tìm tất cả số trong text
        numbers = re.findall(r'[\d,]+', price_text.replace('.', ''))
        numbers = [int(num.replace(',', '')) for num in numbers]
        
        if len(numbers) >= 2:
            # Có giá gốc và giá sale
            return {
                'original': numbers[1],
                'sale': numbers[0],
                'discount_percent': round((numbers[1] - numbers[0]) / numbers[1] * 100, 2) if numbers[1] > 0 else 0
            }
        elif len(numbers) == 1:
            # Chỉ có một giá
            return {
                'original': numbers[0],
                'sale': numbers[0],
                'discount_percent': 0
            }
        else:
            return {'original': 0, 'sale': 0, 'discount_percent': 0}

    def scrape_categories(self) -> List[Dict]:
        """Cào danh mục sản phẩm từ menu"""
        logger.info("Bắt đầu cào danh mục...")
        categories = []
        
        soup = self.get_page(self.base_url)
        if not soup:
            return categories
        
        # Tìm menu chính
        menu_items = soup.find_all(['a', 'span'], string=re.compile(r'(Nữ|Nam|Phụ kiện|Áo|Quần|Đồ thể thao)', re.IGNORECASE))
        
        category_map = {
            'Nữ': 'women',
            'Nam': 'men',
            'Phụ kiện': 'accessories',
            'Áo': 'tops',
            'Quần': 'bottoms',
            'Đồ thể thao': 'sportswear'
        }
        
        for item in menu_items:
            text = item.get_text(strip=True)
            if text in category_map:
                categories.append({
                    'id': len(categories) + 1,
                    'name': text,
                    'slug': category_map[text],
                    'parent_id': None,
                    'level': 1
                })
        
        # Tìm subcategories
        subcategory_elements = soup.find_all('a', href=re.compile(r'/.*'))
        for element in subcategory_elements:
            href = element.get('href', '')
            text = element.get_text(strip=True)
            
            if text and len(text) > 2 and 'http' not in href:
                # Xác định parent category
                parent_id = None
                for cat in categories:
                    if cat['name'] in text or any(keyword in text.lower() for keyword in ['nữ', 'nam']):
                        parent_id = cat['id']
                        break
                
                categories.append({
                    'id': len(categories) + 1,
                    'name': text,
                    'slug': text.lower().replace(' ', '-'),
                    'parent_id': parent_id,
                    'level': 2,
                    'url': urljoin(self.base_url, href)
                })
        
        logger.info(f"Đã cào được {len(categories)} danh mục")
        return categories

    def scrape_products_from_page(self, soup: BeautifulSoup, category: str = None) -> List[Dict]:
        """Cào sản phẩm từ một trang"""
        products = []
        
        # Tìm các element chứa sản phẩm
        product_elements = soup.find_all(['div', 'article'], class_=re.compile(r'(product|item)', re.IGNORECASE))
        
        # Nếu không tìm thấy, thử tìm theo pattern khác
        if not product_elements:
            product_elements = soup.find_all('div', string=re.compile(r'₫'))
        
        for element in product_elements:
            try:
                product = self.extract_product_info(element, category)
                if product:
                    products.append(product)
            except Exception as e:
                logger.warning(f"Lỗi khi cào sản phẩm: {e}")
                continue
        
        return products

    def extract_product_info(self, element, category: str = None) -> Optional[Dict]:
        """Trích xuất thông tin sản phẩm từ element"""
        try:
            # Tìm tên sản phẩm
            name_element = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) or element.find('a')
            if not name_element:
                return None
            
            name = name_element.get_text(strip=True)
            if not name or len(name) < 3:
                return None
            
            # Tìm giá
            price_text = element.get_text()
            prices = self.extract_price(price_text)
            
            # Tìm hình ảnh
            img_element = element.find('img')
            image_url = ""
            if img_element:
                src = img_element.get('src') or img_element.get('data-src')
                if src:
                    image_url = urljoin(self.base_url, src)
            
            # Tìm link sản phẩm
            link_element = element.find('a')
            product_url = ""
            if link_element and link_element.get('href'):
                product_url = urljoin(self.base_url, link_element.get('href'))
            
            # Tìm thông tin khác
            description = ""
            desc_element = element.find(['p', 'span'], class_=re.compile(r'(desc|info)', re.IGNORECASE))
            if desc_element:
                description = desc_element.get_text(strip=True)
            
            # Tìm mã sản phẩm từ URL hoặc text
            product_code = ""
            if product_url:
                product_code = product_url.split('/')[-1] or product_url.split('/')[-2]
            
            return {
                'id': len(self.scraped_data['products']) + 1,
                'name': name,
                'code': product_code,
                'description': description,
                'category': category or 'uncategorized',
                'brand': 'ND Style',
                'prices': prices,
                'image_url': image_url,
                'product_url': product_url,
                'in_stock': True,
                'rating': 0,
                'reviews_count': 0,
                'created_at': None,
                'updated_at': None
            }
            
        except Exception as e:
            logger.warning(f"Lỗi khi trích xuất thông tin sản phẩm: {e}")
            return None

    def scrape_promotions(self) -> List[Dict]:
        """Cào thông tin khuyến mãi"""
        logger.info("Bắt đầu cào thông tin khuyến mãi...")
        promotions = []
        
        soup = self.get_page(self.base_url)
        if not soup:
            return promotions
        
        # Tìm các mã khuyến mãi
        promo_elements = soup.find_all(string=re.compile(r'(FREESHIP|OFF|%|giảm)', re.IGNORECASE))
        
        for i, promo_text in enumerate(promo_elements):
            if len(promo_text.strip()) > 3:
                promotions.append({
                    'id': i + 1,
                    'code': promo_text.strip(),
                    'description': promo_text.strip(),
                    'discount_type': 'percentage' if '%' in promo_text else 'fixed',
                    'discount_value': 0,
                    'min_order_amount': 0,
                    'expires_at': None,
                    'is_active': True
                })
        
        logger.info(f"Đã cào được {len(promotions)} khuyến mãi")
        return promotions

    def scrape_all_products(self) -> List[Dict]:
        """Cào tất cả sản phẩm từ trang chủ và các trang danh mục"""
        logger.info("Bắt đầu cào tất cả sản phẩm...")
        all_products = []
        
        # Cào từ trang chủ
        soup = self.get_page(self.base_url)
        if soup:
            products = self.scrape_products_from_page(soup, 'featured')
            all_products.extend(products)
            logger.info(f"Đã cào {len(products)} sản phẩm từ trang chủ")
        
        # Cào từ các danh mục
        categories = self.scraped_data['categories']
        for category in categories[:5]:  # Giới hạn để tránh quá tải
            if category.get('url'):
                soup = self.get_page(category['url'])
                if soup:
                    products = self.scrape_products_from_page(soup, category['name'])
                    all_products.extend(products)
                    logger.info(f"Đã cào {len(products)} sản phẩm từ danh mục {category['name']}")
                    time.sleep(1)  # Delay để tránh bị block
        
        logger.info(f"Tổng cộng đã cào được {len(all_products)} sản phẩm")
        return all_products

    def run_scraper(self):
        """Chạy scraper hoàn chỉnh"""
        logger.info("Bắt đầu quá trình cào dữ liệu từ ND Style...")
        
        try:
            # Cào danh mục
            self.scraped_data['categories'] = self.scrape_categories()
            
            # Cào khuyến mãi
            self.scraped_data['promotions'] = self.scrape_promotions()
            
            # Cào sản phẩm
            self.scraped_data['products'] = self.scrape_all_products()
            
            # Cập nhật metadata
            self.scraped_data['metadata']['scraped_at'] = time.strftime('%Y-%m-%d %H:%M:%S')
            self.scraped_data['metadata']['total_products'] = len(self.scraped_data['products'])
            self.scraped_data['metadata']['total_categories'] = len(self.scraped_data['categories'])
            
            # Thêm thông tin nhãn hiệu
            self.scraped_data['brands'] = [{
                'id': 1,
                'name': 'ND Style',
                'description': 'Thương hiệu thời trang ND Style',
                'logo_url': '',
                'website': self.base_url,
                'country': 'Vietnam'
            }]
            
            logger.info("Hoàn thành quá trình cào dữ liệu!")
            return True
            
        except Exception as e:
            logger.error(f"Lỗi trong quá trình cào dữ liệu: {e}")
            return False

    def save_to_json(self, filename: str = 'nd_style_data.json'):
        """Lưu dữ liệu ra file JSON"""
        try:
            filepath = os.path.join('scraper', filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(self.scraped_data, f, ensure_ascii=False, indent=2)
            logger.info(f"Đã lưu dữ liệu vào file: {filepath}")
            return True
        except Exception as e:
            logger.error(f"Lỗi khi lưu file JSON: {e}")
            return False

    def print_summary(self):
        """In tóm tắt dữ liệu đã cào"""
        print("\n" + "="*50)
        print("TÓM TẮT DỮ LIỆU ĐÃ CÀO")
        print("="*50)
        print(f"Tổng số danh mục: {len(self.scraped_data['categories'])}")
        print(f"Tổng số sản phẩm: {len(self.scraped_data['products'])}")
        print(f"Tổng số nhãn hiệu: {len(self.scraped_data['brands'])}")
        print(f"Tổng số khuyến mãi: {len(self.scraped_data['promotions'])}")
        print(f"Thời gian cào: {self.scraped_data['metadata']['scraped_at']}")
        
        if self.scraped_data['products']:
            print("\nMột số sản phẩm mẫu:")
            for i, product in enumerate(self.scraped_data['products'][:3]):
                print(f"{i+1}. {product['name']} - {product['prices']['sale']:,}₫")
        
        print("="*50)

def main():
    """Hàm main để chạy scraper"""
    scraper = NDStyleScraper()
    
    print("ND Style Web Scraper")
    print("Đang bắt đầu cào dữ liệu...")
    
    success = scraper.run_scraper()
    
    if success:
        scraper.save_to_json()
        scraper.print_summary()
        print("\n✅ Hoàn thành! Dữ liệu đã được lưu vào file JSON.")
    else:
        print("\n❌ Có lỗi xảy ra trong quá trình cào dữ liệu.")

if __name__ == "__main__":
    main()
