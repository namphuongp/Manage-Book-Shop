import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Spinner, Image, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function AdminProducts() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('default'); 

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        categoryId: '1',
        price: '',
        stock: '',
        image: '',
        publisher: '',
        pages: '',
        description: ''
    });

    const API_URL = 'http://localhost:9999';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [booksRes, catRes] = await Promise.all([
                axios.get(`${API_URL}/books`),
                axios.get(`${API_URL}/categories`)
            ]);
            setBooks(booksRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu sản phẩm', err);
        } finally {
            setLoading(false);
        }
    };

    // Mở modal thêm mới
    const handleShowAddModal = () => {
        setIsEditing(false);
        setFormData({
            title: '',
            author: '',
            categoryId: categories[0]?.id || '1',
            price: '',
            stock: '',
            image: '',
            publisher: '',
            pages: '',
            description: ''
        });
        setShowModal(true);
    };

    // Mở modal chỉnh sửa
    const handleShowEditModal = (book) => {
        setIsEditing(true);
        setCurrentBookId(book.id);
        setFormData({
            title: book.title,
            author: book.author,
            categoryId: book.categoryId,
            price: book.price,
            stock: book.stock,
            image: book.image,
            publisher: book.publisher || '',
            pages: book.pages || '',
            description: book.description || ''
        });
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Lưu sản phẩm
    const handleSubmit = async (e) => {
        e.preventDefault();

        const priceNum = Number(formData.price);
        const stockNum = Number(formData.stock);
        const pagesNum = Number(formData.pages);

        if (priceNum < 0) {
            alert('Giá bán không được phép nhỏ hơn 0!');
            return;
        }
        if (stockNum < 0) {
            alert('Số lượng tồn kho không được phép nhỏ hơn 0!');
            return;
        }
        if (pagesNum < 0) {
            alert('Số trang không được phép nhỏ hơn 0!');
            return;
        }

        try {
            let newId = "1";
            if (!isEditing && books.length > 0) {
                const maxId = Math.max(...books.map(b => Number(b.id) || 0));
                newId = String(maxId + 1);
            }
            const payload = {
                ...(isEditing ? {} : { id: newId }),
                ...formData,
                price: priceNum,
                stock: stockNum,
                pages: pagesNum,
                rating: isEditing ? books.find(b => b.id === currentBookId)?.rating || 5 : 5,
                soldCount: isEditing ? books.find(b => b.id === currentBookId)?.soldCount || 0 : 0,
                is_deleted: false
            };

            if (isEditing) {
                await axios.put(`${API_URL}/books/${currentBookId}`, payload);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await axios.post(`${API_URL}/books`, payload);
                alert('Thêm sản phẩm thành công!');
            }

            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi lưu sản phẩm!');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await axios.patch(`${API_URL}/books/${id}`, { is_deleted: true });
            setBooks(books.map(book => book.id === id ? { ...book, is_deleted: true } : book));
        } catch (err) {
            alert('Xóa sản phẩm thất bại!');
        }
    };

    // Lấy tên danh mục theo ID
    const getCategoryName = (catId) => {
        const cat = categories.find(c => c.id === String(catId));
        return cat ? cat.name : 'Khác';
    };

    const handleSortPriceClick = () => {
        if (sortOrder === 'default') setSortOrder('asc');
        else if (sortOrder === 'asc') setSortOrder('desc');
        else setSortOrder('default');
    };

    // Lọc sách và sắp xếp theo giá
    const filteredBooks = books.filter(book => 
        !book.is_deleted && 
        (book.title.toLowerCase().includes(search.toLowerCase()) ||
         book.author.toLowerCase().includes(search.toLowerCase()))
    ).sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        if (sortOrder === 'desc') return b.price - a.price;
        return 0;
    });

    if (loading) return <Container className="text-center my-5"><Spinner animation="border" style={{ color: '#7fad39' }} /></Container>;

    return (
        <Container fluid className="px-0">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Quản lý Sản Phẩm</h2>
                <Button variant="success" onClick={handleShowAddModal} style={{ backgroundColor: '#7fad39', border: 'none' }}>
                    <i className="bi bi-plus-lg me-2"></i> Thêm sách mới
                </Button>
            </div>

            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <Card.Body className="p-3">
                    <Form.Control
                        type="text"
                        placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ maxWidth: '400px' }}
                    />
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="bg-body-tertiary">
                        <tr>
                            <th className="py-3">ID</th>
                            <th className="py-3 ps-4">Ảnh</th>
                            <th className="py-3">Tên sách</th>
                            <th className="py-3">Tác giả</th>
                            <th className="py-3">Danh mục</th>
                            <th 
                                className="py-3"  
                                role="button" 
                                onClick={handleSortPriceClick}
                                title="Click để sắp xếp theo giá"
                            >
                                Giá bán{' '}
                                {sortOrder === 'asc' && <i className="bi bi-arrow-up text-success-emphasis fw-bold"></i>}
                                {sortOrder === 'desc' && <i className="bi bi-arrow-down text-success-emphasis fw-bold"></i>}
                                {sortOrder === 'default' && <i className="bi bi-arrow-down-up text-muted small"></i>}
                            </th>
                            <th className="py-3">Tồn kho</th>
                            <th className="py-3 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">Không tìm thấy sản phẩm nào.</td>
                            </tr>
                        ) : (
                            filteredBooks.map((book) => (
                                <tr key={book.id}>
                                    <td className="fw-bold" style={{ width: '20px' }}>{book.id}</td>
                                    <td className="ps-4 py-3" style={{ width: '80px' }}>
                                        <Image src={book.image} alt={book.title} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px' }} />
                                    </td>
                                    <td className="fw-bold" style={{ maxWidth: '250px' }}>
                                        <div className="text-truncate">{book.title}</div>
                                    </td>
                                    <td>{book.author}</td>
                                    <td>{getCategoryName(book.categoryId)}</td>
                                    <td className="text-danger-emphasis fw-bold">{book.price.toLocaleString()}đ</td>
                                    <td>{book.stock}</td>
                                    <td className="text-center">
                                        <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleShowEditModal(book)} title="Sửa">
                                            <i className="bi bi-pencil-square"></i>
                                        </Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(book.id)} title="Xóa">
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>

            {/* Modal Thêm / Sửa Sách */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">{isEditing ? 'Chỉnh sửa thông tin sách' : 'Thêm sách mới'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Tên sách <span className="text-danger-emphasis">*</span></Form.Label>
                                    <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Nhập tên sách" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Tác giả <span className="text-danger-emphasis">*</span></Form.Label>
                                    <Form.Control type="text" name="author" value={formData.author} onChange={handleChange} required placeholder="Nhập tên tác giả" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Danh mục <span className="text-danger-emphasis">*</span></Form.Label>
                                    <Form.Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Giá bán (đ) <span className="text-danger-emphasis">*</span></Form.Label>
                                    <Form.Control type="number" min="0" name="price" value={formData.price} onChange={handleChange} required placeholder="Ví dụ: 89000" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Số lượng tồn kho <span className="text-danger-emphasis">*</span></Form.Label>
                                    <Form.Control type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} required placeholder="Ví dụ: 100" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Số trang</Form.Label>
                                    <Form.Control type="number" min="0" name="pages" value={formData.pages} onChange={handleChange} placeholder="Ví dụ: 250" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Đường dẫn ảnh (URL) <span className="text-danger-emphasis">*</span></Form.Label>
                                    <Form.Control type="text" name="image" value={formData.image} onChange={handleChange} required placeholder="Ví dụ: /images/nha-gia-kim.webp" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Nhà xuất bản</Form.Label>
                                    <Form.Control type="text" name="publisher" value={formData.publisher} onChange={handleChange} placeholder="Ví dụ: NXB Trẻ" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Mô tả sản phẩm</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Nhập tóm tắt mô tả sách..." />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                        <Button type="submit" variant="success" style={{ backgroundColor: '#7fad39', border: 'none' }}>
                            {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default AdminProducts;