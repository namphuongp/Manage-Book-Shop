import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Favorites = ({ user }) => {
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_URL = 'http://localhost:9999';

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/favorites?userId=${user.id}`);
                setFavoriteBooks(response.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách yêu thích:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    // SỬA LỖI 1 & 2: Dùng đúng favId và URL API
    const handleRemoveFavorite = async (e, favId) => {
        e.stopPropagation();

        try {
            // Đổi từ /api/favorites/... thành ${API_URL}/favorites/...
            await axios.delete(`${API_URL}/favorites/${favId}`);
            
            // Lọc theo fav.id để xóa đúng phần tử khỏi State
            setFavoriteBooks(prevBooks => prevBooks.filter(fav => fav.id !== favId));
        } catch (error) {
            console.error("Lỗi khi xóa khỏi yêu thích:", error);
            alert("Không thể xóa sản phẩm khỏi danh sách yêu thích!");
        }
    };

    // SỬA LỖI 3: Hiển thị loading khi đang tải dữ liệu
    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="danger" />
                <p className="mt-2 text-muted">Đang tải danh sách yêu thích...</p>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container className="py-5">
                <Alert variant="warning" className="text-center">
                    Bạn cần <Alert.Link onClick={() => navigate('/login')}>Đăng nhập</Alert.Link> để xem danh sách yêu thích.
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h3 className="mb-4 fw-bold" style={{ color: '#2c3e50' }}>
                Sách Yêu Thích Của Bạn
            </h3>

            <Row className="g-4">
                {favoriteBooks.length > 0 ? (
                    favoriteBooks.map(fav => (
                        <Col lg={3} md={4} sm={6} key={fav.id}>
                            <Card
                                className="h-100 shadow-sm border-0"
                                style={{ cursor: 'pointer', borderRadius: '15px', overflow: 'hidden' }}
                                onClick={() => navigate(`/book/${fav.bookId}`)}
                            >
                                <div style={{ overflow: 'hidden', height: '260px', backgroundColor: '#f9f9f9', padding: '20px' }}>
                                    <Card.Img
                                        variant="top"
                                        src={fav.bookDetails?.image}
                                        alt={fav.bookDetails?.title}
                                        style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                                <Card.Body className="d-flex flex-column text-center">
                                    <h6 className="fw-bold mb-2 text-truncate" style={{ color: '#2c3e50' }}>
                                        {fav.bookDetails?.title}
                                    </h6>
                                    <p className="small text-muted mb-3 text-truncate">
                                        {fav.bookDetails?.author}
                                    </p>
                                    <h5 className="text-danger fw-bold mb-3 mt-auto">
                                        {fav.bookDetails?.price?.toLocaleString()}đ
                                    </h5>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="w-100"
                                        onClick={(e) => handleRemoveFavorite(e, fav.id)}
                                    >
                                        <i className="bi bi-trash3 me-2"></i>
                                        Bỏ yêu thích
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <Alert variant="info" className="text-center py-5 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <h5 className="text-muted">Bạn chưa có cuốn sách yêu thích nào.</h5>
                            <Button variant="danger" className="mt-3" onClick={() => navigate('/')}>
                                Khám phá sách ngay
                            </Button>
                        </Alert>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default Favorites;