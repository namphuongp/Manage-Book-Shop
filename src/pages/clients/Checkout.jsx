import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

function Checkout({ user, fetchCartCount }) {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        address: user?.address || '',
        paymentMethod: 'COD' 
    });
    const [errors, setErrors] = useState({});

    const API_URL = 'http://localhost:9999';
    const shippingFee = 30000;

    useEffect(() => {
        const fetchCart = async () => {
            const res = await axios.get(`${API_URL}/carts?userId=${user.id}`);
            if (res.data.length > 0) setCart(res.data[0]);
        };
        fetchCart();
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên.';
        if (formData.phone.length !== 10 || formData.phone.match(/\D/)) newErrors.phone = 'Số điện thoại không hợp lệ (cần 10 chữ số).';
        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ giao hàng.';
        return newErrors;
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const itemsTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const finalTotal = itemsTotal + shippingFee;

            await axios.post(`${API_URL}/orders`, {
                userId: user.id,
                items: cart.items,
                itemsTotal: itemsTotal,
                shippingFee: shippingFee,
                totalPrice: finalTotal,
                ...formData,
                date: new Date().toISOString(),
                status: 'pending'
            });

            await axios.patch(`${API_URL}/carts/${cart.id}`, { items: [] });

            if (fetchCartCount) fetchCartCount(user.id);
            navigate('/order-success');
        } catch (err) {
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <Container className="my-5 text-center py-5">
                <i className="bi bi-bag-x text-muted" style={{ fontSize: '4rem' }}></i>
                <h3 className="mt-3 text-muted">Giỏ hàng của bạn đang trống</h3>
                <Button variant="success" className="mt-3" style={{ backgroundColor: '#7fad39', border: 'none' }} onClick={() => navigate('/')}>
                    Quay lại mua sắm
                </Button>
            </Container>
        );
    }

    const itemsTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const finalTotal = itemsTotal + shippingFee;

    return (
        <Container className="my-5">
            <h2 className="fw-bold mb-4">Hoàn tất đơn hàng</h2>
            <Form onSubmit={handleCheckout} noValidate>
                <Row className="g-4">
                    {/* Cột trái: Thông tin giao hàng & Thanh toán */}
                    <Col lg={7}>
                        {/* Box 1: Thông tin giao hàng */}
                        <Card className="p-4 shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
                            <h5 className="fw-bold mb-4 pb-2 border-bottom">
                                <i className="bi bi-geo-alt me-2 text-danger"></i>Thông tin giao hàng
                            </h5>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Họ tên người nhận <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    isInvalid={!!errors.fullName}
                                    placeholder="Nhập họ và tên"
                                />
                                <Form.Control.Feedback type="invalid">{errors.fullName}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Số điện thoại <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    isInvalid={!!errors.phone}
                                    placeholder="Nhập số điện thoại liên hệ"
                                />
                                <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Địa chỉ nhận hàng <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    isInvalid={!!errors.address}
                                    placeholder="Nhập địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                                />
                                <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                            </Form.Group>
                        </Card>

                        {/* Box 2: Phương thức thanh toán */}
                        <Card className="p-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                            <h5 className="fw-bold mb-4 pb-2 border-bottom">Phương thức thanh toán
                            </h5>

                            <div className="p-3 border rounded mb-3 bg-light">
                                <Form.Check
                                    type="radio"
                                    id="payment-cod"
                                    name="paymentMethod"
                                    value="COD"
                                    checked={formData.paymentMethod === 'COD'}
                                    onChange={handleChange}
                                    label={
                                        <span className="fw-semibold ms-2 d-flex align-items-center">
                                            Thanh toán khi nhận hàng (COD)
                                        </span>
                                    }
                                />
                            </div>

                            <div className="p-3 border rounded">
                                <Form.Check
                                    type="radio"
                                    id="payment-banking"
                                    name="paymentMethod"
                                    value="BANKING"
                                    checked={formData.paymentMethod === 'BANKING'}
                                    onChange={handleChange}
                                    label={
                                        <span className="fw-semibold ms-2 d-flex align-items-center">
                                            Chuyển khoản ngân hàng
                                        </span>
                                    }
                                />

                            </div>
                        </Card>
                    </Col>

                    {/* Cột phải: Tóm tắt đơn hàng */}
                    <Col lg={5}>
                        <Card className="p-4 shadow-sm border-0" style={{ borderRadius: '12px', position: 'sticky', top: '20px' }}>
                            <h5 className="fw-bold mb-4 pb-2 border-bottom">
                                Đơn hàng của bạn
                            </h5>

                            <ListGroup variant="flush" className="mb-3">
                                {cart.items.map((i, idx) => (
                                    <ListGroup.Item key={idx} className="px-0 d-flex justify-content-between align-items-start border-0 border-bottom mb-2 pb-3">
                                        <div className="d-flex align-items-center" style={{ maxWidth: '75%' }}>
                                            {i.image && (
                                                <img src={i.image} alt={i.title} style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '12px' }} />
                                            )}
                                            <div>
                                                <h6 className="mb-1 text-truncate" style={{ maxWidth: '100%', fontSize: '0.95rem' }}>{i.title}</h6>
                                                <span className="text-muted small">SL: {i.quantity} x {i.price.toLocaleString()}đ</span>
                                            </div>
                                        </div>
                                        <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                                            {(i.price * i.quantity).toLocaleString()}đ
                                        </span>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>

                            <div className="d-flex justify-content-between mb-2 text-muted">
                                <span>Tạm tính:</span>
                                <span>{itemsTotal.toLocaleString()}đ</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 pb-3 border-bottom text-muted">
                                <span>Phí vận chuyển:</span>
                                <span>{shippingFee.toLocaleString()}đ</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <span className="fs-5 fw-bold">Tổng cộng:</span>
                                <span className="fs-3 fw-bold text-danger">{finalTotal.toLocaleString()}đ</span>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-100 fw-bold"
                                style={{ backgroundColor: '#7fad39', border: 'none', padding: '12px' }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> ĐANG XỬ LÝ...</>
                                ) : 'ĐẶT HÀNG'}
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default Checkout;