import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
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
        return matchesSearch && matchesCategory;
    });

    // Best Sellers (Lấy top 4 sách có rating cao nhất)
    const bestSellers = [...books].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4);

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" variant="success" /></Container>;
    if (error) return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;


    return (
        <Container className="my-4">
            {/* 1. Phần Best Sellers (Slider/Grid top) */}
            <h3 className="fw-bold mb-3">🔥Best Sellers</h3>
            <Row className="mb-5">
                {bestSellers.map(book => (
                    <Col md={3} sm={6} key={book.id}>
                        <Card
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
                            onClick={() => navigate(`/book/${book.id}`)}                            >
                            <div className="position-absolute top-0 start-0 m-2 bg-danger text-white px-2 py-1 rounded-pill small fw-bold">
                                BEST SELLER
                            </div>
                            <Card.Img variant="top" src={book.image} style={{ height: '200px', objectFit: 'contain' }} />
                            <Card.Body className="text-center">
                                <p className="small text-muted mb-1">{book.author}</p>
                                <h6 className="text-truncate">{book.title}</h6>
                                <p className="fw-bold text-danger">{book.price.toLocaleString()}đ</p>
                                <p className="text-warning">
                                    {"★".repeat(Math.floor(book.rating))}
                                    {"☆".repeat(5 - Math.floor(book.rating))}
                                    <span className="text-muted ms-1">({book.rating})</span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 2. Thanh lọc và Tìm kiếm */}
            <div className="bg-light p-3 rounded mb-4 d-flex flex-wrap gap-2">
                <Form.Control
                    type="text"
                    placeholder="🔍 Tìm sách, tác giả..."
                    style={{ maxWidth: '300px' }}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Form.Select style={{ maxWidth: '200px' }} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="All">Tất cả danh mục</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Form.Select>
            </div>

            {/* 3. Lưới sản phẩm */}
            <Row className="g-4">
                {filteredBooks.map(book => (
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
                            <div style={{ overflow: 'hidden', height: '250px' }}>
                                <Card.Img
                                    variant="top"
                                    src={book.image}
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s ease'
                                    }}
                                />
                            </div>

                            <Card.Body className="text-center">
                                <h6 className="fw-bold mb-1" style={{ color: '#333' }}>{book.title}</h6>
                                <p className="small text-muted mb-2">{book.author}</p>
                                <h5 className="text-danger fw-bold mb-3">{book.price.toLocaleString()}đ</h5>
                                <p className="text-warning">
                                    {"★".repeat(Math.floor(book.rating))}
                                    {"☆".repeat(5 - Math.floor(book.rating))}
                                    <span className="text-muted ms-1">({book.rating})</span>
                                </p>    
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default BookList;