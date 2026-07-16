import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

function Register() {
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const API_URL = 'http://localhost:9999';
    const validate = () => {
        if (!formData.email.includes('@')) return "Email không hợp lệ.";
        if (formData.password.length < 6) return "Mật khẩu phải từ 6 ký tự trở lên.";
        if (formData.phone.length < 10) return "Số điện thoại không hợp lệ.";
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const errorMsg = validate();
        if (errorMsg) return setError(errorMsg);

        setLoading(true);
        setError('');

        try {
            // 1. Lấy danh sách users để tìm ID lớn nhất
            const usersRes = await axios.get(`${API_URL}/users`);

            // Tìm ID lớn nhất (chuyển sang số để so sánh)
            const currentIds = usersRes.data.map(u => parseInt(u.id));
            const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
            const newId = (maxId + 1).toString(); // Chuyển thành string để khớp định dạng DB

            // 2. Kiểm tra tồn tại email
            const emailExists = usersRes.data.find(u => u.email === formData.email);
            if (emailExists) {
                setError('Email này đã tồn tại!');
                setLoading(false);
                return;
            }

            // 3. Đăng ký với ID đã tạo
            const newUser = {
                id: newId,
                ...formData,
                role: 'customer'
            };

            await axios.post(`${API_URL}/users`, newUser);

            alert('Đăng ký thành công!');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra cổng 9999!');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow-sm border-0 p-4">
                        <h3 className="text-center fw-bold mb-4" style={{ color: '#7fad39' }}>TẠO TÀI KHOẢN</h3>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleRegister}>
                            <Form.Group className="mb-3"><Form.Label>Họ tên</Form.Label><Form.Control required name="fullName" onChange={handleChange} /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" required name="email" onChange={handleChange} /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control type="number" required name="phone" onChange={handleChange} /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Mật khẩu (tối thiểu 6 ký tự)</Form.Label><Form.Control type="password" required name="password" onChange={handleChange} /></Form.Group>
                            <Button type="submit" className="w-100 ogani-btn" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'ĐĂNG KÝ'}
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
export default Register;