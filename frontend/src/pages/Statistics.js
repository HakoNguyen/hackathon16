import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Form,
  Row,
  Col,
  Modal,
  Button,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { youtubeAPI } from "../services/api";

const Statistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("viewCount");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedStat, setSelectedStat] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await youtubeAPI.getStatistics();
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return parseInt(num).toLocaleString("vi-VN");
  };

  const sortedStatistics = [...statistics].sort((a, b) => {
    const aVal = parseInt(a[sortBy]) || 0;
    const bVal = parseInt(b[sortBy]) || 0;
    return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
  });

  // Calculate totals
  const totals = statistics.reduce(
    (acc, stat) => {
      acc.totalViews += parseInt(stat.viewCount) || 0;
      acc.totalLikes += parseInt(stat.likeCount) || 0;
      acc.totalComments += parseInt(stat.commentCount) || 0;
      return acc;
    },
    { totalViews: 0, totalLikes: 0, totalComments: 0 }
  );

  // Prepare chart data for top 10 videos
  const top10Videos = sortedStatistics.slice(0, 10);
  const chartData = {
    labels: top10Videos.map((stat) =>
      stat.title.length > 30 ? stat.title.substring(0, 30) + "..." : stat.title
    ),
    datasets: [
      {
        label: "Lượt xem",
        data: top10Videos.map((stat) => parseInt(stat.viewCount) || 0),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Lượt thích",
        data: top10Videos.map((stat) => parseInt(stat.likeCount) || 0),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Top 10 Video - Lượt xem và Lượt thích",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Video ID",
      "Kênh",
      "Tiêu đề",
      "Lượt xem",
      "Lượt thích",
      "Bình luận",
      "Ngày đăng",
    ];
    const csvContent = [
      headers.join(","),
      ...sortedStatistics.map((stat) =>
        [
          stat.video_id,
          `"${stat.channel_title.replace(/"/g, '""')}"`,
          `"${stat.title.replace(/"/g, '""')}"`,
          formatNumber(stat.viewCount),
          formatNumber(stat.likeCount),
          formatNumber(stat.commentCount),
          new Date(stat.date).toLocaleDateString("vi-VN"),
        ].join(",")
      ),
    ].join("\n");

    // Add BOM for UTF-8
    const BOM = "\uFEFF";
    const csvContentWithBOM = BOM + csvContent;

    // Create and download file
    const blob = new Blob([csvContentWithBOM], {
      type: "text/csv;charset=utf-8",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `statistics_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (stat) => {
    setSelectedStat(stat);
    setShowModal(true);
  };

  if (loading) return <div className="text-center">Đang tải...</div>;
  if (!statistics.length)
    return <div className="text-center">Chưa có dữ liệu thống kê.</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Thống kê Video</h2>
        <div>
          <Button variant="success" className="me-2" onClick={handleExportCSV}>
            <i className="fas fa-file-export me-2"></i>
            Xuất CSV
          </Button>
          <Badge bg="primary" className="fs-6">
            Tổng: {statistics.length} video
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-primary">
            <Card.Body>
              <h4 className="text-primary">
                {formatNumber(totals.totalViews)}
              </h4>
              <small>Tổng lượt xem</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body>
              <h4 className="text-success">
                {formatNumber(totals.totalLikes)}
              </h4>
              <small>Tổng lượt thích</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-info">
            <Card.Body>
              <h4 className="text-info">
                {formatNumber(totals.totalComments)}
              </h4>
              <small>Tổng bình luận</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Biểu đồ thống kê</h5>
        </Card.Header>
        <Card.Body>
          <Bar data={chartData} options={chartOptions} />
        </Card.Body>
      </Card>

      {/* Sort Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sắp xếp theo:</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="viewCount">Lượt xem</option>
                  <option value="likeCount">Lượt thích</option>
                  <option value="commentCount">Bình luận</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Thứ tự:</Form.Label>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistics Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Chi tiết thống kê</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th style={{ width: "100px" }}>Video ID</th>
                  <th style={{ width: "150px" }}>Kênh</th>
                  <th>Tiêu đề</th>
                  <th style={{ width: "120px" }}>Lượt xem</th>
                  <th style={{ width: "120px" }}>Lượt thích</th>
                  <th style={{ width: "120px" }}>Bình luận</th>
                  <th style={{ width: "120px" }}>Ngày đăng</th>
                </tr>
              </thead>
              <tbody>
                {sortedStatistics.map((stat, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(stat)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <Badge bg="secondary">{index + 1}</Badge>
                    </td>
                    <td>
                      <code className="text-primary">{stat.video_id}</code>
                    </td>
                    <td>
                      <strong>{stat.channel_title}</strong>
                    </td>
                    <td>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "300px" }}
                        title={stat.title}
                      >
                        {stat.title}
                      </div>
                    </td>
                    <td>
                      <Badge bg="primary">{formatNumber(stat.viewCount)}</Badge>
                    </td>
                    <td>
                      <Badge bg="success">{formatNumber(stat.likeCount)}</Badge>
                    </td>
                    <td>
                      <Badge bg="info">{formatNumber(stat.commentCount)}</Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(stat.date).toLocaleDateString("vi-VN")}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Statistics Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết thống kê video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStat && (
            <div>
              <h4>{selectedStat.title}</h4>
              <p className="text-muted">
                <strong>Kênh:</strong> {selectedStat.channel_title}
              </p>

              <div className="mt-4">
                <Row>
                  <Col md={4}>
                    <Card className="text-center border-primary">
                      <Card.Body>
                        <h4 className="text-primary">
                          {formatNumber(selectedStat.viewCount)}
                        </h4>
                        <small>Lượt xem</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center border-success">
                      <Card.Body>
                        <h4 className="text-success">
                          {formatNumber(selectedStat.likeCount)}
                        </h4>
                        <small>Lượt thích</small>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="text-center border-info">
                      <Card.Body>
                        <h4 className="text-info">
                          {formatNumber(selectedStat.commentCount)}
                        </h4>
                        <small>Bình luận</small>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <div className="mt-4">
                  <p>
                    <strong>Video ID:</strong>{" "}
                    <code>{selectedStat.video_id}</code>
                  </p>
                  <p>
                    <strong>Ngày đăng:</strong>{" "}
                    {new Date(selectedStat.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Statistics;
