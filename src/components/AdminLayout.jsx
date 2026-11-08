import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

function AdminLayout({ user, onLogout, theme, onToggleTheme }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoutClick = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <div className="d-flex bg-body" style={{ minHeight: '100vh' }}>
            <div
                className="d-flex flex-column flex-shrink-0 p-3 text-body bg-body-tertiary border-end"
                style={{ width: '260px', position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 1030 }}
            >
                <Link
                    to="/admin/orders"
                    className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-body text-decoration-none px-2 py-2"
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
                            className={`d-flex align-items-center py-2 px-3 text-center ${location.pathname === '/admin/books' ? 'bg-success text-white' : 'text-body'}`}
                            style={{ borderRadius: '8px' }}
                        >Quản lý Sản Phẩm
                        </Nav.Link>
                    </Nav.Item>

                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/admin/orders"
                            active={location.pathname === '/admin/orders'}
                            className={`d-flex align-items-center py-2 px-3 ${location.pathname === '/admin/orders' ? 'bg-success text-white' : 'text-body'}`}
                            style={{ borderRadius: '8px' }}
                        > Quản lý Đơn Hàng
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            as={Link}
                            to="/admin/dashboard"
                            active={location.pathname === '/admin/dashboard'}
                            className={`d-flex align-items-center py-2 px-3 ${location.pathname === '/admin/dashboard' ? 'bg-success text-white' : 'text-body'}`}
                            style={{ borderRadius: '8px' }}
                        > Báo cáo
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <hr className="text-secondary" />

                <div className="mt-auto">
                    <ThemeToggle theme={theme} onToggle={onToggleTheme} className="w-100 mb-2" />
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
