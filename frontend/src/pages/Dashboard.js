import React, { useState, useEffect } from "react";
import { Row, Col, Card, Alert } from "react-bootstrap";
import { youtubeAPI } from "../services/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await youtubeAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <h3>Đang tải dữ liệu...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Lỗi kết nối</Alert.Heading>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          Vui lòng đảm bảo rằng:
          <ul>
            <li>Máy chủ backend đang chạy trên cổng 8008</li>
            <li>Bạn có kết nối internet ổn định</li>
            <li>Thử làm mới trang nếu vấn đề vẫn tiếp tục</li>
          </ul>
        </p>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert variant="info" className="m-3">
        <Alert.Heading>Chưa có dữ liệu</Alert.Heading>
        <p>
          Chưa có dữ liệu để hiển thị. Vui lòng thu thập dữ liệu trước bằng cách
          sử dụng form tìm kiếm ở trên.
        </p>
      </Alert>
    );
  }

  const { overview, top_videos, sentiment_distribution } = dashboardData;

  return (
    <div className="p-3">
      <h2 className="mb-4">Dashboard - Tổng quan</h2>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng số video</Card.Title>
              <h3 className="text-primary">{overview.total_videos}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng bình luận</Card.Title>
              <h3 className="text-success">{overview.total_comments}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng lượt xem</Card.Title>
              <h3 className="text-info">
                {overview.total_views.toLocaleString()}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng lượt thích</Card.Title>
              <h3 className="text-warning">
                {overview.total_likes.toLocaleString()}
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Videos */}
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Top 5 video có nhiều lượt xem nhất</h5>
            </Card.Header>
            <Card.Body>
              {top_videos.map((video, index) => (
                <div key={index} className="border-bottom py-2">
                  <strong>{video.title}</strong>
                  <br />
                  <small className="text-muted">
                    {video.channel_title} •{" "}
                    {parseInt(video.viewCount).toLocaleString()} lượt xem
                  </small>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Phân bố cảm xúc</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <span className="text-success">
                  Tích cực: {sentiment_distribution.positive}
                </span>
              </div>
              <div className="mb-2">
                <span className="text-danger">
                  Tiêu cực: {sentiment_distribution.negative}
                </span>
              </div>
              <div>
                <span className="text-secondary">
                  Trung tính: {sentiment_distribution.neutral}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
