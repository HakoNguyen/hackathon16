import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { youtubeAPI } from '../services/api';

const SearchForm = () => {
  const [formData, setFormData] = useState({
    keyword: '',
    max_results: 30,
    max_comments: 5,
    region_code: 'US'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await youtubeAPI.extractData(formData);
      setMessage({
        type: 'success',
        text: response.data.message
      });
    } catch (error) {
      setMessage({
        type: 'danger',
        text: 'Lỗi khi thu thập dữ liệu: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light p-4 mb-4">
      <h4>Thu thập dữ liệu YouTube</h4>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Từ khóa</Form.Label>
              <Form.Control
                type="text"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                placeholder="VD: Python, SQL..."
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Số video</Form.Label>
              <Form.Control
                type="number"
                name="max_results"
                value={formData.max_results}
                onChange={handleChange}
                min="1"
                max="50"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Bình luận/video</Form.Label>
              <Form.Control
                type="number"
                name="max_comments"
                value={formData.max_comments}
                onChange={handleChange}
                min="1"
                max="20"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Vùng</Form.Label>
              <Form.Select
                name="region_code"
                value={formData.region_code}
                onChange={handleChange}
              >
                <option value="US">Hoa Kỳ</option>
                <option value="VN">Việt Nam</option>
                <option value="GB">Anh</option>
                <option value="JP">Nhật Bản</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3} className="d-flex align-items-end">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="w-100"
            >
              {loading ? 'Đang xử lý...' : 'Thu thập dữ liệu'}
            </Button>
          </Col>
        </Row>
      </Form>
      
      {message && (
        <Alert variant={message.type} className="mt-3">
          {message.text}
        </Alert>
      )}
    </div>
  );
};

export default SearchForm;
