import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BookList({ user, fetchCartCount }) {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const API_URL = 'http://localhost:9999';

    const [favorites, setFavorites] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPrice, setSelectedPrice] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const requests = [
                    axios.get(`${API_URL}/books`),
                    axios.get(`${API_URL}/categories`)
                ];

                if (user?.id) {
                    requests.push(axios.get(`${API_URL}/favorites?userId=${user.id}`));
                }

                const responses = await Promise.all(requests);
                setBooks(responses[0].data);
                setCategories(responses[1].data);

                if (user?.id && responses[2]) {
                    setFavorites(responses[2].data);
                }

                if (responses[0].data.length > 0) {
                    const highestPrice = Math.max(...responses[0].data.map(book => book.price));
                    setSelectedPrice(highestPrice);
                }
            } catch (err) {
                setError('Không thể kết nối tới server.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // lọc dữ liệu
    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || book.categoryId === selectedCategory;
        const matchesPrice = book.price <= selectedPrice;

        return matchesSearch && matchesCategory && matchesPrice;
    });

    const bestSellers = [...books].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" variant="success" /></Container>;
    if (error) return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;

    const handleToggleFavorite = async (e, book) => {
        e.stopPropagation();

        if (!user) {
            alert('Vui lòng đăng nhập để thêm sách vào yêu thích!');
            return;
        }

        const existingFav = favorites.find(fav => fav.bookId === book.id);

        try {
            if (existingFav) {
                await axios.delete(`${API_URL}/favorites/${existingFav.id}`);
                setFavorites(favorites.filter(fav => fav.id !== existingFav.id));
            } else {
                const newFav = {
                    userId: user.id,
                    bookId: book.id,
                    bookDetails: book
                };
                const res = await axios.post(`${API_URL}/favorites`, newFav);
                setFavorites([...favorites, res.data]);
            }
        } catch (error) {
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };
    return (
        <Container className="my-4">
            <h3 className="fw-bold mb-3">
                <i className="bi bi-fire text-danger-emphasis me-2"></i>Sách Bán Chạy Nhất
            </h3>
            <Row className="mb-5">
                {bestSellers.map(book => (
                    <Col md={3} sm={6} key={book.id}>
                        <Card
                            className="h-100 border-0"
                            onMouseEnter={() => setHoveredCard(`bs-${book.id}`)}
                            onMouseLeave={() => setHoveredCard(null)}
                            style={{
                                borderRadius: '15px',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                boxShadow: hoveredCard === `bs-${book.id}` ? '0 15px 30px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.05)',
                                transform: hoveredCard === `bs-${book.id}` ? 'translateY(-10px)' : 'translateY(0)',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/book/${book.id}`)}
                        >
                            <div className="position-absolute top-0 start-0 m-2 bg-danger text-white px-2 py-1 rounded-pill small fw-bold shadow-sm">
                                BEST SELLER
                            </div>
                            <Card.Img variant="top" src={book.image} style={{ height: '200px', objectFit: 'contain', padding: '15px' }} />
                            <Card.Body className="text-center pt-0">
                                <p className="small text-muted mb-1">{book.author}</p>
                                <h6 className="text-truncate fw-bold">{book.title}</h6>
                                <p className="fw-bold text-danger-emphasis fs-5 mb-1">{book.price.toLocaleString()}đ</p>

                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* filter */}
            <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: '15px', backgroundColor: 'var(--bs-body-bg)' }}>
                <Card.Body className="p-4">
                    <Row className="g-4 align-items-end">
                        <Col lg={4} md={6}>
                            <div className="">
                                <Form.Control
                                    type="text"
                                    placeholder="Nhập tên sách, tác giả..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ paddingLeft: '40px', borderRadius: '10px', height: '45px' }}
                                    className="border-light-subtle bg-body-tertiary"
                                />
                            </div>
                        </Col>

                        <Col lg={3} md={6}>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ borderRadius: '10px', height: '45px' }}
                                className="border-light-subtle bg-body-tertiary text-body-secondary"
                            >
                                <option value="All">Tất cả danh mục</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Danh sách sản phẩm */}
            <Row className="g-4 mb-5">
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => {
                        const isFavorited = favorites.some(fav => fav.bookId === book.id);
                        return (

                            <Col lg={3} md={4} sm={6} key={book.id}>
                                <Card
                                    onClick={() => navigate(`/book/${book.id}`)}
                                    className="h-100 border-0"
                                    onMouseEnter={() => setHoveredCard(book.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        boxShadow: hoveredCard === book.id ? '0 15px 30px rgba(0,0,0,0.2)' : '0 5px 15px rgba(0,0,0,0.05)',
                                        transform: hoveredCard === book.id ? 'translateY(-10px)' : 'translateY(0)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ overflow: 'hidden', height: '260px', backgroundColor: 'var(--bs-tertiary-bg)', padding: '20px' }}>
                                        <Card.Img
                                            variant="top"
                                            src={book.image}
                                            style={{
                                                height: '100%',
                                                width: '100%',
                                                objectFit: 'contain',
                                                transition: 'transform 0.3s ease',
                                                transform: hoveredCard === book.id ? 'scale(1.05)' : 'scale(1)'
                                            }}
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isFavorited ? "danger" : "outline-danger"}
                                        className="m-2"
                                        onClick={(e) => handleToggleFavorite(e, book)}
                                    >
                                        <i className={isFavorited ? "bi bi-heart-fill me-1" : "bi bi-heart me-1"}></i>
                                        {isFavorited ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                                    </Button>
                                    <Card.Body className="text-center d-flex flex-column justify-content-between">

                                        <div>
                                            <h6 className="fw-bold mb-2 text-truncate" style={{ color: 'var(--bs-body-color)' }}>{book.title}</h6>
                                            <p className="small text-muted mb-3">{book.author}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-danger-emphasis fw-bold mb-2">{book.price.toLocaleString()}đ</h5>
                                            <div>
                                                {book.stock === 0 ? (
                                                    <p>Hết hàng</p>
                                                ) : book.stock <= 5 ? (
                                                    <p>Còn {book.stock} quyển</p>
                                                ) : ""}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })
                ) : (
                    <Col>
                        <Alert variant="warning" className="text-center py-5 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <i className="bi bi-search text-muted d-block mb-3" style={{ fontSize: '3rem' }}></i>
                            <h5 className="text-muted">Không tìm thấy sách nào phù hợp.</h5>
                        </Alert>
                    </Col>
                )}
            </Row>
        </Container >
    );
}

export default BookList;