import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BookList({ user, fetchCartCount }) {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const API_URL = 'http://localhost:9999';

    // States cho Filter & Search
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [maxPrice, setMaxPrice] = useState(0);
    const [selectedPrice, setSelectedPrice] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [booksRes, catRes] = await Promise.all([
                    axios.get(`${API_URL}/books`),
                    axios.get(`${API_URL}/categories`)
                ]);

                setBooks(booksRes.data);
                setCategories(catRes.data);

                if (booksRes.data.length > 0) {
                    const highestPrice = Math.max(...booksRes.data.map(book => book.price));
                    setMaxPrice(highestPrice);
                    setSelectedPrice(highestPrice);
                }

            } catch (err) {
                setError('Không thể kết nối tới server. Vui lòng kiểm tra lại cổng 9999.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Logic lọc dữ liệu
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

    return (
        <Container className="my-4">
            {/* 1. Phần Best Sellers */}
            <h3 className="fw-bold mb-3">
                <i className="bi bi-fire text-danger me-2"></i>Sách Bán Chạy Nhất
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
                                <p className="fw-bold text-danger fs-5 mb-1">{book.price.toLocaleString()}đ</p>
                                <p className="text-warning mb-0" style={{ fontSize: '0.9rem' }}>
                                    {"★".repeat(Math.floor(book.rating))}
                                    {"☆".repeat(5 - Math.floor(book.rating))}
                                    <span className="text-muted ms-1">({book.rating})</span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* filter */}
            <Card className="border-0 shadow-sm mb-5" style={{ borderRadius: '15px', backgroundColor: '#ffffff' }}>
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
                                    className="border-light-subtle bg-light"
                                />
                            </div>
                        </Col>

                        <Col lg={3} md={6}>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={{ borderRadius: '10px', height: '45px' }}
                                className="border-light-subtle bg-light text-secondary"
                            >
                                <option value="All">Tất cả danh mục</option>
                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </Form.Select>
                        </Col>

                        {/* <Col lg={5} md={12}>
                            <div className="px-lg-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Label className="small text-muted fw-bold mb-0">Mức giá tối đa</Form.Label>
                                    <span className="badge bg-danger px-3 py-2" style={{ borderRadius: '8px', fontSize: '0.9rem' }}>
                                        {Number(selectedPrice).toLocaleString()} đ
                                    </span>
                                </div>
                                <Form.Range
                                    min={0}
                                    max={maxPrice}
                                    step={10000}
                                    value={selectedPrice}
                                    onChange={(e) => setSelectedPrice(Number(e.target.value))}
                                    style={{ height: '0.5rem' }}
                                />
                                <div className="d-flex justify-content-between text-muted mt-1" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                                    <span>0đ</span>
                                    <span>{Number(maxPrice).toLocaleString()}đ</span>
                                </div>
                            </div>
                        </Col> */}
                    </Row>
                </Card.Body>
            </Card>

            {/* Danh sách sản phẩm */}
            <Row className="g-4 mb-5">
                {filteredBooks.length > 0 ? (
                    filteredBooks.map(book => (
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
                                <div style={{ overflow: 'hidden', height: '260px', backgroundColor: '#f9f9f9', padding: '20px' }}>
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

                                <Card.Body className="text-center d-flex flex-column justify-content-between">
                                    <div>
                                        <h6 className="fw-bold mb-2 text-truncate" style={{ color: '#2c3e50' }}>{book.title}</h6>
                                        <p className="small text-muted mb-3">{book.author}</p>
                                    </div>
                                    <div>
                                        <h5 className="text-danger fw-bold mb-2">{book.price.toLocaleString()}đ</h5>
                                        <p className="text-warning mb-0" style={{ fontSize: '0.9rem' }}>
                                            {"★".repeat(Math.floor(book.rating))}
                                            {"☆".repeat(5 - Math.floor(book.rating))}
                                            <span className="text-muted ms-1">({book.rating})</span>
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
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