import React from 'react';

type PriceRange = { id: string; label: string; min?: number; max?: number };

type Props = {
  prices: PriceRange[];
  colors: string[];
  sizes: string[];
  selected: {
    prices: string[];
    colors: string[];
    sizes: string[];
  };
  onChange: (next: { prices: string[]; colors: string[]; sizes: string[] }) => void;
};

const Filters: React.FC<Props> = ({ prices, colors, sizes, selected, onChange }) => {
  const toggle = (arr: string[], val: string) => {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        {prices.map((p) => (
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
                checked={selected.prices.includes(p.id)}
                onChange={() => onChange({ ...selected, prices: toggle(selected.prices, p.id) })}
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

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...selected, colors: toggle(selected.colors, c) })}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: c,
                border: selected.colors.includes(c) ? '2px solid #333' : '1px solid #ddd',
                cursor: 'pointer',
                padding: 0,
                outline: 'none'
              }}
              title={c === '#000000' ? 'Đen' : c === '#ff0000' ? 'Đỏ' : 'Xanh'}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sizes.map(s => (
            <button
              key={s}
              onClick={() => onChange({ ...selected, sizes: toggle(selected.sizes, s) })}
              style={{
                minWidth: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                border: selected.sizes.includes(s) ? '2px solid #333' : '1px solid #ddd',
                background: selected.sizes.includes(s) ? '#f3f3f3' : '#fff',
                cursor: 'pointer',
                fontWeight: selected.sizes.includes(s) ? 'bold' : 'normal'
              }}
            >{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
