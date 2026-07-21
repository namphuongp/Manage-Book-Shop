import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

function AdminLayout({ user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoutClick = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div
                className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark"
                style={{ width: '260px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 1030 }}
            >
                <Link
                    to="/admin/orders"
                    className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none px-2 py-2"
                >
                    <i className="bi bi-book-half fs-4 text-success me-2"></i>
                    <span className="fs-4 fw-bold">Nova Admin</span>
                </Link>

                <hr className="text-secondary" />

                <Nav className="flex-column mb-auto nav-pills gap-1 ">
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/admin/books"
                            active={location.pathname === '/admin/books'}
                            className={`text-white d-flex align-items-center py-2 px-3 text-center ${location.pathname === '/admin/books' ? 'bg-success' : ''}`}
                            style={{ borderRadius: '8px' }}
                        >Quản lý Sản Phẩm
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/admin/orders"
                            active={location.pathname === '/admin/orders'}
                            className={`text-white d-flex align-items-center py-2 px-3 ${location.pathname === '/admin/orders' ? 'bg-success' : ''}`}
                            style={{ borderRadius: '8px' }}
                        > Quản lý Đơn Hàng
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <hr className="text-secondary" />

                <div className="mt-auto">
                    <Button
                        variant="outline-danger"
                        className="w-100 d-flex align-items-center justify-content-center py-2"
                        onClick={handleLogoutClick}
                        style={{ borderRadius: '8px' }}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                    </Button>
                </div>
            </div>

            <div className="flex-grow-1" style={{ marginLeft: '260px', padding: '30px' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;