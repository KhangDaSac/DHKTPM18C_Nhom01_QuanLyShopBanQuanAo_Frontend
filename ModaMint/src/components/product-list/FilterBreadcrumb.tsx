import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { categoryService } from '@/services/category';
import { brandService } from '@/services/brand';
import { AiOutlineClose } from 'react-icons/ai';

interface FilterBreadcrumbProps {
    className?: string;
}

const FilterBreadcrumb: React.FC<FilterBreadcrumbProps> = ({ className = '' }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [categoryName, setCategoryName] = useState<string>('');
    const [brandName, setBrandName] = useState<string>('');

    const categoryId = searchParams.get('categoryId');
    const brandId = searchParams.get('brandId');
    const gender = searchParams.get('gender');

    useEffect(() => {
        // Fetch category name if categoryId exists
        if (categoryId) {
            categoryService.getCategoryById(parseInt(categoryId))
                .then(res => {
                    if (res.code === 1000 && res.result) {
                        setCategoryName(res.result.name);
                    }
                })
                .catch(err => console.error('Error fetching category:', err));
        } else {
            setCategoryName('');
        }
    }, [categoryId]);

    useEffect(() => {
        // Fetch brand name if brandId exists
        if (brandId) {
            brandService.getBrandById(parseInt(brandId))
                .then(res => {
                    if (res.code === 1000 && res.result) {
                        setBrandName(res.result.name);
                    }
                })
                .catch(err => console.error('Error fetching brand:', err));
        } else {
            setBrandName('');
        }
    }, [brandId]);

    const removeFilter = (filterType: 'category' | 'brand' | 'gender') => {
        const params = new URLSearchParams(searchParams);

        if (filterType === 'category') {
            params.delete('categoryId');
        } else if (filterType === 'brand') {
            params.delete('brandId');
        } else if (filterType === 'gender') {
            params.delete('gender');
        }

        navigate(`?${params.toString()}`);
    };

    const clearAllFilters = () => {
        navigate('/products');
    };

    const hasActiveFilters = categoryId || brandId || gender;

    if (!hasActiveFilters) {
        return null;
    }

    const genderText = gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : '';

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            marginBottom: '24px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg style={{ width: '16px', height: '16px', fill: '#f97316' }} viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        Bộ lọc đang áp dụng:
                    </span>

                    {categoryName && (
                        <button
                            onClick={() => removeFilter('category')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#fed7aa',
                                color: '#c2410c',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                border: '1px solid #fdba74',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdba74'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fed7aa'}
                        >
                            <span style={{ fontWeight: '600' }}>Danh mục:</span>
                            <span>{categoryName}</span>
                            <AiOutlineClose style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                        </button>
                    )}

                    {brandName && (
                        <button
                            onClick={() => removeFilter('brand')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#bfdbfe',
                                color: '#1e40af',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                border: '1px solid #93c5fd',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#93c5fd'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bfdbfe'}
                        >
                            <span style={{ fontWeight: '600' }}>Thương hiệu:</span>
                            <span>{brandName}</span>
                            <AiOutlineClose style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                        </button>
                    )}

                    {genderText && (
                        <button
                            onClick={() => removeFilter('gender')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                backgroundColor: '#e9d5ff',
                                color: '#7e22ce',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                border: '1px solid #d8b4fe',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d8b4fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e9d5ff'}
                        >
                            <span style={{ fontWeight: '600' }}>Giới tính:</span>
                            <span>{genderText}</span>
                            <AiOutlineClose style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                        </button>
                    )}
                </div>

                <button
                    onClick={clearAllFilters}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        border: '1px solid #fecaca',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Xóa tất cả
                </button>
            </div>
        </div>
    );
};

export default FilterBreadcrumb;
