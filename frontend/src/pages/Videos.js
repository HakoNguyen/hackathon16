import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  Modal,
  Button,
} from "react-bootstrap";
import { youtubeAPI } from "../services/api";

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    // Filter videos based on search term
    const filtered = videos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channel_title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVideos(filtered);
  }, [searchTerm, videos]);

  const fetchVideos = async () => {
    try {
      const response = await youtubeAPI.getVideos();
      setVideos(response.data.videos);
      setFilteredVideos(response.data.videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = [
      "Video ID",
      "Kênh",
      "Tiêu đề",
      "Mô tả",
      "Ngày đăng",
      "Thời gian",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredVideos.map((video) =>
        [
          video.video_id,
          `"${video.channel_title.replace(/"/g, '""')}"`,
          `"${video.title.replace(/"/g, '""')}"`,
          `"${(video.description || "").replace(/"/g, '""')}"`,
          formatDate(video.date),
          formatTime(video.time),
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
      `videos_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (video) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  if (loading) return <div className="text-center">Đang tải...</div>;
  if (!videos.length)
    return <div className="text-center">Chưa có dữ liệu video.</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Danh sách Video</h2>
        <div>
          <Button variant="success" className="me-2" onClick={handleExportCSV}>
            <i className="fas fa-file-export me-2"></i>
            Xuất CSV
          </Button>
          <Badge bg="primary" className="fs-6">
            Tổng: {filteredVideos.length} video
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc kênh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Videos Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Chi tiết video</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "100px" }}>Video ID</th>
                  <th style={{ width: "200px" }}>Kênh</th>
                  <th>Tiêu đề</th>
                  <th style={{ width: "300px" }}>Mô tả</th>
                  <th style={{ width: "120px" }}>Ngày đăng</th>
                  <th style={{ width: "100px" }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(video)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <code className="text-primary">{video.video_id}</code>
                    </td>
                    <td>
                      <strong>{video.channel_title}</strong>
                    </td>
                    <td>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "300px" }}
                        title={video.title}
                      >
                        {video.title}
                      </div>
                    </td>
                    <td>
                      <div
                        className="text-truncate text-muted"
                        style={{ maxWidth: "250px" }}
                        title={video.description}
                      >
                        {video.description || "Không có mô tả"}
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{formatDate(video.date)}</Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatTime(video.time)}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Summary Stats */}
      <div className="mt-4">
        <div className="row">
          <div className="col-md-4">
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-primary">{filteredVideos.length}</h5>
                <small className="text-muted">Video được hiển thị</small>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-success">
                  {new Set(filteredVideos.map((v) => v.channel_title)).size}
                </h5>
                <small className="text-muted">Kênh khác nhau</small>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center">
              <Card.Body>
                <h5 className="text-info">
                  {
                    filteredVideos.filter(
                      (v) => v.description && v.description.length > 0
                    ).length
                  }
                </h5>
                <small className="text-muted">Video có mô tả</small>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      {/* Video Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVideo && (
            <div>
              <h4>{selectedVideo.title}</h4>
              <p className="text-muted">
                <strong>Kênh:</strong> {selectedVideo.channel_title}
              </p>
              <p>
                <strong>Video ID:</strong> <code>{selectedVideo.video_id}</code>
              </p>
              <p>
                <strong>Ngày đăng:</strong> {formatDate(selectedVideo.date)}
              </p>
              <p>
                <strong>Thời gian:</strong> {formatTime(selectedVideo.time)}
              </p>
              <div className="mt-3">
                <h5>Mô tả:</h5>
                <p className="text-muted">
                  {selectedVideo.description || "Không có mô tả"}
                </p>
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

export default Videos;
