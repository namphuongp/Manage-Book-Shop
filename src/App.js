import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import BookList from './pages/clients/BookList';
import Login from './pages/Login';
import Register from './pages/Register';
import NavbarComponent from './components/NavbarComponent';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  //lấy số lượng sản phẩm trong giỏ
  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:9999/carts?userId=${userId}`);
      if (res.data.length > 0) {
        // Tính tổng số lượng (quantity) của tất cả item
        const total = res.data[0].items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch (err) { console.error("Lỗi lấy giỏ hàng"); }
  };
  useEffect(() => {
    if (currentUser) fetchCartCount(currentUser.id);
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
  };

  return (
    <Router>
      <NavbarComponent user={currentUser} onLogout={handleLogout} cartCount={cartCount} />

      <Routes>
        {/* Ai cũng có thể vào trang chủ và trang chi tiết */}
        <Route path="/" element={<BookList user={currentUser} />} />

        {/* Trang Login/Register: Nếu đã login rồi thì chặn không cho vào lại */}
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login onLoginSuccess={setCurrentUser} />} />
        <Route path="/register" element={currentUser ? <Navigate to="/" /> : <Register />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;