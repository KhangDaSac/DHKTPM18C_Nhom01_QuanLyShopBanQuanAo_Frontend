import { useState, useEffect } from 'react';
import { productService } from '../services/product';
import type { ProductResponse } from '../services/product';

export const useProducts = () => {
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        // Kiểm tra token trước khi gọi API
        const authDataStr = localStorage.getItem("authData");
        if (!authDataStr) {
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await productService.getAllProducts();
            
            if (result.success && result.data) {
                setProducts(result.data);
            } else {
                const errorMsg = result.message || 'Không thể lấy danh sách sản phẩm';
                setError(errorMsg);
            }
        } catch (err) {
            const errorMsg = 'Lỗi khi tải dữ liệu sản phẩm';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        error,
        refetch: fetchProducts
    };
};