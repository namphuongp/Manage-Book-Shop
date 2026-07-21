import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Alert, Offcanvas, ListGroup, ButtonGroup, Modal } from 'react-bootstrap';
import axios from 'axios';

function BookDetail({ user, fetchCartCount }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [bookReviews, setBookReviews] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [showCart, setShowCart] = useState(false);
    const [currentCart, setCurrentCart] = useState(null);
    const [isUpdatingCart, setIsUpdatingCart] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const API_URL = 'http://localhost:9999';

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                setLoading(true);
                const [bookRes, reviewsRes, usersRes] = await Promise.all([
                    axios.get(`${API_URL}/books/${id}`),
                    axios.get(`${API_URL}/reviews`),
                    axios.get(`${API_URL}/users`)
                ]);

                setBook(bookRes.data);
                setUsers(usersRes.data);
                const filtered = reviewsRes.data.filter(r => String(r.bookId) === String(id));
                setBookReviews(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } catch (err) {
                setError('Không thể tải thông tin sách. Vui lòng kiểm tra lại server!');
            } finally {
                setLoading(false);
            }
        };
        fetchBookData();
    }, [id]);


    const handleAddToCart = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        try {
            const cartRes = await axios.get(`${API_URL}/carts?userId=${user.id}`);
            const cartData = cartRes.data[0];
            let updatedCartData;

            if (cartData) {
                const itemExists = cartData.items.find(i => i.bookId === book.id);
                if (itemExists && itemExists.quantity >= book.stock) {
                    alert('Số lượng trong giỏ hàng đã đạt mức tối đa trong kho!');
                    return;
                }

                const newItems = itemExists
                    ? cartData.items.map(i => i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i)
                    : [...cartData.items, { bookId: book.id, title: book.title, price: book.price, quantity: 1, image: book.image }];

                const res = await axios.patch(`${API_URL}/carts/${cartData.id}`, { items: newItems });
                updatedCartData = res.data;
            } else {
                if (book.stock < 1) {
                    alert('Sản phẩm này đã hết hàng!');
                    return;
                }
                const allCarts = await axios.get(`${API_URL}/carts`);
                let maxCartId = 0;
                if (allCarts.data.length > 0) {
                    const cartIds = allCarts.data.map(c => parseInt(c.id)).filter(id => !isNaN(id));
                    if (cartIds.length > 0) maxCartId = Math.max(...cartIds);
                }
                const newCartId = (maxCartId + 1).toString();

                const res = await axios.post(`${API_URL}/carts`, {
                    id: newCartId,
                    userId: user.id,
                    items: [{ bookId: book.id, title: book.title, price: book.price, quantity: 1, image: book.image }]
                });
                updatedCartData = res.data;
            }

            if (fetchCartCount) fetchCartCount(user.id);
            setCurrentCart(updatedCartData);
            setShowCart(true);

        } catch (err) {
            alert('Lỗi hệ thống khi thêm vào giỏ hàng.');
        }
    };

    const handleBuyNow = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để mua hàng!');
            navigate('/login');
            return;
        }
        try {
            const cartRes = await axios.get(`${API_URL}/carts?userId=${user.id}`);
            const cartData = cartRes.data[0];
            if (cartData) {
                const itemExists = cartData.items.find(i => i.bookId === book.id);
                if (itemExists && itemExists.quantity >= book.stock) {
                    navigate('/cart');
                    return;
                }
                const newItems = itemExists
                    ? cartData.items.map(i => i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i)
                    : [...cartData.items, { bookId: book.id, title: book.title, price: book.price, quantity: 1, image: book.image }];
                await axios.patch(`${API_URL}/carts/${cartData.id}`, { items: newItems });
            } else {
                const allCarts = await axios.get(`${API_URL}/carts`);
                let maxCartId = 0;
                if (allCarts.data.length > 0) {
                    const cartIds = allCarts.data.map(c => parseInt(c.id)).filter(id => !isNaN(id));
                    if (cartIds.length > 0) maxCartId = Math.max(...cartIds);
                }
                const newCartId = (maxCartId + 1).toString();

                await axios.post(`${API_URL}/carts`, {
                    id: newCartId,
                    userId: user.id,
                    items: [{ bookId: book.id, title: book.title, price: book.price, quantity: 1, image: book.image }]
                });
            }
            if (fetchCartCount) fetchCartCount(user.id);
            navigate('/cart');
        } catch (err) {
            alert('Lỗi hệ thống khi mua hàng.');
        }
    };

    const handleUpdateQuantity = async (targetBookId, newQuantity) => {
        if (!currentCart) return;

        try {
            setIsUpdatingCart(true);
            const currentItem = currentCart.items.find(i => i.bookId === targetBookId);
            //check kho
            if (newQuantity > (currentItem?.quantity || 0)) {
                const bookCheckRes = await axios.get(`${API_URL}/books/${targetBookId}`);
                const stock = bookCheckRes.data.stock;

                if (newQuantity > stock) {
                    alert('Số lượng vượt quá số sản phẩm đang có trong kho!');
                    setIsUpdatingCart(false);
                    return; 
                }
            }
            let updatedItems = [];
            if (newQuantity === 0) {
                updatedItems = currentCart.items.filter(i => i.bookId !== targetBookId);
            } else {
                updatedItems = currentCart.items.map(i =>
                    i.bookId === targetBookId ? { ...i, quantity: newQuantity } : i
                );
            }

            const res = await axios.patch(`${API_URL}/carts/${currentCart.id}`, { items: updatedItems });
            setCurrentCart(res.data);
            if (fetchCartCount) fetchCartCount(user.id);

        } catch (error) {
            console.error(error);
            alert('Lỗi khi cập nhật số lượng!');
        } finally {
            setIsUpdatingCart(false);
        }
    };

    const cartTotalPrice = currentCart?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;


    //Hàm liên quan tới review
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return alert('Vui lòng nhập nội dung đánh giá!');

        setIsSubmitting(true);
        try {
            const allReviewsRes = await axios.get(`${API_URL}/reviews`);
            let maxId = 0;
            if (allReviewsRes.data.length > 0) {
                const reviewIds = allReviewsRes.data.map(r => parseInt(r.id)).filter(id => !isNaN(id));
                if (reviewIds.length > 0) maxId = Math.max(...reviewIds);
            }
            const newReviewId = (maxId + 1).toString();

            const newReview = {
                id: newReviewId,
                bookId: id,
                userId: user.id,
                rating: parseInt(rating),
                comment: comment.trim(),
                date: new Date().toISOString()
            };

            await axios.post(`${API_URL}/reviews`, newReview);

            setBookReviews([newReview, ...bookReviews]);
            setComment('');
            setRating(5);
            setShowReviewForm(false);
            alert('Cảm ơn bạn đã đánh giá!');
        } catch (error) {
            alert('Lỗi khi gửi đánh giá.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getUserFullName = (userId) => {
        const reviewer = users.find(u => u.id === userId);
        return reviewer ? reviewer.fullName : 'Người dùng ẩn danh';
    };

    const totalReviews = bookReviews.length;
    const avgRating = totalReviews > 0
        ? (bookReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

    const getStarPercent = (starCount) => {
        if (totalReviews === 0) return 0;
        const count = bookReviews.filter(r => r.rating === starCount).length;
        return Math.round((count / totalReviews) * 100);
    };

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" variant="success" /></Container>;
    if (error) return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!book) return <Container className="my-5"><h3>Chưa có sách nào.</h3></Container>;

    return (
        <Container className="my-4">
            <Card className="border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '15px' }}>
                <Row>
                    <Col md={4} className="text-center mb-4 mb-md-0">
                        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '10px' }}>
                            <img src={book.image} alt={book.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                        </div>
                    </Col>
                    <Col md={8}>
                        <h2 className="fw-bold mb-2">{book.title}</h2>
                        <div className="d-flex align-items-center mb-3">
                            <span className="text-warning fs-5 me-2">{"★".repeat(Math.round(avgRating))}</span>
                            <span className="text-muted">({totalReviews} đánh giá) | Đã bán: {book.soldCount || 0}</span>
                        </div>
                        <Row className="mb-4">
                            <Col sm={6}>
                                <p className="mb-1">Tác giả: <strong>{book.author}</strong></p>
                                <p className="mb-1">Nhà xuất bản: <strong>{book.publisher}</strong></p>
                            </Col>
                            <Col sm={6}>
                                <p className="mb-1">Số trang: <strong>{book.pages} trang</strong></p>
                                <p className="mb-1">Tình trạng: {book.stock > 0 ? <Badge bg="success">Còn hàng</Badge> : <Badge bg="danger">Hết hàng</Badge>}</p>
                            </Col>
                        </Row>
                        <h3 className="text-danger fw-bold display-6 mb-4">{book.price.toLocaleString()} đ</h3>
                        <Button variant='outline-danger' size="lg" className="px-5 fw-bold" disabled={book.stock === 0} onClick={handleAddToCart}>
                            THÊM VÀO GIỎ HÀNG
                        </Button>
                        <Button variant='danger' size="lg" className="px-5 fw-bold ms-3" disabled={book.stock === 0} onClick={handleBuyNow} style={{ border: 'none' }}>
                            Mua ngay
                        </Button>
                    </Col>
                </Row>
            </Card>

            <h4 className="fw-bold mb-3 border-bottom pb-2">Mô tả sản phẩm</h4>
            <p className="text-muted mb-5" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>{book.description}</p>

            <Card className="border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '10px' }}>
                <h5 className="fw-bold mb-4">Đánh giá sản phẩm</h5>
                <Row className="align-items-center">
                    <Col md={3} className="text-center border-end mb-3 mb-md-0">
                        <div className="display-3 fw-bold">{avgRating}<span className="fs-3 text-muted">/5</span></div>
                        <div className="text-warning fs-4 my-1">
                            {"★".repeat(Math.round(avgRating))}
                            {"☆".repeat(5 - Math.round(avgRating))}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>({totalReviews} đánh giá)</div>
                    </Col>
                    <Col md={5} className="px-4 border-end-md mb-4 mb-md-0">
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="d-flex align-items-center mb-2" style={{ fontSize: '0.9rem', color: '#666' }}>
                                <span className="me-2 text-nowrap" style={{ width: '40px' }}>{star} sao</span>
                                <div className="progress flex-grow-1 mx-2" style={{ height: '8px', backgroundColor: '#f5f5f5' }}>
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{ width: `${getStarPercent(star)}%`, backgroundColor: '#8a949b' }}
                                    ></div>
                                </div>
                                <span className="ms-2" style={{ width: '40px', textAlign: 'right' }}>{getStarPercent(star)}%</span>
                            </div>
                        ))}
                    </Col>
                    <Col md={4} className="text-center px-4">
                        {!user ? (
                            <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                                Chỉ có thành viên mới có thể viết nhận xét. Vui lòng <Link to="/login" className="text-decoration-none">đăng nhập</Link> hoặc <Link to="/register" className="text-decoration-none">đăng ký</Link>.
                            </p>
                        ) : (
                            <div>
                                <p className="text-muted mb-2">Chia sẻ nhận xét của bạn về sản phẩm này</p>
                                <Button style={{ backgroundColor: '#7fad39', border: 'none', padding: '10px 30px' }} onClick={() => setShowReviewForm(!showReviewForm)}>
                                    Viết Đánh Giá
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Card>

            <div>
                {bookReviews.length === 0 ? (
                    <p className="text-muted text-center my-4">Chưa có nhận xét nào cho sản phẩm này.</p>
                ) : (
                    bookReviews.map(review => (
                        <div key={review.id} className="mb-3 pb-3 border-bottom">
                            <div className="d-flex align-items-center mb-1">
                                <strong className="me-2">{getUserFullName(review.userId)}</strong>
                                <small className="text-muted">{new Date(review.date).toLocaleDateString('vi-VN')}</small>
                            </div>
                            <div className="text-warning mb-2" style={{ fontSize: '0.9rem' }}>
                                {"★".repeat(review.rating)}
                                {"☆".repeat(5 - review.rating)}
                            </div>
                            <p className="mb-0 text-dark">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {showReviewForm && user && (
                <Card className="border-0 bg-light p-4 mb-4" style={{ borderRadius: '10px' }}>
                    <h5 className="mb-3">Gửi nhận xét của bạn</h5>
                    <Form onSubmit={handleReviewSubmit}>
                        <Form.Group className="mb-3" style={{ maxWidth: '200px' }}>
                            <Form.Label>Đánh giá:</Form.Label>
                            <Form.Select value={rating} onChange={(e) => setRating(e.target.value)}>
                                <option value="5">5 Sao (Rất tốt)</option>
                                <option value="4">4 Sao (Tốt)</option>
                                <option value="3">3 Sao (Bình thường)</option>
                                <option value="2">2 Sao (Kém)</option>
                                <option value="1">1 Sao (Rất kém)</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control as="textarea" rows={4} placeholder="Nhập nội dung đánh giá của bạn (tối thiểu 10 ký tự)..." value={comment} onChange={(e) => setComment(e.target.value)} />
                        </Form.Group>
                        <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#7fad39', border: 'none' }}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                        </Button>
                    </Form>
                </Card>
            )}

            {/* Giỏ hàng */}
            <Offcanvas show={showCart} onHide={() => setShowCart(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className="fw-bold">
                        <i className="bi bi-cart-check-fill text-success me-2"></i>
                        GIỎ HÀNG CỦA BẠN
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column">
                    <ListGroup variant="flush" className="flex-grow-1 overflow-auto">
                        {currentCart?.items?.map((item, index) => (
                            <ListGroup.Item key={index} className="d-flex align-items-center mb-3 px-0 border-0 border-bottom pb-3">
                                <div style={{ width: '65px', height: '90px', marginRight: '15px' }}>
                                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }} />
                                </div>
                                <div className="flex-grow-1">
                                    <h6 className="mb-1 text-truncate" style={{ maxWidth: '220px' }}>{item.title}</h6>

                                    <div className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                        Đơn giá: {(item.price).toLocaleString()}đ
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <ButtonGroup size="sm">
                                            <Button
                                                variant="outline-secondary"
                                                disabled={isUpdatingCart}
                                                onClick={() => handleUpdateQuantity(item.bookId, item.quantity - 1)}
                                            >
                                                -
                                            </Button>
                                            <Button variant="outline-secondary" disabled style={{ width: '40px', color: '#000', opacity: 1, backgroundColor: '#f8f9fa' }}>
                                                {item.quantity}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                disabled={isUpdatingCart}
                                                onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                                            >
                                                +
                                            </Button>
                                        </ButtonGroup>

                                        {/* Thành tiền của từng sản phẩm */}
                                        <div className="text-danger fw-bold" style={{ fontSize: '1.05rem' }}>
                                            {(item.price * item.quantity).toLocaleString()}đ
                                        </div>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>

                    {currentCart?.items?.length > 0 ? (
                        <div className="mt-3 pt-3">
                            <div className="d-flex justify-content-between fw-bold mb-3 fs-5">
                                <span>Tổng cộng:</span>
                                <span className="text-danger">{cartTotalPrice.toLocaleString()}đ</span>
                            </div>
                            <Button variant="danger" className="w-100 py-2 fw-bold" onClick={() => navigate('/cart')}>
                                XEM CHI TIẾT GIỎ HÀNG
                            </Button>
                            <Button variant="outline-secondary" className="w-100 mt-2" onClick={() => setShowCart(false)}>
                                Tiếp tục mua sắm
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center mt-5">
                            <i className="bi bi-cart-x text-muted" style={{ fontSize: '4rem' }}></i>
                            <p className="text-muted mt-3">Giỏ hàng của bạn đang trống.</p>
                            <Button variant="primary" onClick={() => setShowCart(false)}>Tiếp tục mua sắm</Button>
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            {/* Yêu cầu đăng nhập để thêm vào giỏ */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} >
                <Modal.Body>
                    <div>Bạn cần đăng nhập để có thể thêm sản phẩm vào giỏ hàng hoặc thực hiện mua sắm.</div>
                    <div className='mt-2 d-flex justify-content-end'>
                        <Button className='me-2' size='small' variant="outline-secondary" onClick={() => setShowLoginModal(false)}>
                            Đóng
                        </Button>
                        <Button size='small' variant="success" onClick={() => navigate('/login')} style={{ backgroundColor: '#7fad39', border: 'none' }}>
                            Đăng nhập ngay
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default BookDetail;