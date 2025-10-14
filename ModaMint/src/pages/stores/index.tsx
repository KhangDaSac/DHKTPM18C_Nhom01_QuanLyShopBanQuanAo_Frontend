import React, { useState } from 'react';
import './style.css';

interface Store {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    manager: string;
    status: 'active' | 'inactive';
    rating: number;
    openTime: string;
    closeTime: string;
    image: string;
}

const mockStores: Store[] = [
    {
        id: 1,
        name: "ModaMint Nguyễn Trãi",
        address: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
        phone: "024-1234-5678",
        email: "nguyentrai@modamint.com",
        manager: "Nguyễn Văn A",
        status: "active",
        rating: 4.5,
        openTime: "08:00",
        closeTime: "22:00",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop"
    },
    {
        id: 2,
        name: "ModaMint Trần Duy Hưng",
        address: "456 Trần Duy Hưng, Cầu Giấy, Hà Nội",
        phone: "024-2345-6789",
        email: "tranduyhung@modamint.com",
        manager: "Trần Thị B",
        status: "active",
        rating: 4.8,
        openTime: "08:30",
        closeTime: "21:30",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop"
    },
    {
        id: 3,
        name: "ModaMint Láng Hạ",
        address: "789 Láng Hạ, Đống Đa, Hà Nội",
        phone: "024-3456-7890",
        email: "langha@modamint.com",
        manager: "Lê Văn C",
        status: "inactive",
        rating: 4.2,
        openTime: "09:00",
        closeTime: "21:00",
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=300&h=200&fit=crop"
    },
    {
        id: 4,
        name: "ModaMint Times City",
        address: "Times City, Hai Bà Trưng, Hà Nội",
        phone: "024-4567-8901",
        email: "timescity@modamint.com",
        manager: "Phạm Thị D",
        status: "active",
        rating: 4.7,
        openTime: "10:00",
        closeTime: "22:00",
        image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=300&h=200&fit=crop"
    }
];

export default function StoresPage() {
    const [stores, setStores] = useState<Store[]>(mockStores);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Filter stores based on search term and status
    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.manager.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || store.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star filled">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star half">★</span>);
        }

        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star">★</span>);
        }

        return stars;
    };

    return (
        <div className="stores-page">
            <div className="stores-header">
                <h1>Hệ Thống Cửa Hàng ModaMint</h1>
                <p>Tìm kiếm cửa hàng gần bạn nhất</p>
            </div>

            {/* Search and Filter Section */}
            <div className="stores-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên cửa hàng, địa chỉ, quản lý..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button className="search-btn">
                        🔍
                    </button>
                </div>

                <div className="filter-section">
                    <label>Trạng thái:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                        className="status-filter"
                    >
                        <option value="all">Tất cả</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Tạm ngưng</option>
                    </select>
                </div>
            </div>

            {/* Stores List */}
            <div className="stores-list">
                {filteredStores.length === 0 ? (
                    <div className="no-stores">
                        <p>Không tìm thấy cửa hàng nào phù hợp</p>
                    </div>
                ) : (
                    filteredStores.map(store => (
                        <div key={store.id} className={`store-card ${store.status}`}>
                            <div className="store-image">
                                <img src={store.image} alt={store.name} />
                                <div className={`status-badge ${store.status}`}>
                                    {store.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                                </div>
                            </div>

                            <div className="store-info">
                                <div className="store-header-info">
                                    <h3 className="store-name">{store.name}</h3>
                                    <div className="store-rating">
                                        {renderStars(store.rating)}
                                        <span className="rating-number">({store.rating})</span>
                                    </div>
                                </div>

                                <div className="store-details">
                                    <div className="detail-item">
                                        <span className="icon">📍</span>
                                        <span>{store.address}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="icon">📞</span>
                                        <span>{store.phone}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="icon">✉️</span>
                                        <span>{store.email}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="icon">👤</span>
                                        <span>Quản lý: {store.manager}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="icon">🕒</span>
                                        <span>Giờ mở cửa: {store.openTime} - {store.closeTime}</span>
                                    </div>
                                </div>

                                <div className="store-actions">
                                    <button className="btn-primary">Xem chi tiết</button>
                                    <button className="btn-secondary">Chỉ đường</button>
                                    <button className="btn-secondary">Gọi điện</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Statistics */}
            <div className="stores-stats">
                <div className="stat-item">
                    <h4>Tổng số cửa hàng</h4>
                    <span className="stat-number">{stores.length}</span>
                </div>
                <div className="stat-item">
                    <h4>Đang hoạt động</h4>
                    <span className="stat-number">{stores.filter(s => s.status === 'active').length}</span>
                </div>
                <div className="stat-item">
                    <h4>Tạm ngưng</h4>
                    <span className="stat-number">{stores.filter(s => s.status === 'inactive').length}</span>
                </div>
                <div className="stat-item">
                    <h4>Đánh giá trung bình</h4>
                    <span className="stat-number">
                        {(stores.reduce((sum, store) => sum + store.rating, 0) / stores.length).toFixed(1)}
                    </span>
                </div>
            </div>
        </div>
    );
}