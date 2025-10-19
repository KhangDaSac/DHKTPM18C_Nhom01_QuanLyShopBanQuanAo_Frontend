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
            console.log('⚠️ No auth token found, skipping API call');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            console.log('🔄 Fetching products...');
            const result = await productService.getAllProducts();
            console.log('📦 API Response:', result);
            
            if (result.success && result.data) {
                setProducts(result.data);
                console.log('✅ Products loaded:', result.data.length);
            } else {
                const errorMsg = result.message || 'Không thể lấy danh sách sản phẩm';
                setError(errorMsg);
                console.error('❌ API Error:', errorMsg);
            }
        } catch (err) {
            const errorMsg = 'Lỗi khi tải dữ liệu sản phẩm';
            setError(errorMsg);
            console.error('💥 Fetch Error:', err);
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