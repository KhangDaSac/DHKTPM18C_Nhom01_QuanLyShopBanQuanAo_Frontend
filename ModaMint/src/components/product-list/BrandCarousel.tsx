import React, { useRef, useState, useEffect } from 'react';

type Props = {
  onSelect?: (id: number) => void;
  selectedBrand?: number | null; // Thêm prop để nhận brand đang chọn
};

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const BrandCarousel: React.FC<Props> = ({ onSelect, selectedBrand }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(selectedBrand || null);

  // Đồng bộ selectedId với selectedBrand từ parent
  useEffect(() => {
    setSelectedId(selectedBrand || null);
  }, [selectedBrand]);

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
              logo: b.logo || 'https://via.placeholder.com/130',
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
    if (selectedId === brandId) {
      // Nếu click lại brand đang chọn thì bỏ chọn
      setSelectedId(null);
      onSelect?.(0); // Gửi 0 hoặc undefined để biết là bỏ chọn
    } else {
      // Chọn brand mới
      setSelectedId(brandId);
      onSelect?.(brandId);
    }
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
                width: 130, // Tăng kích thước khi chọn
                height: 130,
                borderRadius: '50%',
                backgroundColor: '#fff4f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: selectedId === brand.id 
                  ? '0 4px 12px rgba(0,0,0,0.3)' 
                  : 'none',
               
              }}
              onMouseEnter={(e) => {
                if (selectedId !== brand.id) {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== brand.id) {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                style={{
                  width: selectedId === brand.id ? '85%' : '80%',
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
                background: selectedId === brand.id ? '#000' : '#fff',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: selectedId === brand.id ? '#fff' : '#333',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedId !== brand.id) {
                  e.currentTarget.style.backgroundColor = '#fff2f1';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== brand.id) {
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