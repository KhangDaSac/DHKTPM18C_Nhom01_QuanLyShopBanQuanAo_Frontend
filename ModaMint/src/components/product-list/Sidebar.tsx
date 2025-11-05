import React, { useState, useEffect } from 'react';
import Filters from './Filters';

type Category = { id: string; label: string; children?: Category[] };

type Props = {
  onCategory?: (catId?: string) => void;
  filtersSelected?: { prices: string[]; colors: string[]; sizes: string[] };
  onFiltersChange?: (next: { prices: string[]; colors: string[]; sizes: string[] }) => void;
};

const Sidebar: React.FC<Props> = ({ onCategory, filtersSelected, onFiltersChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/categories');
        const data = await response.json();
        const activeCats = data.result.filter((cat: any) => cat.isActive);

        // Xây dựng map category
        const catMap: Record<string, Category> = {};
        activeCats.forEach((cat: any) => {
          const catId = cat.id.toString(); // Chuyển id sang string
          catMap[catId] = { id: catId, label: cat.name };
        });

        // Xây dựng cây: Gắn children vào parent
        const roots: Category[] = [];
        activeCats.forEach((cat: any) => {
          const catId = cat.id.toString();
          const parentId = cat.parentId ? cat.parentId.toString() : null;

          if (parentId && catMap[parentId]) {
            const parent = catMap[parentId];
            parent.children = parent.children || [];
            parent.children.push(catMap[catId]);
          } else {
            roots.push(catMap[catId]);
          }
        });

        // Sắp xếp roots và children theo id (tăng dần) để giữ thứ tự ổn định
        roots.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        roots.forEach(root => {
          if (root.children) {
            root.children.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          }
        });

        setCategories(roots);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Chạy chỉ một lần khi mount

  const toggleOpen = (id: string) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return <div>Loading categories...</div>; // Optional: Spinner hoặc placeholder
  }

  return (
    <aside style={{ paddingLeft: 12 }}>
      <div style={{ marginBottom: 20 }}>
        <h4>Danh mục sản phẩm</h4>
        <div>
          {categories.map(cat => (
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