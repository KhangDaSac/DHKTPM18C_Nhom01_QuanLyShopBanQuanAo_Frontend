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
  const [colors, setColors] = useState<string[]>([]);  // State cho colors (hex)
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories (giữ nguyên như cũ)
        const catResponse = await fetch('http://localhost:8080/api/v1/categories');
        const catData = await catResponse.json();
        const activeCats = catData.result.filter((cat: any) => cat.isActive);
        const catMap: Record<string, Category> = {};
        activeCats.forEach((cat: any) => {
          const catId = cat.id.toString();
          catMap[catId] = { id: catId, label: cat.name };
        });
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
        roots.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        roots.forEach(root => {
          if (root.children) {
            root.children.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          }
        });
        setCategories(roots);

        // Fetch top colors mới
        const colorsResponse = await fetch('http://localhost:8080/api/v1/product-variants/colors');
        if (!colorsResponse.ok) {
          throw new Error('Failed to fetch colors');
        }
        const colorsData = await colorsResponse.json();
        const topColors = colorsData.result.map((item: { color: string }) => item.color);  // Lấy tên color

        // Map tên color sang hex (mở rộng map này dựa trên database)
        const colorMap: Record<string, string> = {
          'Trắng': '#ffffff',
          'Xanh': '#0000ff',
          'Đen': '#000000',
          'Đỏ': '#ff0000',
          // Thêm các color khác nếu cần
        };
        const hexColors = topColors.map((name: string) => colorMap[name] || '#cccccc');  // Default gray nếu không map
        setColors(hexColors);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleOpen = (id: string) => setOpen(prev => ({ ...prev, [id]: !prev[id] }));

  if (error) {
    return <aside style={{ paddingLeft: 12 }}><div style={{ color: 'red' }}>Error: {error}</div></aside>;
  }

  if (loading) {
    return <aside style={{ paddingLeft: 12 }}><div>Loading...</div></aside>;  // Hoặc Spinner như trước
  }

  return (
    <aside style={{ paddingLeft: 12 }}>
      {/* Phần categories giữ nguyên */}
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
        colors={colors}  // Pass colors động từ state
        sizes={['S','M','L','XL']}
        selected={filtersSelected ?? { prices: [], colors: [], sizes: [] }}
        onChange={onFiltersChange ?? (() => {})}
      />

      {/* Phần reset giữ nguyên */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => {
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