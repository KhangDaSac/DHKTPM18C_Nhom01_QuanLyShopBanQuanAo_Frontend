#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate category images using Picsum Photos and write SQL updates.
- Adds image_url column to categories (if not present) via ALTER TABLE
- Updates each category with a seeded Picsum URL (800x300 banner size)
"""

import re
import logging
from typing import List, Dict

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

SQL_INPUT = '../../../BE/OrientalFashionShop_Backend/data/modamint_db.sql'
SQL_OUTPUT = '../../../BE/OrientalFashionShop_Backend/data/update_category_images_picsum.sql'


def load_categories_from_sql(sql_file: str) -> List[Dict]:
    categories: List[Dict] = []
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            content = f.read()
        # Find all INSERT INTO categories rows: (id, 'name', is_active, parent_id)
        pattern = r"\((\d+),\s*'([^']+)'\s*,\s*(true|false)\s*,\s*(NULL|\d+)\)"
        matches = re.findall(pattern, content, flags=re.IGNORECASE)
        for m in matches:
            cid = int(m[0])
            name = m[1]
            is_active = m[2].lower() == 'true'
            parent = None if m[3].upper() == 'NULL' else int(m[3])
            categories.append({'id': cid, 'name': name, 'is_active': is_active, 'parent_id': parent})
        logger.info(f"Loaded {len(categories)} categories from SQL")
    except Exception as e:
        logger.error(f"Failed to read categories: {e}")
    return categories


def picsum_banner_url(seed: int, width: int = 800, height: int = 300) -> str:
    return f"https://picsum.photos/seed/cat{seed}/{width}/{height}"


def generate_sql(categories: List[Dict]) -> str:
    lines: List[str] = []
    lines.append("-- Add image_url column to categories if it doesn't exist")
    lines.append("-- Note: Adjust ALTER TABLE syntax if using PostgreSQL")
    lines.append("ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url VARCHAR(512) NULL;")
    lines.append("")
    lines.append("-- Update each category image_url")

    for c in categories:
        url = picsum_banner_url(c['id'])
        url_escaped = url.replace("'", "''")
        lines.append(f"-- {c['name']}")
        lines.append(f"UPDATE categories SET image_url = '{url_escaped}' WHERE id = {c['id']};")
        lines.append("")

    return "\n".join(lines)


def main():
    cats = load_categories_from_sql(SQL_INPUT)
    if not cats:
        logger.warning("No categories found; generating default top-level seeds for ids 1..22")
        cats = [{'id': i, 'name': f'Category {i}', 'is_active': True, 'parent_id': None} for i in range(1, 23)]
    sql = generate_sql(cats)
    try:
        with open(SQL_OUTPUT, 'w', encoding='utf-8') as f:
            f.write(sql)
        logger.info(f"Wrote SQL to {SQL_OUTPUT}")
    except Exception as e:
        logger.error(f"Failed to write output SQL: {e}")


if __name__ == '__main__':
    main()
