import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function Dashboard() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:9999';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const [ordersRes, booksRes, usersRes] = await Promise.all([
                    axios.get(`${API_URL}/orders`),
                    axios.get(`${API_URL}/books`),
                    axios.get(`${API_URL}/users`)
                ]);

                const orders = ordersRes.data;
                const books = booksRes.data.filter(b => !b.is_deleted);
                const users = usersRes.data;

                // 1. Tính tổng doanh thu (chỉ tính các đơn không bị hủy)
                const validOrders = orders.filter(o => o.status !== 'cancelled');
                const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
                
                // 2. Tổng số đơn hàng
                const totalOrders = orders.length;

                // 3. Gom nhóm doanh thu theo ngày để vẽ biểu đồ
                const revenueByDate = {};
                validOrders.forEach(o => {
                    const dateStr = new Date(o.date).toLocaleDateString('vi-VN');
                    if (!revenueByDate[dateStr]) {
                        revenueByDate[dateStr] = 0;
                    }
                    revenueByDate[dateStr] += o.totalPrice || 0;
                });

                // Chuyển đổi dữ liệu sang định dạng mảng của Recharts và sắp xếp theo ngày
                const formattedChartData = Object.keys(revenueByDate).map(date => ({
                    date: date,
                    revenue: revenueByDate[date]
                })).sort((a, b) => {
                    const dateA = new Date(a.date.split('/').reverse().join('-'));
                    const dateB = new Date(b.date.split('/').reverse().join('-'));
                    return dateA - dateB;
                });

                setStats({
                    totalRevenue,
                    totalOrders,
                    totalProducts: books.length,
                    totalUsers: users.length
                });
                setChartData(formattedChartData);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu thống kê", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" style={{ color: '#7fad39' }} /></Container>;

    return (
        <Container fluid className="px-0">
            <h2 className="fw-bold mb-4">Bảng điều khiển & Doanh thu</h2>

            {/* Các thẻ thống kê nhanh (KPI Cards) */}
            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '12px', borderLeft: '5px solid #28a745' }}>
                        <div className="text-muted small">Tổng doanh thu</div>
                        <h3 className="fw-bold text-success-emphasis mt-2 mb-0">{stats.totalRevenue.toLocaleString()}đ</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '12px', borderLeft: '5px solid #007bff' }}>
                        <div className="text-muted small">Tổng đơn hàng</div>
                        <h3 className="fw-bold text-primary-emphasis mt-2 mb-0">{stats.totalOrders}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '12px', borderLeft: '5px solid #ffc107' }}>
                        <div className="text-muted small">Sản phẩm đang bán</div>
                        <h3 className="fw-bold text-warning mt-2 mb-0">{stats.totalProducts}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm p-3" style={{ borderRadius: '12px', borderLeft: '5px solid #17a2b8' }}>
                        <div className="text-muted small">Tổng người dùng</div>
                        <h3 className="fw-bold text-info-emphasis mt-2 mb-0">{stats.totalUsers}</h3>
                    </Card>
                </Col>
            </Row>

            {/* Khu vực Biểu đồ doanh thu */}
            <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
                <h5 className="fw-bold mb-4">Biểu đồ tăng trưởng doanh thu theo thời gian</h5>
                {chartData.length === 0 ? (
                    <p className="text-muted text-center py-5">Chưa có đủ dữ liệu đơn hàng hợp lệ để vẽ biểu đồ.</p>
                ) : (
                    <div style={{ width: '100%', height: 380 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--bs-border-color)" />
                                <XAxis dataKey="date" stroke="var(--bs-secondary-color)" />
                                <YAxis stroke="var(--bs-secondary-color)" tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-border-color)', color: 'var(--bs-body-color)' }}
                                    formatter={(value) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#7fad39" strokeWidth={3} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </Container>
    );
}

export default Dashboard;
