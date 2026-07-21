import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

function Checkout({ user, fetchCartCount }) {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', address: '' });
    const [errors, setErrors] = useState({});

    const API_URL = 'http://localhost:9999';

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
        if (formData.phone.length !== 10 || formData.phone.match(/\D/)) newErrors.phone = 'Số điện thoại không hợp lệ.';
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

        setLoading(true);
        try {
            // 1. Lưu đơn hàng
            const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            await axios.post(`${API_URL}/orders`, {
                userId: user.id,
                items: cart.items,
                totalPrice: total,
                ...formData,
                date: new Date().toISOString(),
                status: 'pending'
            });

            // 2. Xóa giỏ hàng
            await axios.patch(`${API_URL}/carts/${cart.id}`, { items: [] });

            if (fetchCartCount) fetchCartCount(user.id);
            alert('Đặt hàng thành công!');
            navigate('/');
        } catch (err) {
            alert('Có lỗi xảy ra khi đặt hàng.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) return <Container className="my-5 text-center"><h3>Giỏ hàng trống</h3></Container>;

    return (
        <Container className="my-5">
            <h2 className="fw-bold mb-4">Thanh toán</h2>
            <Row>
                <Col lg={7}>
                    <Card className="p-4 shadow-sm border-0">
                        <Form onSubmit={handleCheckout} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ tên người nhận</Form.Label>
                                <Form.Control name="fullName" value={formData.fullName} onChange={handleChange} />
                                {errors.fullName && <small className="text-danger">{errors.fullName}</small>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control name="phone" value={formData.phone} onChange={handleChange} />
                                {errors.phone && <small className="text-danger">{errors.phone}</small>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Địa chỉ giao hàng</Form.Label>
                                <Form.Control as="textarea" name="address" onChange={handleChange} />
                                {errors.address && <small className="text-danger">{errors.address}</small>}
                            </Form.Group>
                            <Button type="submit" variant="success" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'XÁC NHẬN ĐẶT HÀNG'}
                            </Button>
                        </Form>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="p-4 shadow-sm border-0">
                        <h5>Đơn hàng của bạn</h5>
                        {cart.items.map((i, idx) => (
                            <div key={idx} className="d-flex justify-content-between mb-2">
                                <span>{i.title} x {i.quantity}</span>
                                <span>{(i.price * i.quantity).toLocaleString()}đ</span>
                            </div>
                        ))}
                        <hr />
                        <h4 className="text-danger">Tổng: {cart.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}đ</h4>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
export default Checkout;