import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Spinner, Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AdminOrders({ user }) {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const navigate = useNavigate();
    const API_URL = 'http://localhost:9999';

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            setLoading(false);
            return;
        }
        fetchAdminData();
    }, [user]);

    if (!user || user.role !== 'admin') {
        return (
            <Container className="text-center my-5 py-5">
                <i className="bi bi-shield-lock text-danger-emphasis" style={{ fontSize: '4rem' }}></i>
                <h3 className="mt-3">Truy cập bị từ chối</h3>
                <p className="text-muted">Bạn không có quyền truy cập vào trang quản trị viên này.</p>
                <Button variant="success" onClick={() => navigate('/')} style={{ backgroundColor: '#7fad39', border: 'none' }}>
                    Về trang chủ
                </Button>
            </Container>
        );
    }

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [ordersRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/orders`),
                axios.get(`${API_URL}/users`)
            ]);

            const sortedOrders = ordersRes.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setOrders(sortedOrders);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu admin', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/orders/${orderId}`, { status: newStatus });
            setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
        } catch (err) {
            alert('Cập nhật trạng thái thất bại!');
        }
    };

    const getUserName = (userId) => {
        const foundUser = users.find(u => u.id === userId);
        return foundUser ? foundUser.fullName : 'Ẩn danh';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge bg="warning" text="dark" className="px-3 py-2 fs-6">Đang xử lý</Badge>;
            case 'accepted':
                return <Badge bg="success" className="px-3 py-2 fs-6">Đã nhận đơn</Badge>;
            case 'shipping':
                return <Badge bg="primary" className="px-3 py-2 fs-6">Đang ship</Badge>;
            case 'completed':
                return <Badge bg="success" className="px-3 py-2 fs-6">Hoàn thành</Badge>;
            case 'cancelled':
                return <Badge bg="danger" className="px-3 py-2 fs-6">Hủy đơn</Badge>;
            default:
                return <Badge bg="secondary" className="px-3 py-2 fs-6">{status}</Badge>;
        }
    };

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" style={{ color: '#7fad39' }} /></Container>;

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'ALL') return true;
        return order.status === statusFilter;
    });

    return (
        <Container className="my-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Quản lý Đơn hàng (Admin)</h2>

                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted">Lọc theo trạng thái:</span>
                    <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '200px' }}
                    >
                        <option value="ALL">Tất cả đơn hàng</option>
                        <option value="pending">Đang xử lý</option>
                        <option value="accepted">Đã nhận đơn</option>
                        <option value="shipping">Đang ship</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Hủy đơn</option>
                    </Form.Select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <Alert variant="info" className="text-center p-4">
                    Không có đơn hàng nào trong hệ thống.
                </Alert>
            ) : (
                filteredOrders.map((order) => (
                    <Card key={order.id} className="mb-4 shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        <Card.Header className="bg-body-tertiary d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom-0">
                            <div>
                                <span className="fw-bold me-3">Mã đơn: #{order.id}</span>
                                <span className="text-muted me-3">
                                    <i className="bi bi-person me-1"></i> Khách hàng: <strong>{getUserName(order.userId)}</strong>
                                </span>
                                {/* <span className="text-muted">
                                    <i className="bi bi-clock me-1"></i> {new Date(order.date).toLocaleString('vi-VN')}
                                </span> */}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-2 mt-md-0 flex-wrap">

                                <div className="btn-group ms-2" role="group">
                                    {order.status === 'pending' && (
                                        <>
                                            <Button size="sm" variant="success" onClick={() => handleUpdateStatus(order.id, 'accepted')}>
                                                Nhận đơn
                                            </Button>
                                            <Button size="sm" variant="outline-danger" onClick={() => handleUpdateStatus(order.id, 'cancelled')}>
                                                Hủy
                                            </Button>
                                        </>
                                    )}

                                    {order.status === 'accepted' && (
                                        <Button size="sm" variant="outline-primary" onClick={() => handleUpdateStatus(order.id, 'shipping')}>
                                            Giao ship
                                        </Button>
                                    )}

                                    {order.status === 'shipping' && (
                                        <Button size="sm" variant="success" onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                            Xác nhận hoàn thành
                                        </Button>
                                    )}

                                </div>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-0">
                            <div className="p-3 bg-body border-bottom small text-muted d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Người nhận:</strong> {order.fullName} | <strong>SĐT:</strong> {order.phone} | <strong>Địa chỉ:</strong> {order.address}
                                </div>
                                <div>
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>
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
                            <div className="text-muted small">
                                <i className="bi bi-credit-card me-1"></i>
                                Thanh toán: <strong className="text-body">{order.paymentMethod === 'BANKING' ? 'Chuyển khoản' : 'COD'}</strong>
                            </div>
                            <div className="text-end">
                                <span className="text-muted me-2">Tổng tiền (gồm ship):</span>
                                <span className="fs-5 fw-bold text-danger-emphasis">{order.totalPrice.toLocaleString()}đ</span>
                            </div>
                        </Card.Footer>
                    </Card>
                ))
            )}
        </Container>
    );
}

export default AdminOrders;