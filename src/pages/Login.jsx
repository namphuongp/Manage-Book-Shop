import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';


function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const API_URL = 'http://localhost:9999';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const res = await axios.get(`${API_URL}/users?email=${trimmedEmail}&password=${trimmedPassword}`);
        try {
            if (res.data.length > 0) {
                const user = res.data[0];
                localStorage.setItem('currentUser', JSON.stringify(user));
                onLoginSuccess(user);
                navigate('/');
            } else {
                setError('Sai Email hoặc Mật khẩu!');
            }
        } catch (err) {
            setError('Không thể kết nối đến server. Vui lòng kiểm tra cổng 9999!');
        }
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={4}>
                    <Card className="shadow-sm border-0 p-4">
                        <h3 className="text-center fw-bold mb-4" style={{ color: '#7fad39' }}>ĐĂNG NHẬP</h3>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3"><Form.Control type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} /></Form.Group>
                            <Form.Group className="mb-3"><Form.Control type="password" placeholder="Mật khẩu" required onChange={(e) => setPassword(e.target.value)} /></Form.Group>
                            <Button type="submit" className="w-100 ogani-btn">ĐĂNG NHẬP</Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
export default Login;