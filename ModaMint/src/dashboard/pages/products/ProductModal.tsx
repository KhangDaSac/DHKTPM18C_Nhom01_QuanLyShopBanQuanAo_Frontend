import React, { useState, useEffect } from 'react';
import {
    Modal,
    Tabs,
    Form,
    Input,
    InputNumber,
    Select,
    Row,
    Col,
    Button,
    Table,
    Space,
    Tag,
    Image,
    Upload,
    message,
    Popconfirm,
    Alert
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { productService, type ProductRequest } from '../../../services/product';
import { productVariantService, type ProductVariant, type ProductVariantRequest } from '../../../services/productVariant';
import type { BrandResponse } from '../../../services/brand';
import apiClient from '../../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Category {
    id: number;
    name: string;
    isActive: boolean;
}

interface Product {
    id: number;
    name: string;
    minPrice: number;
    maxPrice: number;
    priceRange: string;
    active: boolean;
    description: string;
    brandName: string;
    categoryName: string;
    createAt?: string;
    updateAt?: string;
    productVariants?: ProductVariant[];
    image?: string;
    images?: string[];
    stock?: number;
}

interface FormVariant {
    key: string;
    id?: number;
    size: string;
    color: string;
    price: number;
    quantity: number;
    discount: number;
    additionalPrice: number;
    image: string;
    active?: boolean;
    isEditing?: boolean;
    isNew?: boolean;
    imageFile?: File | null; // Track uploaded file
    imageUploading?: boolean; // Track upload status
}

interface ProductModalProps {
    visible: boolean;
    editingProduct: Product | null;
    categories: Category[];
    brands: BrandResponse[];
    categoriesLoading: boolean;
    brandsLoading: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
    visible,
    editingProduct,
    categories,
    brands,
    categoriesLoading,
    brandsLoading,
    onClose,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('1');
    const [loading, setLoading] = useState(false);

    // Variants state for CREATE mode
    const [formVariants, setFormVariants] = useState<FormVariant[]>([]);

    // Variants state for EDIT mode
    const [editVariants, setEditVariants] = useState<FormVariant[]>([]);
    const [editingRowKey, setEditingRowKey] = useState<string | null>(null);

    // Upload state for product images
    const [productImageFileList, setProductImageFileList] = useState<UploadFile[]>([]);
    const [productImageUploading, setProductImageUploading] = useState(false);

    // Load variants with images from API
    const loadVariantsWithImages = async (productId: number) => {
        try {
            const result = await productVariantService.getProductVariantsByProductId(productId);

            if (result.success && result.data) {
                console.log('🔍 Variants from dedicated API:', result.data);
                const variants: FormVariant[] = result.data.map((v) => ({
                    key: `existing-${v.id}`,
                    id: v.id,
                    size: v.size || '',
                    color: v.color || '',
                    price: v.price,
                    quantity: v.quantity || 0,
                    discount: v.discount || 0,
                    additionalPrice: v.additionalPrice || 0,
                    image: v.image || '',
                    active: v.active !== undefined ? v.active : true,
                    isEditing: false,
                    isNew: false
                }));
                console.log('✅ Mapped variants with images:', variants);
                setEditVariants(variants);
            } else {
                setEditVariants([]);
            }
        } catch (error) {
            console.error('❌ Error loading variants:', error);
            setEditVariants([]);
        }
    };

    // Reset form when modal opens/closes - CHỈ LOAD 1 LẦN KHI MỞ MODAL
    useEffect(() => {
        if (visible) {
            setActiveTab('1');
            setProductImageFileList([]); // Reset product image uploads

            if (editingProduct) {
                // EDIT MODE - Load from prop
                form.setFieldsValue({
                    name: editingProduct.name,
                    description: editingProduct.description,
                    brandId: brands.find(b => b.name === editingProduct.brandName)?.id,
                    categoryId: categories.find(c => c.name === editingProduct.categoryName)?.id,
                    active: editingProduct.active
                });

                // Load existing product images if available
                if (editingProduct.images && editingProduct.images.length > 0) {
                    const existingImages: UploadFile[] = editingProduct.images.map((url, index) => ({
                        uid: `existing-${index}`,
                        name: `image-${index}`,
                        status: 'done',
                        url: url
                    }));
                    setProductImageFileList(existingImages);
                }

                // Load variants with images from dedicated API
                if (editingProduct.id) {
                    loadVariantsWithImages(editingProduct.id);
                } else {
                    setEditVariants([]);
                }
            } else {
                // CREATE MODE
                form.resetFields();
                setFormVariants([]);
            }
        } else {
            // Modal is closing - clean up
            setProductImageFileList([]);
        }
    }, [visible, editingProduct]);

    // ============ IMAGE UPLOAD HELPER ============
    /**
     * Upload a single image to Cloudinary via backend API
     * @param file - The image file to upload
     * @returns Promise with Cloudinary URL or null on failure
     */
    const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await apiClient.post('/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('[DEBUG] Upload response:', response.data);

            // Backend trả về ApiResponse với code, message, result
            if (response.data?.code === 1000 && response.data?.result?.imageUrl) {
                return response.data.result.imageUrl;
            } else {
                message.error('Lỗi khi tải ảnh lên: ' + (response.data?.message || 'Không có URL trả về'));
                return null;
            }
        } catch (error: any) {
            console.error('Upload image error:', error);
            message.error('Không thể tải ảnh lên: ' + (error.response?.data?.message || error.message));
            return null;
        }
    };

    // ============ CREATE MODE HANDLERS ============
    const handleAddFormVariant = () => {
        const newVariant: FormVariant = {
            key: `new-${Date.now()}`,
            size: '',
            color: '',
            price: 0,
            quantity: 0,
            discount: 0,
            additionalPrice: 0,
            image: '',
            active: true,
            isEditing: true,
            isNew: true
        };
        setFormVariants([...formVariants, newVariant]);
    };

    const handleRemoveFormVariant = (key: string) => {
        setFormVariants(formVariants.filter(v => v.key !== key));
    };

    const handleUpdateFormVariant = (key: string, field: keyof FormVariant, value: any) => {
        setFormVariants(formVariants.map(v =>
            v.key === key ? { ...v, [field]: value } : v
        ));
    };

    // ============ EDIT MODE HANDLERS ============
    const handleAddEditVariant = () => {
        const newVariant: FormVariant = {
            key: `new-${Date.now()}`,
            size: '',
            color: '',
            price: 0,
            quantity: 0,
            discount: 0,
            additionalPrice: 0,
            image: '',
            active: true,
            isEditing: true,
            isNew: true
        };
        setEditVariants([...editVariants, newVariant]);
        setEditingRowKey(newVariant.key);
    };

    const handleEditRow = (key: string) => {
        setEditingRowKey(key);
        // Preserve all existing data including image when entering edit mode
        setEditVariants(editVariants.map(v =>
            v.key === key ? { ...v, isEditing: true } : v
        ));
    };

    const handleSaveRow = async (key: string) => {
        const variant = editVariants.find(v => v.key === key);
        if (!variant) return;

        // Validation
        if (variant.price <= 0) {
            message.error('Giá phải lớn hơn 0');
            return;
        }
        if (variant.quantity < 0) {
            message.error('Số lượng không được âm');
            return;
        }

        setLoading(true);
        try {
            // Upload image first if there's a new file
            let finalImageUrl = variant.image || '';
            if (variant.imageFile && !finalImageUrl.startsWith('http')) {
                message.loading({ content: 'Đang tải ảnh lên...', key: 'variantImage' });
                const uploadedUrl = await uploadImageToCloudinary(variant.imageFile);
                if (uploadedUrl) {
                    finalImageUrl = uploadedUrl;
                    message.success({ content: 'Đã tải ảnh lên thành công', key: 'variantImage' });
                } else {
                    message.error({ content: 'Không thể tải ảnh lên', key: 'variantImage' });
                    setLoading(false);
                    return;
                }
            }

            if (variant.isNew) {
                // CREATE new variant via API
                const variantData: ProductVariantRequest = {
                    productId: editingProduct!.id,
                    size: variant.size,
                    color: variant.color,
                    price: variant.price,
                    quantity: variant.quantity,
                    discount: variant.discount,
                    additionalPrice: variant.additionalPrice,
                    imageUrl: finalImageUrl  // ✅ Đổi image → imageUrl
                };

                const result = await productVariantService.createProductVariant(variantData);
                if (result.success && result.data) {
                    message.success('Đã thêm biến thể mới');
                    // Update with real ID from server
                    const newData = result.data;
                    setEditVariants(editVariants.map(v =>
                        v.key === key ? { ...newData, key: `existing-${newData.id}`, isEditing: false, isNew: false } as FormVariant : v
                    ));
                    setEditingRowKey(null);
                } else {
                    message.error(result.message || 'Không thể thêm biến thể');
                }
            } else {
                // UPDATE existing variant via API
                const variantData: ProductVariantRequest = {
                    productId: editingProduct!.id,
                    size: variant.size,
                    color: variant.color,
                    price: variant.price,
                    quantity: variant.quantity,
                    discount: variant.discount,
                    additionalPrice: variant.additionalPrice,
                    imageUrl: finalImageUrl,  // ✅ Đổi image → imageUrl
                    active: variant.active !== undefined ? variant.active : true
                };

                const result = await productVariantService.updateProductVariant(variant.id!, variantData);
                if (result.success) {
                    message.success('Đã cập nhật biến thể');
                    setEditVariants(editVariants.map(v =>
                        v.key === key ? { ...v, image: finalImageUrl, isEditing: false } : v
                    ));
                    setEditingRowKey(null);
                } else {
                    message.error(result.message || 'Không thể cập nhật biến thể');
                }
            }
        } catch (error) {
            message.error('Lỗi khi lưu biến thể');
            console.error('Error saving variant:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = (key: string) => {
        const variant = editVariants.find(v => v.key === key);
        if (variant?.isNew) {
            // Remove new variant if cancel
            setEditVariants(editVariants.filter(v => v.key !== key));
        } else {
            // Revert changes
            setEditVariants(editVariants.map(v =>
                v.key === key ? { ...v, isEditing: false } : v
            ));
        }
        setEditingRowKey(null);
    };

    const handleDeleteRow = async (key: string) => {
        const variant = editVariants.find(v => v.key === key);
        if (!variant) {
            console.error('Variant not found:', key);
            return;
        }

        console.log('Deleting variant:', variant);

        if (variant.isNew) {
            // Just remove from state
            setEditVariants(editVariants.filter(v => v.key !== key));
            return;
        }

        if (!variant.id) {
            message.error('Không tìm thấy ID biến thể');
            console.error('Variant has no ID:', variant);
            return;
        }

        setLoading(true);
        try {
            console.log('Calling API deleteProductVariant with ID:', variant.id);
            // Soft delete - set active = false
            const result = await productVariantService.deleteProductVariant(variant.id);
            console.log('API response:', result);
            if (result.success) {
                message.success('Đã vô hiệu hóa biến thể');
                // Update local state immediately for UI feedback
                const updatedVariants = editVariants.map(v =>
                    v.key === key ? { ...v, active: false } : v
                );
                console.log('Updated variants:', updatedVariants);
                setEditVariants(updatedVariants);
            } else {
                message.error(result.message || 'Không thể vô hiệu hóa biến thể');
            }
        } catch (error) {
            message.error('Lỗi khi vô hiệu hóa biến thể');
            console.error('Error soft deleting variant:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreRow = async (key: string) => {
        const variant = editVariants.find(v => v.key === key);
        if (!variant || !variant.id) {
            console.error('Variant not found or has no ID:', variant);
            return;
        }

        console.log('Restoring variant:', variant);

        setLoading(true);
        try {
            console.log('Calling API restoreProductVariant with ID:', variant.id);
            const result = await productVariantService.restoreProductVariant(variant.id);
            console.log('API response:', result);
            if (result.success) {
                message.success('Đã khôi phục biến thể');
                // Update local state immediately for UI feedback
                setEditVariants(editVariants.map(v =>
                    v.key === key ? { ...v, active: true } : v
                ));
            } else {
                message.error(result.message || 'Không thể khôi phục biến thể');
            }
        } catch (error) {
            message.error('Lỗi khi khôi phục biến thể');
            console.error('Error restoring variant:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEditVariant = (key: string, field: keyof FormVariant, value: any) => {
        setEditVariants(editVariants.map(v =>
            v.key === key ? { ...v, [field]: value } : v
        ));
    };

    // ============ SAVE HANDLERS ============
    const handleSave = async () => {
        console.log('[DEBUG] handleSave called');

        // Prevent double execution
        if (loading) {
            console.log('[DEBUG] Already loading, ignoring duplicate call');
            return;
        }

        try {
            console.log('[DEBUG] Starting form validation');
            const values = await form.validateFields();
            console.log('[DEBUG] Form validation passed:', values);

            if (!editingProduct) {
                console.log('[DEBUG] CREATE MODE - checking variants');
                // CREATE MODE - must have at least 1 variant
                if (formVariants.length === 0) {
                    message.error('Vui lòng thêm ít nhất 1 biến thể sản phẩm');
                    setActiveTab('2');
                    return;
                }
                console.log('[DEBUG] Variant count:', formVariants.length);

                // Validate variants
                for (const v of formVariants) {
                    if (v.price <= 0) {
                        message.error('Tất cả biến thể phải có giá lớn hơn 0');
                        setActiveTab('2');
                        return;
                    }
                    if (v.quantity < 0) {
                        message.error('Số lượng không được âm');
                        setActiveTab('2');
                        return;
                    }
                }
                console.log('[DEBUG] Variant validation passed');

                setLoading(true);
                console.log('[DEBUG] Loading state set to true');

                try {
                    console.log('[DEBUG] Entered try block for CREATE mode');
                    console.log('[DEBUG] productImageFileList:', productImageFileList);
                    console.log('[DEBUG] formVariants:', formVariants);

                    // STEP 1: Upload all product images first
                    let uploadedProductImageUrls: string[] = [];
                    if (productImageFileList.length > 0) {
                        console.log('[DEBUG] Uploading product images, count:', productImageFileList.length);
                        message.loading({ content: 'Đang tải ảnh sản phẩm lên...', key: 'productImages' });

                        const uploadPromises = productImageFileList.map((fileItem, index) => {
                            console.log(`[DEBUG] Processing product image ${index}:`, fileItem);
                            if (fileItem.originFileObj) {
                                console.log(`[DEBUG] Uploading product image ${index}:`, fileItem.originFileObj.name);
                                return uploadImageToCloudinary(fileItem.originFileObj)
                                    .then(url => {
                                        console.log(`[DEBUG] Product image ${index} uploaded:`, url);
                                        return url;
                                    })
                                    .catch(err => {
                                        console.error(`[DEBUG] Product image ${index} upload failed:`, err);
                                        return null;
                                    });
                            }
                            console.log(`[DEBUG] Product image ${index} has no originFileObj`);
                            return Promise.resolve(null);
                        });

                        console.log('[DEBUG] Waiting for all product image uploads...');
                        const uploadResults = await Promise.all(uploadPromises);
                        console.log('[DEBUG] Upload results:', uploadResults);
                        uploadedProductImageUrls = uploadResults.filter((url): url is string => url !== null);
                        console.log('[DEBUG] Filtered uploaded URLs:', uploadedProductImageUrls);

                        if (uploadedProductImageUrls.length < productImageFileList.length) {
                            message.error({ content: 'Một số ảnh sản phẩm không tải lên được', key: 'productImages' });
                            setLoading(false);
                            return;
                        }

                        message.success({ content: `Đã tải lên ${uploadedProductImageUrls.length} ảnh sản phẩm`, key: 'productImages' });
                        console.log('[DEBUG] Product images uploaded successfully:', uploadedProductImageUrls);
                    } else {
                        console.log('[DEBUG] No product images to upload');
                    }

                    // STEP 2: Upload variant images
                    console.log('[DEBUG] Starting variant image upload. Total variants:', formVariants.length);
                    console.log('[DEBUG] Form variants data:', formVariants);
                    message.loading({ content: 'Đang tải ảnh biến thể lên...', key: 'variantImages' });
                    const variantsWithUploadedImages = await Promise.all(
                        formVariants.map(async (variant, index) => {
                            console.log(`[DEBUG] Processing variant ${index}:`, variant);
                            let finalImageUrl = variant.image || '';

                            // If there's a file to upload (not already a Cloudinary URL)
                            if (variant.imageFile && !finalImageUrl.startsWith('http')) {
                                console.log(`[DEBUG] Uploading image for variant ${index}...`);
                                const uploadedUrl = await uploadImageToCloudinary(variant.imageFile);
                                if (uploadedUrl) {
                                    finalImageUrl = uploadedUrl;
                                    console.log(`[DEBUG] Variant ${index} image uploaded:`, uploadedUrl);
                                } else {
                                    console.error(`[DEBUG] Failed to upload image for variant ${index}`);
                                    message.error(`Không thể tải ảnh cho biến thể ${variant.size} - ${variant.color}`);
                                }
                            } else {
                                console.log(`[DEBUG] Variant ${index} has no image file to upload`);
                            }

                            const mappedVariant = {
                                size: variant.size,
                                color: variant.color,
                                price: variant.price,
                                quantity: variant.quantity,
                                discount: variant.discount || 0,
                                additionalPrice: variant.additionalPrice || 0,
                                imageUrl: finalImageUrl || ''  // ✅ Đổi image → imageUrl
                            };
                            console.log(`[DEBUG] Mapped variant ${index}:`, mappedVariant);
                            return mappedVariant;
                        })
                    );
                    console.log('[DEBUG] All variants processed:', variantsWithUploadedImages);
                    message.success({ content: 'Đã tải ảnh biến thể thành công', key: 'variantImages' });

                    // STEP 3: Prepare product data with uploaded image URLs
                    const productData: ProductRequest = {
                        name: values.name.trim(),
                        description: values.description.trim(),
                        brandId: values.brandId,
                        categoryId: values.categoryId,
                        active: values.active !== undefined ? values.active : true
                    };

                    if (uploadedProductImageUrls.length > 0) {
                        productData.imageUrls = uploadedProductImageUrls;  // ✅ Đổi images → imageUrls
                    }

                    console.log('[DEBUG] Product data prepared:', productData);
                    console.log('[DEBUG] Variants with images:', variantsWithUploadedImages);

                    // STEP 4: Call CREATE API with variants
                    console.log('[DEBUG] Calling createProductWithVariants API...');
                    const result = await productService.createProductWithVariants({
                        product: productData,
                        variants: variantsWithUploadedImages
                    });

                    console.log('[DEBUG] API Response:', result);

                    if (result.success) {
                        message.success('Đã thêm sản phẩm và biến thể thành công');
                        onSuccess();
                        onClose();
                    } else {
                        message.error(result.message || 'Không thể thêm sản phẩm với biến thể');
                    }
                } catch (uploadError) {
                    console.error('[ERROR] Error during upload or save:', uploadError);
                    console.error('[ERROR] Error stack:', (uploadError as Error).stack);
                    message.error('Có lỗi xảy ra khi xử lý ảnh hoặc lưu sản phẩm');
                } finally {
                    setLoading(false);
                }
            } else {
                // EDIT MODE - update product info only via PUT /products/{id}
                setLoading(true);

                try {
                    // STEP 1: Upload product images if any new files
                    let uploadedProductImageUrls: string[] = [];
                    if (productImageFileList.length > 0) {
                        message.loading({ content: 'Đang tải ảnh sản phẩm lên...', key: 'productImages' });

                        const uploadPromises = productImageFileList.map(fileItem => {
                            if (fileItem.originFileObj) {
                                return uploadImageToCloudinary(fileItem.originFileObj);
                            }
                            // If it's already an uploaded URL, keep it
                            return Promise.resolve(fileItem.url || null);
                        });

                        const uploadResults = await Promise.all(uploadPromises);
                        uploadedProductImageUrls = uploadResults.filter((url): url is string => url !== null);

                        message.success({ content: `Đã xử lý ${uploadedProductImageUrls.length} ảnh sản phẩm`, key: 'productImages' });
                    }

                    const productData: ProductRequest = {
                        name: values.name.trim(),
                        description: values.description.trim(),
                        brandId: values.brandId,
                        categoryId: values.categoryId,
                        active: values.active !== undefined ? values.active : true
                    };

                    if (uploadedProductImageUrls.length > 0) {
                        productData.imageUrls = uploadedProductImageUrls;  // ✅ Đổi images → imageUrls
                    }

                    const result = await productService.updateProduct(editingProduct.id, productData);

                    if (result.success) {
                        message.success('Đã cập nhật thông tin sản phẩm thành công');
                        onSuccess();
                        onClose();
                    } else {
                        message.error(result.message || 'Không thể cập nhật sản phẩm');
                    }
                } catch (uploadError) {
                    console.error('Error during upload or update:', uploadError);
                    message.error('Có lỗi xảy ra khi xử lý ảnh hoặc cập nhật sản phẩm');
                } finally {
                    setLoading(false);
                }
            }
        } catch (error: any) {
            console.error('[ERROR] Error in handleSave outer catch:', error);
            console.error('[ERROR] Error details:', {
                message: error.message,
                stack: error.stack,
                errorFields: error.errorFields
            });
            if (error.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin sản phẩm');
                setActiveTab('1');
            } else {
                message.error('Có lỗi xảy ra, vui lòng thử lại');
                console.error('Error saving product:', error);
            }
            setLoading(false);
        }
    };

    // ============ COLUMNS FOR VARIANTS TABLE ============
    const variantsColumns = [
        {
            title: 'Kích thước',
            dataIndex: 'size',
            key: 'size',
            width: 90,
            render: (text: string, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <Input
                            value={record.size}
                            onChange={(e) => handleUpdateEditVariant(record.key, 'size', e.target.value)}
                            placeholder="S, M, L..."
                        />
                    );
                }
                return text || '-';
            }
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            key: 'color',
            width: 90,
            render: (text: string, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <Input
                            value={record.color}
                            onChange={(e) => handleUpdateEditVariant(record.key, 'color', e.target.value)}
                            placeholder="Đỏ, Xanh..."
                        />
                    );
                }
                return text || '-';
            }
        },
        {
            title: 'Giá (₫)',
            dataIndex: 'price',
            key: 'price',
            width: 110,
            render: (text: number, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <InputNumber
                            value={record.price}
                            onChange={(value) => handleUpdateEditVariant(record.key, 'price', value || 0)}
                            min={0}
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    );
                }
                return text.toLocaleString('vi-VN') + ' ₫';
            }
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 90,
            render: (text: number, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <InputNumber
                            value={record.quantity}
                            onChange={(value) => handleUpdateEditVariant(record.key, 'quantity', value || 0)}
                            min={0}
                            style={{ width: '100%' }}
                        />
                    );
                }
                return text;
            }
        },
        {
            title: 'Giảm giá (%)',
            dataIndex: 'discount',
            key: 'discount',
            width: 90,
            render: (text: number, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <InputNumber
                            value={record.discount}
                            onChange={(value) => handleUpdateEditVariant(record.key, 'discount', value || 0)}
                            min={0}
                            max={100}
                            style={{ width: '100%' }}
                        />
                    );
                }
                return text + '%';
            }
        },
        {
            title: 'Phụ phí (₫)',
            dataIndex: 'additionalPrice',
            key: 'additionalPrice',
            width: 110,
            render: (text: number, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <InputNumber
                            value={record.additionalPrice}
                            onChange={(value) => handleUpdateEditVariant(record.key, 'additionalPrice', value || 0)}
                            min={0}
                            style={{ width: '100%' }}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    );
                }
                return text.toLocaleString('vi-VN') + ' ₫';
            }
        },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            align: 'center' as const,
            render: (text: string, record: FormVariant) => {
                // Debug log
                console.log('Rendering image column:', { text, image: record.image, isEditing: record.isEditing });

                if (record.isEditing) {
                    // Create fileList based on current image
                    const fileList: UploadFile[] = record.image ? [{
                        uid: record.key + '-img',
                        name: 'image.png',
                        status: 'done',
                        url: record.image,
                        thumbUrl: record.image
                    }] : [];

                    return (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Upload
                                key={record.key + '-upload-' + (record.isEditing ? 'edit' : 'view')}
                                listType="picture-card"
                                fileList={fileList}
                                beforeUpload={(file) => {
                                    const isImage = file.type.startsWith('image/');
                                    if (!isImage) {
                                        message.error('Chỉ có thể tải lên file ảnh!');
                                        return Upload.LIST_IGNORE;
                                    }
                                    const isLt10M = file.size / 1024 / 1024 < 10;
                                    if (!isLt10M) {
                                        message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
                                        return Upload.LIST_IGNORE;
                                    }

                                    // Store file temporarily and create preview URL
                                    const previewUrl = URL.createObjectURL(file);

                                    // Update the correct state based on mode (CREATE or EDIT)
                                    if (editingProduct) {
                                        // EDIT mode - update editVariants
                                        setEditVariants(prev => prev.map(v =>
                                            v.key === record.key
                                                ? { ...v, image: previewUrl, imageFile: file }
                                                : v
                                        ));
                                    } else {
                                        // CREATE mode - update formVariants
                                        setFormVariants(prev => prev.map(v =>
                                            v.key === record.key
                                                ? { ...v, image: previewUrl, imageFile: file }
                                                : v
                                        ));
                                    }

                                    return false;
                                }}
                                onChange={(info) => {
                                    // Force update when file list changes
                                    if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
                                        const file = info.fileList[0].originFileObj;
                                        const previewUrl = URL.createObjectURL(file);

                                        if (editingProduct) {
                                            setEditVariants(prev => prev.map(v =>
                                                v.key === record.key
                                                    ? { ...v, image: previewUrl, imageFile: file }
                                                    : v
                                            ));
                                        } else {
                                            setFormVariants(prev => prev.map(v =>
                                                v.key === record.key
                                                    ? { ...v, image: previewUrl, imageFile: file }
                                                    : v
                                            ));
                                        }
                                    }
                                }}
                                onRemove={() => {
                                    if (editingProduct) {
                                        setEditVariants(prev => prev.map(v =>
                                            v.key === record.key
                                                ? { ...v, image: '', imageFile: null }
                                                : v
                                        ));
                                    } else {
                                        setFormVariants(prev => prev.map(v =>
                                            v.key === record.key
                                                ? { ...v, image: '', imageFile: null }
                                                : v
                                        ));
                                    }
                                }}
                                maxCount={1}
                                showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                            >
                                {fileList.length === 0 && (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8, fontSize: '12px' }}>Ảnh</div>
                                    </div>
                                )}
                            </Upload>
                        </div>
                    );
                }
                return text ? <Image src={text} width={40} height={40} style={{ objectFit: 'cover' }} /> : '-';
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            width: 100,
            align: 'center' as const,
            render: (active: boolean) => (
                <Tag color={active === true ? 'green' : 'red'}>
                    {active === true ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            align: 'center' as const,
            render: (_: any, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<SaveOutlined />}
                                onClick={() => editingProduct ? handleSaveRow(record.key) : {}}
                                loading={loading}
                                size="small"
                                title="Lưu"
                                style={{ color: '#52c41a' }}
                            />
                            <Button
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={() => editingProduct ? handleCancelEdit(record.key) : {}}
                                size="small"
                                title="Hủy"
                            />
                        </Space>
                    );
                }

                // Show different actions based on active status
                if (record.active === false) {
                    return (
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={() => handleRestoreRow(record.key)}
                            disabled={!!editingRowKey}
                            loading={loading}
                            size="small"
                            title="Khôi phục"
                        />
                    );
                }

                return (
                    <Space size="small">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditRow(record.key)}
                            disabled={!!editingRowKey && editingRowKey !== record.key}
                            size="small"
                            title="Sửa"
                        />
                        <Popconfirm
                            title="Vô hiệu hóa biến thể?"
                            onConfirm={() => {
                                console.log('Popconfirm onConfirm triggered for key:', record.key);
                                handleDeleteRow(record.key);
                            }}
                            okText="Vô hiệu hóa"
                            cancelText="Hủy"
                            icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={!!editingRowKey}
                                onClick={() => console.log('Delete button clicked for:', record.key, record)}
                                size="small"
                                title="Vô hiệu hóa"
                            />
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    // Columns for CREATE mode (simplified, inline editing)
    const createVariantsColumns = [
        {
            title: 'Kích thước',
            dataIndex: 'size',
            key: 'size',
            width: 100,
            render: (_text: string, record: FormVariant) => (
                <Input
                    value={record.size}
                    onChange={(e) => handleUpdateFormVariant(record.key, 'size', e.target.value)}
                    placeholder="S, M, L..."
                />
            )
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            key: 'color',
            width: 100,
            render: (_text: string, record: FormVariant) => (
                <Input
                    value={record.color}
                    onChange={(e) => handleUpdateFormVariant(record.key, 'color', e.target.value)}
                    placeholder="Đỏ, Xanh..."
                />
            )
        },
        {
            title: 'Giá (₫)',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (_text: number, record: FormVariant) => (
                <InputNumber
                    value={record.price}
                    onChange={(value) => handleUpdateFormVariant(record.key, 'price', value || 0)}
                    min={0}
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
            )
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            render: (_text: number, record: FormVariant) => (
                <InputNumber
                    value={record.quantity}
                    onChange={(value) => handleUpdateFormVariant(record.key, 'quantity', value || 0)}
                    min={0}
                    style={{ width: '100%' }}
                />
            )
        },
        {
            title: 'Giảm giá (%)',
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            render: (_text: number, record: FormVariant) => (
                <InputNumber
                    value={record.discount}
                    onChange={(value) => handleUpdateFormVariant(record.key, 'discount', value || 0)}
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                />
            )
        },
        {
            title: 'Phụ phí (₫)',
            dataIndex: 'additionalPrice',
            key: 'additionalPrice',
            width: 120,
            render: (_text: number, record: FormVariant) => (
                <InputNumber
                    value={record.additionalPrice}
                    onChange={(value) => handleUpdateFormVariant(record.key, 'additionalPrice', value || 0)}
                    min={0}
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
            )
        },
        {
            title: 'Ảnh biến thể',
            dataIndex: 'image',
            key: 'image',
            width: 150,
            render: (_text: string, record: FormVariant) => {
                // Create fileList based on current image with thumbUrl
                const fileList: UploadFile[] = record.image ? [{
                    uid: record.key + '-img',
                    name: 'image.png',
                    status: 'done',
                    url: record.image,
                    thumbUrl: record.image
                }] : [];

                return (
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        beforeUpload={(file) => {
                            const isImage = file.type.startsWith('image/');
                            if (!isImage) {
                                message.error('Chỉ có thể tải lên file ảnh!');
                                return Upload.LIST_IGNORE;
                            }
                            const isLt10M = file.size / 1024 / 1024 < 10;
                            if (!isLt10M) {
                                message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
                                return Upload.LIST_IGNORE;
                            }

                            // Store file temporarily and create preview URL
                            const previewUrl = URL.createObjectURL(file);

                            // Update state directly for immediate re-render
                            setFormVariants(prev => prev.map(v =>
                                v.key === record.key
                                    ? { ...v, image: previewUrl, imageFile: file }
                                    : v
                            ));

                            return false;
                        }}
                        onChange={(info) => {
                            // Force update when file list changes
                            if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
                                const file = info.fileList[0].originFileObj;
                                const previewUrl = URL.createObjectURL(file);
                                setFormVariants(prev => prev.map(v =>
                                    v.key === record.key
                                        ? { ...v, image: previewUrl, imageFile: file }
                                        : v
                                ));
                            }
                        }}
                        onRemove={() => {
                            setFormVariants(prev => prev.map(v =>
                                v.key === record.key
                                    ? { ...v, image: '', imageFile: null }
                                    : v
                            ));
                        }}
                        maxCount={1}
                        showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
                    >
                        {fileList.length === 0 && (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8, fontSize: '12px' }}>Ảnh</div>
                            </div>
                        )}
                    </Upload>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 80,
            align: 'center' as const,
            render: (_: any, record: FormVariant) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFormVariant(record.key)}
                    size="small"
                    title="Xóa"
                />
            )
        }
    ];

    return (
        <Modal
            title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            open={visible}
            onCancel={onClose}
            width={1400}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSave}
                    disabled={!!editingRowKey || loading}
                >
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </Button>
            ]}
            destroyOnClose
        >
            <LoadingSpinner spinning={loading} tip="Đang xử lý...">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Thông tin sản phẩm" key="1">
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{ active: true }}
                        >
                            <Form.Item
                                name="name"
                                label="Tên sản phẩm"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                                    { min: 1, message: 'Tên sản phẩm không được để trống' }
                                ]}
                            >
                                <Input placeholder="Nhập tên sản phẩm" />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label="Mô tả sản phẩm"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mô tả sản phẩm' },
                                    { min: 1, message: 'Mô tả sản phẩm không được để trống' }
                                ]}
                            >
                                <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="brandId"
                                        label="Thương hiệu"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn thương hiệu' },
                                            { type: 'number', message: 'Vui lòng chọn thương hiệu hợp lệ' }
                                        ]}
                                    >
                                        <Select
                                            placeholder="Chọn thương hiệu"
                                            loading={brandsLoading}
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {brands.map(brand => (
                                                <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="categoryId"
                                        label="Danh mục"
                                        rules={[
                                            { required: true, message: 'Vui lòng chọn danh mục' },
                                            { type: 'number', message: 'Vui lòng chọn danh mục hợp lệ' }
                                        ]}
                                    >
                                        <Select
                                            placeholder="Chọn danh mục"
                                            loading={categoriesLoading}
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {categories.map(cat => (
                                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="active"
                                label="Trạng thái"
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value={true}>Đang bán</Option>
                                    <Option value={false}>Ngừng bán</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Hình ảnh sản phẩm"
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={productImageFileList}
                                    beforeUpload={(file) => {
                                        // Validate file type
                                        const isImage = file.type.startsWith('image/');
                                        if (!isImage) {
                                            message.error('Chỉ có thể tải lên file ảnh!');
                                            return Upload.LIST_IGNORE;
                                        }

                                        // Validate file size (10MB)
                                        const isLt10M = file.size / 1024 / 1024 < 10;
                                        if (!isLt10M) {
                                            message.error('Kích thước ảnh phải nhỏ hơn 10MB!');
                                            return Upload.LIST_IGNORE;
                                        }

                                        // Add to file list with temporary preview
                                        const newFile: UploadFile = {
                                            uid: `product-${Date.now()}-${Math.random()}`,
                                            name: file.name,
                                            status: 'done',
                                            originFileObj: file,
                                            url: URL.createObjectURL(file)
                                        };
                                        setProductImageFileList([...productImageFileList, newFile]);

                                        return false; // Prevent auto upload, we'll handle it manually
                                    }}
                                    onRemove={(file) => {
                                        setProductImageFileList(productImageFileList.filter(f => f.uid !== file.uid));
                                    }}
                                    multiple
                                >
                                    {productImageFileList.length >= 8 ? null : (
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                        </div>
                                    )}
                                </Upload>
                                <div style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>
                                    Tải lên tối đa 8 ảnh. Định dạng: JPG, PNG, GIF, WebP. Kích thước tối đa: 10MB/ảnh
                                </div>
                            </Form.Item>
                        </Form>
                    </TabPane>

                    <TabPane tab={`Biến thể sản phẩm ${editingProduct ? '' : '(Bắt buộc ≥1)'}`} key="2">
                        <div style={{ marginBottom: 16 }}>
                            <Button
                                type="dashed"
                                onClick={editingProduct ? handleAddEditVariant : handleAddFormVariant}
                                icon={<PlusOutlined />}
                                block
                                disabled={!!editingRowKey}
                            >
                                Thêm biến thể mới
                            </Button>
                        </div>

                        {!editingProduct && (
                            <Table
                                columns={createVariantsColumns}
                                dataSource={formVariants}
                                rowKey="key"
                                pagination={false}
                                locale={{
                                    emptyText: 'Chưa có biến thể nào. Nhấn "Thêm biến thể mới" để thêm.'
                                }}
                            />
                        )}

                        {editingProduct && (
                            <Table
                                columns={variantsColumns}
                                dataSource={editVariants}
                                rowKey="key"
                                pagination={false}
                                loading={loading}
                                locale={{
                                    emptyText: 'Chưa có biến thể nào. Nhấn "Thêm biến thể mới" để thêm.'
                                }}
                            />
                        )}

                        {!editingProduct && formVariants.length === 0 && (
                            <Alert
                                message="Bắt buộc"
                                description="Sản phẩm phải có ít nhất 1 biến thể. Vui lòng thêm biến thể trước khi lưu."
                                type="warning"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        )}
                    </TabPane>
                </Tabs>
            </LoadingSpinner>
        </Modal>
    );
};

export default ProductModal;
