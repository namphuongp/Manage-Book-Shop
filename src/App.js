import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import BookList from './pages/clients/BookList';
import BookDetail from './pages/clients/BookDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/clients/Cart';
import Checkout from './pages/clients/Checkout';
import OrderSuccess from './pages/clients/OrderSuccess';
import OrderHistory from './pages/clients/OrderHistory';
import NavbarComponent from './components/NavbarComponent';
import Favorite from './pages/clients/Favorite';
import AdminLayout from './components/AdminLayout';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import Dashboard from './components/dashboard'
import useTheme from './hooks/useTheme';
function App() {
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // lấy số lượng sản phẩm trong giỏ
  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:9999/carts?userId=${userId}`);
      if (res.data.length > 0) {
        const total = res.data[0].items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch (err) { console.error("Lỗi lấy giỏ hàng"); }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') fetchCartCount(currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setCartCount(0);
  };

  return (
    <Router>
      <Routes>
        {currentUser?.role === 'admin' ? (
          <Route element={<AdminLayout user={currentUser} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />}>
            <Route path="/admin/orders" element={<AdminOrders user={currentUser} />} />
            <Route path="/admin/books" element={<AdminProducts />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/admin/orders" />} />
          </Route>
        ) : (
          <Route element={
            <>
              <NavbarComponent user={currentUser} onLogout={handleLogout} cartCount={cartCount} theme={theme} onToggleTheme={toggleTheme} />
              <div style={{ paddingTop: '80px' }}>
                <Outlet />
              </div>
            </>
          }>
            <Route path="/" element={<BookList user={currentUser} fetchCartCount={fetchCartCount} />} />
            <Route path="/book/:id" element={<BookDetail user={currentUser} fetchCartCount={fetchCartCount} />} />
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login onLoginSuccess={setCurrentUser} />} />
            <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />
            <Route path="/cart" element={<Cart user={currentUser} fetchCartCount={fetchCartCount} />} />
            <Route path="/checkout" element={<Checkout user={currentUser} fetchCartCount={fetchCartCount} />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<OrderHistory user={currentUser} />} />
            <Route path="/favorites" element={<Favorite user={currentUser} />} /> 
            <Route path="/admin/orders" element={<Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
}

export default App;
