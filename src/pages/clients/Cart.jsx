import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, ButtonGroup, Modal } from 'react-bootstrap';
import axios from 'axios';

function Cart({ user, fetchCartCount }) {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });
    const API_URL = 'http://localhost:9999';

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        fetchCartData();
    }, [user]);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/carts?userId=${user.id}`);
            if (res.data.length > 0) {
                setCart(res.data[0]);
            } else {
                setCart(null);
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu giỏ hàng.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (targetBookId, newQuantity) => {
        if (!cart) return;

        try {
            setIsUpdating(true);

            // Kiểm tra tồn kho
            const currentItem = cart.items.find(i => i.bookId === targetBookId);
            if (newQuantity > (currentItem?.quantity || 0)) {
                const bookCheckRes = await axios.get(`${API_URL}/books/${targetBookId}`);
                if (newQuantity > bookCheckRes.data.stock) {
                    showAlert('Thông báo', 'Số lượng vượt quá số sản phẩm đang có trong kho!');
                    setIsUpdating(false);
                    return;
                }
            }

            let updatedItems = [];
            if (newQuantity === 0) {
                updatedItems = cart.items.filter(i => i.bookId !== targetBookId);
            } else {
                updatedItems = cart.items.map(i =>
                    i.bookId === targetBookId ? { ...i, quantity: newQuantity } : i
                );
            }

            const res = await axios.patch(`${API_URL}/carts/${cart.id}`, { items: updatedItems });
            setCart(res.data);
            if (fetchCartCount) fetchCartCount(user.id);

        } catch (error) {
            showAlert('Lỗi', 'Lỗi khi cập nhật số lượng!');
        } finally {
            setIsUpdating(false);
        }
    };

    // Xóa khỏi giỏ
    const handleRemoveItem = async (targetBookId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

        try {
            setIsUpdating(true);
            const updatedItems = cart.items.filter(i => i.bookId !== targetBookId);
            const res = await axios.patch(`${API_URL}/carts/${cart.id}`, { items: updatedItems });

            setCart(res.data);
            if (fetchCartCount) fetchCartCount(user.id);
        } catch (error) {
            showAlert('Lỗi', 'Lỗi khi xóa sản phẩm!');
        } finally {
            setIsUpdating(false);
        }
    };

    // Không có user
    if (!user) {
        return (
            <Container className="text-center my-5 py-5">
                <h3 className="mt-3">Bạn chưa đăng nhập</h3>
                <p className="text-muted">Vui lòng đăng nhập để xem giỏ hàng của bạn.</p>
                <Button variant="success" onClick={() => navigate('/login')} className="px-4 py-2 mt-2" style={{ backgroundColor: '#7fad39', border: 'none' }}>
                    Đăng nhập ngay
                </Button>
            </Container>
        );
    }

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" style={{ color: '#7fad39' }} /></Container>;
    if (error) return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
    const showAlert = (title, message) => {
        setModalInfo({ show: true, title, message });
    };
    const shippingFee = 30000;
    const hasItems = cart && cart.items && cart.items.length > 0;
    const cartTotalPrice = hasItems ? cart.items.reduce((total, item) => total + (item.price * item.quantity), 0) : 0;
    const finalTotal = hasItems ? cartTotalPrice + shippingFee : 0;

    return (
        <Container className="my-5">
            <h2 className="fw-bold mb-4">Giỏ hàng của bạn</h2>

            {!hasItems ? (
                <Card className="text-center border-0 shadow-sm py-5 mb-5" style={{ borderRadius: '15px' }}>
                    <Card.Body>
                        <i className="bi bi-cart-x text-muted" style={{ fontSize: '6rem' }}></i>
                        <h4 className="mt-4 text-muted">Giỏ hàng đang trống</h4>
                        <p className="text-muted mb-4">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
                        <Button variant="success" onClick={() => navigate('/')} style={{ backgroundColor: '#7fad39', border: 'none', padding: '10px 30px' }}>
                            MUA SẮM NGAY
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    <Col lg={8} className="mb-4">
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                            <div className="table-responsive">
                                <Table hover className="mb-0 text-center align-middle" style={{ minWidth: '600px' }}>
                                    <thead className="bg-body-tertiary">
                                        <tr>
                                            <th className="py-3 text-start ps-4">Sản phẩm</th>
                                            <th className="py-3">Đơn giá</th>
                                            <th className="py-3">Số lượng</th>
                                            <th className="py-3">Số tiền</th>
                                            <th className="py-3">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="text-start ps-4" style={{ width: '40%' }}>
                                                    <div className="d-flex align-items-center">
                                                        <img src={item.image} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '5px', marginRight: '15px' }} />
                                                        <Link to={`/book/${item.bookId}`} className="text-decoration-none text-body fw-bold">
                                                            <span className="text-truncate d-inline-block" style={{ maxWidth: '180px' }}>{item.title}</span>
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td>{(item.price).toLocaleString()}đ</td>
                                                <td>
                                                    <ButtonGroup size="sm" className="bg-body shadow-sm">
                                                        <Button
                                                            variant="outline-secondary"
                                                            className="border"
                                                            disabled={isUpdating}
                                                            onClick={() => handleUpdateQuantity(item.bookId, item.quantity - 1)}
                                                        > - </Button>
                                                        <Button variant="outline-secondary" className="border fw-bold px-3" disabled style={{ color: 'var(--bs-body-color)', opacity: 1 }}>
                                                            {item.quantity}
                                                        </Button>
                                                        <Button
                                                            variant="outline-secondary"
                                                            className="border"
                                                            disabled={isUpdating}
                                                            onClick={() => handleUpdateQuantity(item.bookId, item.quantity + 1)}
                                                        > + </Button>
                                                    </ButtonGroup>
                                                </td>
                                                <td className="text-danger-emphasis fw-bold">{(item.price * item.quantity).toLocaleString()}đ</td>
                                                <td>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="border-0"
                                                        disabled={isUpdating}
                                                        onClick={() => handleRemoveItem(item.bookId)}
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <i className="bi bi-trash fs-5"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card>
                        <div className="mt-3">
                            <Button variant="outline-secondary" onClick={() => navigate('/')}>
                                <i className="bi bi-arrow-left me-2"></i>Tiếp tục mua sắm
                            </Button>
                        </div>
                    </Col>

                    <Col lg={4}>
                        <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '15px', backgroundColor: 'var(--bs-tertiary-bg)' }}>
                            <h4 className="fw-bold mb-4 pb-3 border-bottom">Tổng thanh toán</h4>

                            <div className="d-flex justify-content-between mb-3 text-muted">
                                <span>Tổng tiền hàng:</span>
                                <span>{cartTotalPrice.toLocaleString()}đ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 text-muted pb-3 border-bottom">
                                <span>Phí vận chuyển:</span>
                                <span>30,000đ</span>
                            </div>

                            <div className="d-flex justify-content-between mb-4 mt-2">
                                <span className="fs-5 fw-bold">Tổng cộng:</span>
                                <span className="fs-4 fw-bold text-danger-emphasis">{finalTotal.toLocaleString()}đ</span>
                            </div>

                            <Button
                                variant="success"
                                size="lg"
                                className="w-100 fw-bold"
                                style={{ backgroundColor: '#7fad39', border: 'none', padding: '12px' }}
                                onClick={() => navigate('/checkout')}
                            >
                                TIẾN HÀNH ĐẶT HÀNG
                            </Button>
                        </Card>
                    </Col>
                </Row>
            )}
            <Modal show={modalInfo.show} onHide={() => setModalInfo({ ...modalInfo, show: false })}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalInfo.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalInfo.message}
                    <div className='mt-2 d-flex justify-content-end'><Button variant="secondary" onClick={() => setModalInfo({ ...modalInfo, show: false })}>Đóng</Button></div>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Cart;