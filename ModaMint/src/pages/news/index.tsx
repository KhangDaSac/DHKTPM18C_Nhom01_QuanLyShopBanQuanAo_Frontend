import { useState } from 'react';
import './style.css';

interface NewsArticle {
    id: number;
    title: string;
    summary: string;
    content: string;
    author: string;
    publishDate: string;
    category: string;
    tags: string[];
    image: string;
    readTime: number;
    views: number;
}

const mockNews: NewsArticle[] = [
    {
        id: 1,
        title: "Xu hướng thời trang Thu Đông 2025: Phong cách tối giản hiện đại",
        summary: "Khám phá những xu hướng thời trang nổi bật nhất của mùa Thu Đông 2025 với phong cách tối giản nhưng không kém phần sang trọng.",
        content: "Mùa Thu Đông 2025 đánh dấu sự trở lại mạnh mẽ của phong cách tối giản với những thiết kế tinh tế, màu sắc trung tính và chất liệu cao cấp...",
        author: "Nguyễn Thị Lan",
        publishDate: "2025-10-01",
        category: "Xu hướng",
        tags: ["thời trang", "xu hướng", "thu đông"],
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=250&fit=crop",
        readTime: 5,
        views: 1250
    },
    {
        id: 2,
        title: "Cách phối đồ công sở thanh lịch cho phái nữ hiện đại",
        summary: "Hướng dẫn chi tiết cách tạo ra những set đồ công sở vừa chuyên nghiệp vừa thể hiện phong cách cá nhân.",
        content: "Thời trang công sở không còn đơn thuần là vest và áo sơ mi. Ngày nay, phái nữ có thể tự tin thể hiện cá tính qua cách phối đồ...",
        author: "Trần Minh Hạnh",
        publishDate: "2025-09-28",
        category: "Phối đồ",
        tags: ["công sở", "phối đồ", "nữ"],
        image: "https://images.unsplash.com/photo-1515470874091-c85a0ebe5b36?w=400&h=250&fit=crop",
        readTime: 7,
        views: 890
    },
    {
        id: 3,
        title: "ModaMint ra mắt bộ sưu tập 'Urban Minimalist' độc quyền",
        summary: "Bộ sưu tập mới nhất của ModaMint lấy cảm hứng từ cuộc sống đô thị hiện đại với những thiết kế tinh giản nhưng đầy cá tính.",
        content: "Sau thành công của các bộ sưu tập trước, ModaMint tiếp tục cho ra mắt 'Urban Minimalist' - một bộ sưu tập hoàn toàn mới...",
        author: "Lê Văn Minh",
        publishDate: "2025-09-25",
        category: "Sản phẩm",
        tags: ["modamint", "bộ sưu tập", "urban"],
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=250&fit=crop",
        readTime: 4,
        views: 2100
    },
    {
        id: 4,
        title: "5 tips chọn giày phù hợp với trang phục mùa đông",
        summary: "Những lời khuyên hữu ích để bạn chọn được đôi giày hoàn hảo cho outfit mùa đông của mình.",
        content: "Giày dép đóng vai trò quan trọng trong việc hoàn thiện tổng thể trang phục. Đặc biệt trong mùa đông...",
        author: "Phạm Thị Mai",
        publishDate: "2025-09-22",
        category: "Hướng dẫn",
        tags: ["giày", "mùa đông", "tips"],
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=250&fit=crop",
        readTime: 6,
        views: 1450
    },
    {
        id: 5,
        title: "Màu sắc thống trị thế giới thời trang 2025",
        summary: "Tìm hiểu về những gam màu được dự đoán sẽ làm mưa làm gió trong ngành thời trang năm 2025.",
        content: "Pantone đã công bố những màu sắc hot trend cho năm 2025. Hãy cùng khám phá và ứng dụng vào tủ đồ của bạn...",
        author: "Hoàng Anh Tuấn",
        publishDate: "2025-09-20",
        category: "Xu hướng",
        tags: ["màu sắc", "2025", "pantone"],
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
        readTime: 8,
        views: 980
    },
    {
        id: 6,
        title: "Sustainable Fashion: Tương lai của ngành thời trang",
        summary: "Thời trang bền vững không chỉ là xu hướng mà đã trở thành trách nhiệm của mỗi thương hiệu và người tiêu dùng.",
        content: "Trong bối cảnh biến đổi khí hậu ngày càng nghiêm trọng, ngành thời trang đang chuyển hướng mạnh mẽ...",
        author: "Đỗ Thị Hương",
        publishDate: "2025-09-18",
        category: "Bền vững",
        tags: ["sustainable", "môi trường", "tương lai"],
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
        readTime: 10,
        views: 750
    }
];

const categories = ["Tất cả", "Xu hướng", "Phối đồ", "Sản phẩm", "Hướng dẫn", "Bền vững"];

export default function NewsPage() {
    const [articles] = useState<NewsArticle[]>(mockNews);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 6;

    // Filter articles based on search and category
    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'Tất cả' || article.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="news-page">
            <div className="news-header">
                <h1>Tin Tức Thời Trang</h1>
                <p>Cập nhật những xu hướng và thông tin mới nhất từ thế giới thời trang</p>
            </div>

            {/* Featured Article */}
            {filteredArticles.length > 0 && (
                <div className="featured-article">
                    <div className="featured-content">
                        <div className="featured-image">
                            <img src={filteredArticles[0].image} alt={filteredArticles[0].title} />
                            <div className="featured-badge">Nổi bật</div>
                        </div>
                        <div className="featured-info">
                            <div className="article-meta">
                                <span className="category">{filteredArticles[0].category}</span>
                                <span className="date">{formatDate(filteredArticles[0].publishDate)}</span>
                                <span className="read-time">{filteredArticles[0].readTime} phút đọc</span>
                            </div>
                            <h2>{filteredArticles[0].title}</h2>
                            <p>{filteredArticles[0].summary}</p>
                            <div className="article-footer">
                                <div className="author-info">
                                    <span className="author">👤 {filteredArticles[0].author}</span>
                                    <span className="views">👁️ {filteredArticles[0].views.toLocaleString()} lượt xem</span>
                                </div>
                                <button className="read-more-btn">Đọc tiếp</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter */}
            <div className="news-controls">
                <div className="search-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                        <button className="search-btn">🔍</button>
                    </div>
                </div>

                <div className="category-filter">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="articles-grid">
                {currentArticles.length === 0 ? (
                    <div className="no-articles">
                        <div className="no-articles-icon">📰</div>
                        <h3>Không tìm thấy bài viết nào</h3>
                        <p>Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
                    </div>
                ) : (
                    currentArticles.slice(1).map(article => (
                        <article key={article.id} className="article-card">
                            <div className="article-image">
                                <img src={article.image} alt={article.title} />
                                <div className="article-overlay">
                                    <button className="quick-read">Đọc nhanh</button>
                                </div>
                            </div>

                            <div className="article-content">
                                <div className="article-meta">
                                    <span className="category">{article.category}</span>
                                    <span className="date">{formatDate(article.publishDate)}</span>
                                </div>

                                <h3 className="article-title">{article.title}</h3>
                                <p className="article-summary">{article.summary}</p>

                                <div className="article-tags">
                                    {article.tags.map(tag => (
                                        <span key={tag} className="tag">#{tag}</span>
                                    ))}
                                </div>

                                <div className="article-footer">
                                    <div className="article-stats">
                                        <span className="read-time">⏱️ {article.readTime} phút</span>
                                        <span className="views">👁️ {article.views.toLocaleString()}</span>
                                    </div>
                                    <div className="author">👤 {article.author}</div>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ← Trước
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        className="page-btn"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Sau →
                    </button>
                </div>
            )}

            {/* Newsletter Signup */}
            <div className="newsletter-section">
                <div className="newsletter-content">
                    <h2>Đăng ký nhận tin tức mới nhất</h2>
                    <p>Nhận thông báo về những bài viết và xu hướng thời trang mới nhất</p>
                    <div className="newsletter-form">
                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="newsletter-input"
                        />
                        <button className="newsletter-btn">Đăng ký</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
