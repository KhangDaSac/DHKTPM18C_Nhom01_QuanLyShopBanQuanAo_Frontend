import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/product-list/Sidebar";
import Pagination from "../../components/product-list/Pagination";
import SortSelect from "../../components/product-list/SortSelect";
import CategoryCarousel from "../../components/product-list/CategoryCarousel";
import axios from "axios";
import { useCart } from "../../contexts/CartContext";

interface Product {
  id: number;
  name: string;
  price: number;
  active: boolean;
  description: string;
  images: string[];
  brandName: string;
  categoryName: string;
  quantity: number;
}

interface ProductResponse {
  code: number;
  message: string;
  result: Product[];
}

const PAGE_SIZE = 12;

const ProductList: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ prices: string[]; colors: string[]; sizes: string[] }>({
    prices: [],
    colors: [],
    sizes: [],
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ProductResponse>("http://localhost:8080/api/v1/products");
      setProducts(res.data.result ?? []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category && !p.categoryName.toLowerCase().includes(category.toLowerCase())) return false;
      return true;
    });
  }, [products, category, filters]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sort) {
      case "az":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price-desc":
        return copy.sort((a, b) => b.price - a.price);
      default:
        return copy;
    }
  }, [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE) || 1;
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: 12 }}>
      <div style={{ marginBottom: 24 }}>
        <CategoryCarousel onSelect={(id: string) => setCategory(id)} />
      </div>

      <div style={{ display: "flex" }}>
        <main style={{ flex: 3, paddingRight: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h4>
              Tất cả sản phẩm{" "}
              {!loading && (
                <span style={{ color: "#666", fontSize: 14 }}>
                  ({filtered.length} sản phẩm)
                </span>
              )}
            </h4>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div>Sắp xếp theo</div>
              <SortSelect value={sort} onChange={setSort} />
              <button
                onClick={fetchProducts}
                disabled={loading}
                style={{
                  marginLeft: "12px",
                  padding: "6px 12px",
                  backgroundColor: loading ? "#ccc" : "#ff6347",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "12px",
                }}
              >
                {loading ? "⟳" : "↻"} Refresh
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 300,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                    }}
                  />
                ))
              : pageItems.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 8,
                      padding: 12,
                      backgroundColor: "#fff",
                      textAlign: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <img
                      src={p.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image"}
                      alt={p.name}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                    <h4 style={{ marginTop: 8 }}>{p.name}</h4>
                    <p style={{ color: "#555", fontSize: 14 }}>{p.brandName}</p>
                    <p style={{ color: "#e74c3c", fontWeight: 600 }}>
                      {p.price.toLocaleString("vi-VN")} ₫
                    </p>
                    <button
                      onClick={() => addToCart(p.id, 1)}
                      style={{
                        marginTop: 8,
                        padding: "6px 12px",
                        backgroundColor: "#ff6347",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </main>

        <aside style={{ flex: 1, maxWidth: 260 }}>
          <Sidebar
            onCategory={setCategory}
            filtersSelected={filters}
            onFiltersChange={setFilters}
          />
        </aside>
      </div>
    </div>
  );
};

export default ProductList;
