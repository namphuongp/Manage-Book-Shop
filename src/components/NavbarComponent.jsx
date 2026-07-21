import React from 'react';
import { Navbar, Container, Nav, Button, Badge, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function NavbarComponent({ user, onLogout, cartCount }) {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm " fixed="top">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold text-success">Nova Library</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                {/* Icon Giỏ hàng */}
                <Nav.Link as={Link} to="/cart" className="position-relative me-3">
                  <i className="bi bi-cart3 fs-4"></i>
                  {cartCount > 0 && (
                    <Badge
                      pill
                      bg="danger"
                      className="position-absolute"
                      style={{
                        top: '2px',      
                        right: '2px',    
                        fontSize: '0.65rem', 
                        padding: '0.35em 0.5em' 
                      }}
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Nav.Link>

                {/* Dropdown Profile */}
                <div className="d-flex align-items-center me-3">

                  <NavDropdown
                    title={<i className="bi bi-person-circle fs-4"></i>}
                    id="profile-dropdown"
                    align="end"
                  >
                    <NavDropdown.Item as={Link} to="/profile">
                      <i className="bi bi-person me-2"></i> Thông tin cá nhân
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/orders">
                      <i className="bi bi-list-check me-2"></i> Lịch sử đặt hàng
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={onLogout} className="text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                    </NavDropdown.Item>
                  </NavDropdown>
                  <span className="me-2">Xin chào, <strong>{user.fullName}</strong></span>
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;