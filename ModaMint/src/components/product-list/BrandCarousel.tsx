import React, { useRef, useState, useEffect } from 'react';

type Props = {
  onSelect?: (ids: number[]) => void;
  selectedBrands?: number[]; // Thay đổi: nhận array of brand IDs
};

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const BrandCarousel: React.FC<Props> = ({ onSelect, selectedBrands = [] }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedBrands);

  // Đồng bộ selectedIds với selectedBrands từ parent
  useEffect(() => {
    setSelectedIds(selectedBrands || []);
  }, [selectedBrands]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/brands');
        const data = await response.json();
        if (data && Array.isArray(data.result)) {
          setBrands(
            data.result.map((b: any) => ({
              id: b.id,
              name: b.name,
              logo: b.image || 'https://via.placeholder.com/130',
            }))
          );
        } else {
          setBrands([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thương hiệu:', error);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandClick = (brandId: number) => {
    let newSelectedIds: number[];

    if (selectedIds.includes(brandId)) {
      // Nếu brand đã được chọn thì bỏ chọn
      newSelectedIds = selectedIds.filter(id => id !== brandId);
    } else {
      // Thêm brand vào danh sách chọn
      newSelectedIds = [...selectedIds, brandId];
    }

    setSelectedIds(newSelectedIds);
    onSelect?.(newSelectedIds);
  };

  const itemWidth = 130;
  const gap = 40;
  const visibleItems = 5;
  const padding = 40;
  const paddingX = padding * 2;
  const visibleWidth = visibleItems * itemWidth + (visibleItems - 1) * gap;
  const containerWidth = visibleWidth + paddingX;

  const scrollBy = (dir: 'left' | 'right') => {
    const el = ref.current;
    if (!el) return;
    const offset = (dir === 'left' ? -1 : 1) * (itemWidth + gap);
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', marginBottom: 40 }}>
      {/* Nút trái */}
      <button
        onClick={() => scrollBy('left')}
        style={{
          position: 'absolute',
          left: 220,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid #f5dada',
          background: '#fff',
          color: '#ff7b7b',
          fontSize: 16,
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        ‹
      </button>

      {/* Nội dung carousel */}
      <div
        ref={ref}
        style={{
          display: 'flex',
          gap: 40,
          alignItems: 'center',
          overflowX: 'auto',
          padding: `10px ${padding}px`,
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          width: containerWidth,
          margin: '0 auto',
        }}
      >
        {brands.map((brand) => (
          <div
            key={brand.id}
            style={{
              minWidth: 130,
              textAlign: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              onClick={() => handleBrandClick(brand.id)}
              style={{
                width: 130,
                height: 130,
                borderRadius: '50%',
                backgroundColor: '#fff',
                borderWidth: 0.1,
                borderStyle: 'solid',
                borderColor: '#ffdede',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: selectedIds.includes(brand.id)
                  ? '0 4px 12px rgba(0,0,0,0.3)'
                  : 'none',

              }}
              onMouseEnter={(e) => {
                if (!selectedIds.includes(brand.id)) {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedIds.includes(brand.id)) {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                style={{
                  width: selectedIds.includes(brand.id) ? '85%' : '80%',
                  height: 'auto',
                  objectFit: 'contain',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
            <button
              onClick={() => handleBrandClick(brand.id)}
              style={{
                border: '1px solid #ffdede',
                background: selectedIds.includes(brand.id) ? '#000' : '#fff',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: selectedIds.includes(brand.id) ? '#fff' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!selectedIds.includes(brand.id)) {
                  e.currentTarget.style.backgroundColor = '#fff2f1';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedIds.includes(brand.id)) {
                  e.currentTarget.style.backgroundColor = '#fff';
                }
              }}
            >
              {brand.name}
            </button>
          </div>
        ))}
      </div>

      {/* Ẩn scrollbar Chrome */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Nút phải */}
      <button
        onClick={() => scrollBy('right')}
        style={{
          position: 'absolute',
          right: 220,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '1px solid #f5dada',
          background: '#fff',
          color: '#ff7b7b',
          fontSize: 16,
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
      >
        ›
      </button>
    </div>
  );
};

export default BrandCarousel;