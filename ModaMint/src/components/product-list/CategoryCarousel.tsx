import React, { useRef } from 'react';

type Props = {
  onSelect?: (id: string) => void;
};

const items = [
  { id: 'somi', label: 'SƠ MI', img: 'https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/image_cate_4.png?1749442635129' },
  { id: 'quan', label: 'QUẦN', img: 'https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/image_cate_5.png?1749442635129' },
  { id: 'aokhoac', label: 'ÁO KHOÁC', img: 'https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/image_cate_6.png?1749442635129' },
  { id: 'giaydep', label: 'ÁO NỮ', img: 'https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/image_cate_1.png?1749442635129' },
  { id: 'phukien', label: 'ÁO NAM', img: 'https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/image_cate_3.png?1749442635129' },
  { id: 'vay', label: 'ÁO NAM', img: 'https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/image_cate_3.png?1749442635129' },
  { id: 'giaydep', label: 'ÁO NAM', img: 'https://bizweb.dktcdn.net/100/534/571/themes/972900/assets/image_cate_3.png?1749442635129' },
];

const CategoryCarousel: React.FC<Props> = ({ onSelect }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const itemWidth = 130;
  const gap = 40;
  const visibleItems = 5;
  const padding = 40; // Set to match gap for no partial items
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
        {items.map((it) => (
          <div
            key={it.id}
            style={{
              minWidth: 130,
              textAlign: 'center',
              transition: 'transform 0.3s',
            }}
          >
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: '50%',
                backgroundColor: '#fff4f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                overflow: 'hidden',
              }}
            >
              <img
                src={it.img}
                alt={it.label}
                style={{
                  width: '80%',
                  height: 'auto',
                  objectFit: 'contain',
                  transition: 'transform 0.3s',
                }}
              />
            </div>
            <button
              onClick={() => onSelect?.(it.id)}
              style={{
                border: '1px solid #ffdede',
                background: '#fff',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 13,
                fontWeight: 600,
                color: '#333',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#fff2f1')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#fff')
              }
            >
              {it.label}
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

export default CategoryCarousel;