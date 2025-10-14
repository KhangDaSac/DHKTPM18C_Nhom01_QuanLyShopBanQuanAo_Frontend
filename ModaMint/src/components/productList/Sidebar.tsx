import React, { useState } from 'react';
import Filters from './Filters';

type Category = { id: string; label: string; children?: { id: string; label: string }[] };

type Props = {
  onCategory?: (catId?: string) => void;
  filtersSelected?: { prices: string[]; colors: string[]; sizes: string[] };
  onFiltersChange?: (next: { prices: string[]; colors: string[]; sizes: string[] }) => void;
};

const CATS: Category[] = [
  { id: 'phukien-nam', label: 'Phụ kiện nam', children: [ { id: 'giay', label: 'Giày' }, { id: 'vi', label: 'Ví' }, { id: 'that-lung', label: 'Thắt lưng' } ] },
  { id: 'ao-nam', label: 'Áo nam' },
  { id: 'quan-nam', label: 'Quần nam' },
  { id: 'phukien-nu', label: 'Phụ kiện nữ' },
  { id: 'ao-nu', label: 'Áo nữ' },
  { id: 'quan-nu', label: 'Quần nữ' },
];

const Sidebar: React.FC<Props> = ({ onCategory, filtersSelected, onFiltersChange }) => {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggleOpen = (id: string) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside style={{ paddingLeft: 12 }}>
      <div style={{ marginBottom: 20 }}>
        <h4>Danh mục sản phẩm</h4>
        <div>
          {CATS.map(cat => (
            <div key={cat.id} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => onCategory?.(cat.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>{cat.label}</button>
                {cat.children ? (
                  <button onClick={() => toggleOpen(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{open[cat.id] ? '▴' : '▾'}</button>
                ) : null}
              </div>

              {cat.children && open[cat.id] ? (
                <div style={{ paddingLeft: 12, marginTop: 6 }}>
                  {cat.children.map(c => (
                    <div key={c.id}>
                      <button onClick={() => onCategory?.(c.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>{c.label}</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <Filters
        prices={[
          { id: 'p1', label: 'Dưới 200.000đ', min: 0, max: 200000 },
          { id: 'p2', label: '200.000đ - 500.000đ', min: 200000, max: 500000 },
          { id: 'p3', label: '500.000đ - 700.000đ', min: 500000, max: 700000 },
          { id: 'p4', label: '700.000đ - 1.000.000đ', min: 700000, max: 1000000 },
          { id: 'p5', label: 'Trên 1.000.000đ', min: 1000000 }
        ]}
        colors={["#000000", "#ff0000", "#0000ff"]} // Match the colors in MOCK data
        sizes={['S','M','L','XL']}
        selected={filtersSelected ?? { prices: [], colors: [], sizes: [] }}
        onChange={onFiltersChange ?? (() => {})}
      />
      
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => {
            // reset filters to initial empty state and clear category selection as well
            onFiltersChange?.({ prices: [], colors: [], sizes: [] });
            onCategory?.(undefined);
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Reset bộ lọc
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
