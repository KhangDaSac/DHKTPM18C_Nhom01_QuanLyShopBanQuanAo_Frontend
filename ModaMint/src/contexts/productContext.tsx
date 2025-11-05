import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { productService } from "../services/product";
import type { ProductResponse } from "../services/product";

// Định nghĩa interface cho ProductContext
interface ProductContextType {
    products: ProductResponse[];
    isLoading: boolean;
    error: string | null;
    fetchProducts: () => Promise<void>;
    refreshProducts: () => Promise<void>;
}

// Định nghĩa interface cho ProductProvider props
interface ProductProviderProps {
    children: ReactNode;
}

// 1. Tạo Context
const ProductContext = createContext<ProductContextType | null>(null);

// 2. Custom hook để dễ sử dụng
export const useProducts = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};

// 3. Provider component
export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Hàm fetch danh sách sản phẩm
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await productService.getAllProducts();

            if (result.success && result.data) {
                setProducts(result.data);
            } else {
                setError(result.message || 'Không thể lấy danh sách sản phẩm');
            }
        } catch (err) {
            const errorMessage = 'Có lỗi xảy ra khi tải sản phẩm';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm refresh (giống fetchProducts nhưng có thể thêm logic khác)
    const refreshProducts = async () => {
        await fetchProducts();
    };

    // Auto fetch khi component mount (chỉ fetch khi cần)
    // Comment out để tránh auto-fetch, chỉ fetch khi vào trang cần thiết
    // useEffect(() => {
    //     fetchProducts();
    // }, []);

    // Context value
    const contextValue: ProductContextType = {
        products,
        isLoading,
        error,
        fetchProducts,
        refreshProducts,
    };

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

