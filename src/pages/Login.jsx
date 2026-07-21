import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';


function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '', form: '' });

    const navigate = useNavigate();
    const API_URL = 'http://localhost:9999';

    const handleLogin = async (e) => {
        e.preventDefault();
        let newErrors = { email: '', password: '', form: '' };
        let hasError = false;

        if (!email.trim()) {
            newErrors.email = 'Vui lòng nhập Email!';
            hasError = true;
        } else if (!email.includes('@')) {
            newErrors.email = 'Email phải có định dạng hợp lệ (bao gồm @).';
            hasError = true;
        }

        if (!password.trim()) {
            newErrors.password = 'Vui lòng nhập mật khẩu!';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        try {
            const res = await axios.get(`${API_URL}/users?email=${email.trim()}&password=${password.trim()}`);

            if (res.data.length > 0) {
                const user = res.data[0];
                localStorage.setItem('currentUser', JSON.stringify(user));
                onLoginSuccess(user);
                if (user.role === 'admin') {
                    navigate('/admin/books');
                } else {
                    navigate('/');
                }
            } else {
                setErrors({ ...newErrors, form: 'Email hoặc mật khẩu không chính xác!' });
            }
        } catch (err) {
            setErrors({ ...newErrors, form: 'Không thể kết nối đến server!' });
        }
    };
    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={4}>
                    <Card className="shadow-sm border-0 p-4">
                        <h3 className="text-center fw-bold mb-4" style={{ color: '#7fad39' }}>ĐĂNG NHẬP</h3>

                        {/* Lỗi chung cho cả form */}
                        {errors.form && <Alert variant="danger" className="py-2">{errors.form}</Alert>}

                        <Form onSubmit={handleLogin} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="email"
                                    placeholder="Email"
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {errors.email && <small className="text-danger">{errors.email}</small>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="password"
                                    placeholder="Mật khẩu"
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {errors.password && <small className="text-danger">{errors.password}</small>}
                            </Form.Group>

                            <Button type="submit" className="w-100" style={{ backgroundColor: '#7fad39', border: 'none' }}>
                                ĐĂNG NHẬP
                            </Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;