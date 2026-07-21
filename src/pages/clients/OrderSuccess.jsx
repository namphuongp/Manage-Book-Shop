import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function OrderSuccess() {
    const navigate = useNavigate();

    return (
        <Container className="my-5 text-center py-5">
            <Card className="border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: '600px', borderRadius: '15px' }}>
                <i className="bi bi-check-circle-fill text-success mb-3" style={{ fontSize: '5rem' }}></i>
                <h2 className="fw-bold mb-3">Đặt hàng thành công!</h2>
                <p className="text-muted fs-5 mb-4">
                    Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
                </p>
                
                <div className="d-flex justify-content-center gap-3">
                    <Button 
                        variant="outline-success" 
                        size="lg" 
                        className="px-4 fw-bold"
                        onClick={() => navigate('/')}
                    >
                        Tiếp tục mua sắm
                    </Button>
                    <Button 
                        variant="success" 
                        size="lg"   
                        className="px-4 fw-bold"
                        style={{ backgroundColor: '#7fad39', border: 'none' }} 
                        onClick={() => navigate('/orders')}
                    >
                        Xem đơn hàng
                    </Button>
                </div>
            </Card>
        </Container>
    );
}

export default OrderSuccess;