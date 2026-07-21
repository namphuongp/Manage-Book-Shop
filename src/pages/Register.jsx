import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

function Register() {
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '', phone: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ name: '', email: '', password: '', phone: '', form: '' });
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Xóa cảnh báo khi nhập lại
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error[e.target.name]) {
            setError({ ...error, [e.target.name]: '' });
        }
    };

    const API_URL = 'http://localhost:9999';

    const handleRegister = async (e) => {
        e.preventDefault();
        const newErrors = { name: '', email: '', password: '', phone: '', form: '' };
        let isValid = true; 

        setError(newErrors);
        setSuccess('');
        setLoading(true);

        try {
            const usersRes = await axios.get(`${API_URL}/users`);
            
            const hasLetter = /[a-zA-ZÀ-ỹ]/.test(formData.fullName);
            if (!formData.fullName || formData.fullName.trim() === '' || !hasLetter) {
                newErrors.name = 'Họ tên không hợp lệ. Vui lòng nhập tên có chứa chữ cái.';
                isValid = false;
            }

            const emailExists = usersRes.data.find(u => u.email === formData.email);
            if (!formData.email || formData.email.trim() === '' || !formData.email.includes('@')) {
                newErrors.email = 'Vui lòng điền Email hợp lệ!';
                isValid = false;
            } else if (emailExists) {
                newErrors.email = 'Email này đã tồn tại!';
                isValid = false;
            }

            if (formData.phone.length !== 10 || formData.phone.match(/\D/) || formData.phone.charAt(0) !== '0') {
                newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số, bắt đầu bằng số 0 và không chứa chữ cái.';
                isValid = false;
            }

            if (formData.password.includes(' ') || formData.password.length < 6 || formData.password.length > 20 || !formData.password.match(/^(?=.*[a-zA-Z])(?=.*\d)/)) {
                newErrors.password = 'Vui lòng điền mật khẩu: Mật khẩu phải từ 6-20 ký tự, không chứa khoảng trắng, và bao gồm ít nhất một chữ cái và một số.';
                isValid = false;
            }

            if (!isValid) {
                setError(newErrors);
                setLoading(false);
                return; 
            }

            //nếu hợp lệ
            const currentIds = usersRes.data.map(u => parseInt(u.id));
            const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
            const newId = (maxId + 1).toString();

            const newUser = {
                id: newId,
                ...formData,
                role: 'customer'
            };

            await axios.post(`${API_URL}/users`, newUser);
            setSuccess('Đăng ký tài khoản thành công! Đang chuyển bạn đến trang đăng nhập...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error(err);
            setError({ ...newErrors, form: 'Lỗi kết nối máy chủ.' });
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

                        {error.form && <Alert variant="danger">{error.form}</Alert>}

                        <Form onSubmit={handleRegister} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Label>Họ tên</Form.Label>
                                <Form.Control required name="fullName" onChange={handleChange} value={formData.fullName} />
                                {error.name && <small style={{ color: 'red' }}>{error.name}</small>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" required name="email" onChange={handleChange} value={formData.email} />
                                {error.email && <small style={{ color: 'red' }}>{error.email}</small>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control type="text" required name="phone" onChange={handleChange} value={formData.phone} />
                                {error.phone && <small style={{ color: 'red' }}>{error.phone}</small>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Mật khẩu (tối thiểu 6 ký tự)</Form.Label>
                                <Form.Control type="password" required name="password" onChange={handleChange} value={formData.password} />
                                {error.password && <small style={{ color: 'red' }}>{error.password}</small>}
                            </Form.Group>

                            {success && <Alert variant="success" className="text-center">{success}</Alert>}
                            <Button type="submit" variant='outline-success' className="w-100 ogani-btn" disabled={loading}>
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