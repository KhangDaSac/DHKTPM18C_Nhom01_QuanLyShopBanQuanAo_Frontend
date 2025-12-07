import React, { useState, useEffect } from 'react';

type Category = { id: string; label: string; children?: Category[] };

type Props = {
  onCategory?: (catId?: string) => void;
  filtersSelected?: { prices: string[]; colors: string[]; sizes: string[] };
  onFiltersChange?: (next: { prices: string[]; colors: string[]; sizes: string[] }) => void;
  onResetAll?: () => void; // Thêm prop mới
};

const Sidebar: React.FC<Props> = ({ onCategory, filtersSelected, onFiltersChange, onResetAll }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);

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
        const topColors = colorsData.result.map((item: { color: string }) => item.color);

        // Map tên color sang hex
        const colorMap: Record<string, string> = {
          'Trắng': '#ffffff',
          'Xanh': '#0000ff',
          'Đen': '#000000',
          'Đỏ': '#ff0000',
        };
        const hexColors = topColors.map((name: string) => colorMap[name] || '#cccccc');
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

  // Handle category click - toggle active state
  const handleCategoryClick = (catId: string) => {
    if (activeCategory === catId) {
      // If clicking the same category again, deselect it
      setActiveCategory(undefined);
      onCategory?.(undefined);
    } else {
      // Select new category
      setActiveCategory(catId);
      onCategory?.(catId);
    }
  };

  // Hàm reset toàn bộ
  const handleReset = () => {
    onFiltersChange?.({ prices: [], colors: [], sizes: [] });
    setActiveCategory(undefined);
    onCategory?.(undefined);
    onResetAll?.(); // Gọi hàm reset all từ parent
  };

  if (error) {
    return <aside style={{ paddingLeft: 12 }}><div style={{ color: 'red' }}>Error: {error}</div></aside>;
  }

  if (loading) {
    return <aside style={{ paddingLeft: 12 }}><div>Loading...</div></aside>;
  }

  return (
    <aside style={{
      paddingLeft: 12,
      border: '1px solid #c3c3c3',
      borderRadius: '6px',
      overflow: 'hidden'
    }}>
      {/* Phần categories giữ nguyên */}
      <div style={{ marginBottom: 0 }}>
        <h4 style={{
          background: '#ff6347',
          color: 'white',
          margin: '0 -12px 12px -12px',
          padding: '12px',
          border: '1px solid #c3c3c3',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          marginBottom: '12px',
          fontSize: '16px',
          fontWeight: '600'
        }}>Danh mục sản phẩm</h4>
        <div style={{ paddingLeft: 12, paddingRight: 12 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  style={{
                    background: activeCategory === cat.id ? '#f0f0f0' : 'none',
                    border: 'none',
                    padding: '8px 8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                    fontSize: '14px',
                    width: '100%',
                    fontWeight: activeCategory === cat.id ? '600' : '400'
                  }}
                >
                  {cat.label}
                </button>
                {cat.children ? (
                  <button
                    onClick={() => toggleOpen(cat.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      marginRight: '8px',
                      padding: '0'
                    }}
                  >
                    {open[cat.id] ? '▴' : '▾'}
                  </button>
                ) : null}
              </div>
              {cat.children && open[cat.id] ? (
                <div style={{ paddingLeft: 12, marginTop: 6 }}>
                  {cat.children.map(c => (
                    <div key={c.id}>
                      <button
                        onClick={() => handleCategoryClick(c.id)}
                        style={{
                          background: activeCategory === c.id ? '#f0f0f0' : 'none',
                          border: 'none',
                          padding: '8px 8px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s',
                          fontSize: '14px',
                          width: '100%',
                          textAlign: 'left',
                          marginLeft: '8px',
                          fontWeight: activeCategory === c.id ? '600' : '400'
                        }}
                      >
                        {c.label}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingLeft: 0, paddingRight: 12, marginTop: '16px' }}>
        <h4 style={{
          background: '#ff6347',
          color: 'white',
          margin: '0 -12px 12px -12px',
          padding: '12px',
          border: '1px solid #c3c3c3',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          fontSize: '16px',
          fontWeight: '600'
        }}>Chọn mức giá</h4>
        <div style={{ paddingLeft: 12, paddingRight: 12 }}>
          <div style={{ marginBottom: 16 }}>
            {[
              { id: 'p1', label: 'Dưới 200.000đ', min: 0, max: 200000 },
              { id: 'p2', label: '200.000đ - 500.000đ', min: 200000, max: 500000 },
              { id: 'p3', label: '500.000đ - 700.000đ', min: 500000, max: 700000 },
              { id: 'p4', label: '700.000đ - 1.000.000đ', min: 700000, max: 1000000 },
              { id: 'p5', label: 'Trên 1.000.000đ', min: 1000000 }
            ].map((p) => (
              <div key={p.id} style={{ marginBottom: 8 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '4px 0'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filtersSelected?.prices.includes(p.id) ?? false}
                    onChange={() => onFiltersChange?.({ ...filtersSelected ?? { prices: [], colors: [], sizes: [] }, prices: (filtersSelected?.prices ?? []).includes(p.id) ? (filtersSelected?.prices ?? []).filter(x => x !== p.id) : [...(filtersSelected?.prices ?? []), p.id] })}
                    style={{
                      width: 16,
                      height: 16,
                      marginRight: 8,
                      cursor: 'pointer'
                    }}
                  />
                  <span>{p.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <h4 style={{
          background: '#ff6347',
          color: 'white',
          margin: '0 -12px 12px -12px',
          padding: '12px',
          border: '1px solid #c3c3c3',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          fontSize: '16px',
          fontWeight: '600'
        }}>Màu phổ biến</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 12, paddingRight: 12, marginBottom: 16 }}>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                const colorMap: Record<string, string> = {
                  '#ffffff': 'Trắng',
                  '#0000ff': 'Xanh',
                  '#000000': 'Đen',
                  '#ff0000': 'Đỏ',
                };
                const colorName = colorMap[c] || c;
                const currentColors = filtersSelected?.colors ?? [];
                const newColors = currentColors.includes(colorName)
                  ? currentColors.filter(x => x !== colorName)
                  : [...currentColors, colorName];
                onFiltersChange?.({ ...filtersSelected ?? { prices: [], colors: [], sizes: [] }, colors: newColors });
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: c,
                border: (filtersSelected?.colors ?? []).includes(c) || (filtersSelected?.colors ?? []).includes({ '#ffffff': 'Trắng', '#0000ff': 'Xanh', '#000000': 'Đen', '#ff0000': 'Đỏ' }[c] || '') ? '2px solid #ff0000' : '1px solid #ddd',
                cursor: 'pointer',
                padding: 0,
                outline: 'none'
              }}
              title={c === '#000000' ? 'Đen' : c === '#ff0000' ? 'Đỏ' : 'Xanh'}
            />
          ))}
        </div>

        <h4 style={{
          background: '#ff6347',
          color: 'white',
          margin: '0 -12px 12px -12px',
          padding: '12px',
          border: '1px solid #c3c3c3',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          fontSize: '16px',
          fontWeight: '600'
        }}>Size</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 12, paddingRight: 12 }}>
          {['S', 'M', 'L', 'XL'].map(s => (
            <button
              key={s}
              onClick={() => {
                const currentSizes = filtersSelected?.sizes ?? [];
                const newSizes = currentSizes.includes(s)
                  ? currentSizes.filter(x => x !== s)
                  : [...currentSizes, s];
                onFiltersChange?.({ ...filtersSelected ?? { prices: [], colors: [], sizes: [] }, sizes: newSizes });
              }}
              style={{
                minWidth: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                border: (filtersSelected?.sizes ?? []).includes(s) ? '2px solid #333' : '1px solid #ddd',
                background: (filtersSelected?.sizes ?? []).includes(s) ? '#f3f3f3' : '#fff',
                cursor: 'pointer',
                fontWeight: (filtersSelected?.sizes ?? []).includes(s) ? 'bold' : 'normal'
              }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Phần reset - sử dụng hàm handleReset mới */}
      <div style={{ marginTop: 16, paddingLeft: 12, paddingRight: 12, paddingBottom: 12 }}>
        <button
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#ff9800',
            color: 'white',
            border: '1px solid #c3c3c3',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f57c00'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ff9800'}
        >
          Reset bộ lọc
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;