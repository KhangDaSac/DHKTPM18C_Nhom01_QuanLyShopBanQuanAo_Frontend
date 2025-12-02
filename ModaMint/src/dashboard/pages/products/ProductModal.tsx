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
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SaveOutlined,
    CloseOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { productService, type ProductRequest } from '../../../services/product';
import { productVariantService, type ProductVariant, type ProductVariantRequest } from '../../../services/productVariant';
import type { BrandResponse } from '../../../services/brand';

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

    // Reset form when modal opens/closes - CHỈ LOAD 1 LẦN KHI MỞ MODAL
    useEffect(() => {
        if (visible) {
            setActiveTab('1');
            if (editingProduct) {
                // EDIT MODE - Load from prop
                form.setFieldsValue({
                    name: editingProduct.name,
                    description: editingProduct.description,
                    brandId: brands.find(b => b.name === editingProduct.brandName)?.id,
                    categoryId: categories.find(c => c.name === editingProduct.categoryName)?.id,
                    active: editingProduct.active
                });

                // Load variants
                if (editingProduct.productVariants) {
                    const variants: FormVariant[] = editingProduct.productVariants.map((v) => ({
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
                    setEditVariants(variants);
                } else {
                    setEditVariants([]);
                }
            } else {
                // CREATE MODE
                form.resetFields();
                setFormVariants([]);
            }
        }
    }, [visible, editingProduct]);

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
                    image: variant.image
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
                    image: variant.image,
                    active: variant.active !== undefined ? variant.active : true
                };

                const result = await productVariantService.updateProductVariant(variant.id!, variantData);
                if (result.success) {
                    message.success('Đã cập nhật biến thể');
                    setEditVariants(editVariants.map(v =>
                        v.key === key ? { ...v, isEditing: false } : v
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
        try {
            const values = await form.validateFields();

            if (!editingProduct) {
                // CREATE MODE - must have at least 1 variant
                if (formVariants.length === 0) {
                    message.error('Vui lòng thêm ít nhất 1 biến thể sản phẩm');
                    setActiveTab('2');
                    return;
                }

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

                setLoading(true);

                // Prepare product data
                const productData: ProductRequest = {
                    name: values.name.trim(),
                    description: values.description.trim(),
                    brandId: values.brandId,
                    categoryId: values.categoryId,
                    active: values.active !== undefined ? values.active : true
                };

                // Handle images
                if (values.images) {
                    const imagesArray = values.images.split('|').filter((url: string) => url.trim());
                    if (imagesArray.length > 0) {
                        productData.images = imagesArray;
                    }
                }

                // Prepare variants
                const variantsData = formVariants.map(v => ({
                    size: v.size,
                    color: v.color,
                    price: v.price,
                    quantity: v.quantity,
                    discount: v.discount || 0,
                    additionalPrice: v.additionalPrice || 0,
                    image: v.image || ''
                }));

                // Call CREATE API with variants
                const result = await productService.createProductWithVariants({
                    product: productData,
                    variants: variantsData
                });

                if (result.success) {
                    message.success('Đã thêm sản phẩm và biến thể thành công');
                    onSuccess();
                    onClose();
                } else {
                    message.error(result.message || 'Không thể thêm sản phẩm với biến thể');
                }
            } else {
                // EDIT MODE - update product info only via PUT /products/{id}
                setLoading(true);

                const productData: ProductRequest = {
                    name: values.name.trim(),
                    description: values.description.trim(),
                    brandId: values.brandId,
                    categoryId: values.categoryId,
                    active: values.active !== undefined ? values.active : true
                };

                if (values.images) {
                    const imagesArray = values.images.split('|').filter((url: string) => url.trim());
                    if (imagesArray.length > 0) {
                        productData.images = imagesArray;
                    }
                }

                const result = await productService.updateProduct(editingProduct.id, productData);

                if (result.success) {
                    message.success('Đã cập nhật thông tin sản phẩm thành công');
                    onSuccess();
                    onClose();
                } else {
                    message.error(result.message || 'Không thể cập nhật sản phẩm');
                }
            }
        } catch (error: any) {
            if (error.errorFields) {
                message.error('Vui lòng kiểm tra lại thông tin sản phẩm');
                setActiveTab('1');
            } else {
                message.error('Có lỗi xảy ra, vui lòng thử lại');
                console.error('Error saving product:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    // ============ COLUMNS FOR VARIANTS TABLE ============
    const variantsColumns = [
        {
            title: 'Kích thước',
            dataIndex: 'size',
            key: 'size',
            width: 100,
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
            width: 100,
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
            width: 120,
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
            width: 100,
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
            width: 100,
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
            width: 120,
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
            width: 150,
            render: (text: string, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <Input
                            value={record.image}
                            onChange={(e) => handleUpdateEditVariant(record.key, 'image', e.target.value)}
                            placeholder="URL ảnh"
                        />
                    );
                }
                return text ? <Image src={text} width={40} height={40} style={{ objectFit: 'cover' }} /> : '-';
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            width: 120,
            render: (active: boolean) => (
                <Tag color={active === true ? 'green' : 'red'}>
                    {active === true ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            fixed: 'right' as const,
            render: (_: any, record: FormVariant) => {
                if (record.isEditing) {
                    return (
                        <Space>
                            <Button
                                type="link"
                                icon={<SaveOutlined />}
                                onClick={() => editingProduct ? handleSaveRow(record.key) : {}}
                                loading={loading}
                            >
                                Lưu
                            </Button>
                            <Button
                                type="link"
                                icon={<CloseOutlined />}
                                onClick={() => editingProduct ? handleCancelEdit(record.key) : {}}
                            >
                                Hủy
                            </Button>
                        </Space>
                    );
                }

                // Show different actions based on active status
                if (record.active === false) {
                    return (
                        <Space>
                            <Button
                                type="link"
                                icon={<ReloadOutlined />}
                                onClick={() => handleRestoreRow(record.key)}
                                disabled={!!editingRowKey}
                                loading={loading}
                            >
                                Khôi phục
                            </Button>
                        </Space>
                    );
                }

                return (
                    <Space>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEditRow(record.key)}
                            disabled={!!editingRowKey && editingRowKey !== record.key}
                        >
                            Sửa
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc muốn vô hiệu hóa biến thể này?"
                            onConfirm={() => {
                                console.log('Popconfirm onConfirm triggered for key:', record.key);
                                handleDeleteRow(record.key);
                            }}
                            okText="Vô hiệu hóa"
                            cancelText="Hủy"
                            icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={!!editingRowKey}
                                onClick={() => console.log('Delete button clicked for:', record.key, record)}
                            >
                                Vô hiệu hóa
                            </Button>
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
            title: 'URL Ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 200,
            render: (_text: string, record: FormVariant) => (
                <Input
                    value={record.image}
                    onChange={(e) => handleUpdateFormVariant(record.key, 'image', e.target.value)}
                    placeholder="https://..."
                />
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 100,
            fixed: 'right' as const,
            render: (_: any, record: FormVariant) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFormVariant(record.key)}
                >
                    Xóa
                </Button>
            )
        }
    ];

    return (
        <Modal
            title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            open={visible}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSave}
                    disabled={!!editingRowKey}
                >
                    {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </Button>
            ]}
            destroyOnClose
        >
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
                            name="images"
                            label="Hình ảnh sản phẩm (URL, phân cách bằng |)"
                        >
                            <TextArea
                                rows={2}
                                placeholder="https://image1.jpg|https://image2.jpg|..."
                            />
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
                            scroll={{ x: 900 }}
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
                            scroll={{ x: 1000 }}
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
        </Modal>
    );
};

export default ProductModal;
