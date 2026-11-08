import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrderHistory({ user }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_URL = 'http://localhost:9999';

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await axios.get(`${API_URL}/orders?userId=${user.id}`);
                const sortedOrders = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setOrders(sortedOrders);
            } catch (err) {
                console.error('Lỗi khi tải lịch sử đơn hàng', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    if (!user) {
        return (
            <Container className="text-center my-5 py-5">
                <i className="bi bi-person-x text-muted" style={{ fontSize: '4rem' }}></i>
                <h3 className="mt-3">Bạn chưa đăng nhập</h3>
                <p className="text-muted">Vui lòng đăng nhập để xem lịch sử mua hàng.</p>
                <Button variant="success" onClick={() => navigate('/login')} className="px-4 py-2 mt-2" style={{ backgroundColor: '#7fad39', border: 'none' }}>
                    Đăng nhập ngay
                </Button>
            </Container>
        );
    }

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" style={{ color: '#7fad39' }} /></Container>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge bg="warning" text="dark" className="px-3 py-2 fs-6">Đang xử lý</Badge>;
            case 'accepted':
                return <Badge bg="info" className="px-3 py-2 fs-6">Đã nhận đơn</Badge>;
            case 'shipping':
                return <Badge bg="primary" className="px-3 py-2 fs-6">Đang ship</Badge>;
            case 'completed':
                return <Badge bg="success" className="px-3 py-2 fs-6">Đã hoàn thành</Badge>;
            case 'cancelled':
                return <Badge bg="danger" className="px-3 py-2 fs-6">Đã hủy</Badge>;
            default:
                return <Badge bg="secondary" className="px-3 py-2 fs-6">{status}</Badge>;
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
        try {
            await axios.patch(`${API_URL}/orders/${orderId}`, { status: 'cancelled' });
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order));
        } catch (err) {
            alert('Hủy đơn hàng thất bại. Vui lòng thử lại sau!');
        }
    };
    return (
        <Container className="my-5">
            <h2 className="fw-bold mb-4">Lịch sử đơn hàng của bạn</h2>

            {orders.length === 0 ? (
                <Alert variant="info" className="text-center p-4">
                    <i className="bi bi-receipt mb-2 d-block" style={{ fontSize: '2rem' }}></i>
                    Bạn chưa có đơn hàng nào. <a href="/" className="alert-link">Mua sắm ngay!</a>
                </Alert>
            ) : (
                orders.map((order) => (
                    <Card key={order.id} className="mb-4 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        <Card.Header className="bg-body-tertiary d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom-0">
                            <div className="mb-2 mb-md-0">
                                <span className="fw-bold me-3">Mã đơn: #{order.id}</span>
                                <span className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {new Date(order.date).toLocaleString('vi-VN')}
                                </span>
                            </div>
                            <div>
                                <div>
                                    {getStatusBadge(order.status)}
                                    {order.status === 'pending' && (
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            className="ms-2"
                                            onClick={() => handleCancelOrder(order.id)}
                                        >
                                            Hủy đơn
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-0">
                            <Table responsive borderless className="mb-0 align-middle">
                                <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className={idx !== order.items.length - 1 ? "border-bottom" : ""}>
                                            <td style={{ width: '90px' }} className="ps-4 py-3">
                                                <img src={item.image} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '5px' }} />
                                            </td>
                                            <td className="py-3">
                                                <h6 className="mb-1 fw-bold">{item.title}</h6>
                                                <div className="text-muted small">Số lượng: {item.quantity}</div>
                                            </td>
                                            <td className="text-end pe-4 py-3 text-muted">
                                                {(item.price).toLocaleString()}đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>

                        <Card.Footer className="bg-body border-top py-3 px-4 d-flex flex-wrap justify-content-between align-items-center">
                            <div className="text-muted small mb-2 mb-md-0">
                                <i className="bi bi-credit-card me-1"></i>
                                Phương thức thanh toán: <strong className="text-body">{order.paymentMethod === 'BANKING' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng (COD)'}</strong>
                            </div>
                            <div className="text-end">
                                <span className="text-muted me-2">Tổng số tiền:</span>
                                <span className="fs-5 fw-bold text-danger-emphasis">{order.totalPrice.toLocaleString()}đ</span>
                            </div>
                        </Card.Footer>
                    </Card>
                ))
            )}
        </Container>
    );
}

export default OrderHistory;