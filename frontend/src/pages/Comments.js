import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  Pagination,
  Modal,
  Button,
} from "react-bootstrap";
import { youtubeAPI } from "../services/api";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const commentsPerPage = 20;

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    // Filter comments based on search term and sentiment
    let filtered = comments.filter(
      (comment) =>
        comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sentimentFilter !== "all") {
      filtered = filtered.filter(
        (comment) => comment.sentiment === sentimentFilter
      );
    }

    setFilteredComments(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, sentimentFilter, comments]);

  const fetchComments = async () => {
    try {
      const response = await youtubeAPI.getComments();
      setComments(response.data.comments);
      setFilteredComments(response.data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentBadge = (sentiment) => {
    const variants = {
      positive: "success",
      negative: "danger",
      neutral: "secondary",
    };
    const labels = {
      positive: "Tích cực",
      negative: "Tiêu cực",
      neutral: "Trung tính",
    };
    return <Badge bg={variants[sentiment]}>{labels[sentiment]}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Pagination logic
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  // Sentiment statistics
  const sentimentStats = {
    positive: comments.filter((c) => c.sentiment === "positive").length,
    negative: comments.filter((c) => c.sentiment === "negative").length,
    neutral: comments.filter((c) => c.sentiment === "neutral").length,
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Video ID", "Tác giả", "Nội dung", "Cảm xúc", "Ngày đăng"];
    const csvContent = [
      headers.join(","),
      ...filteredComments.map((comment) =>
        [
          comment.video_id,
          `"${comment.author.replace(/"/g, '""')}"`,
          `"${comment.text.replace(/"/g, '""')}"`,
          comment.sentiment,
          formatDate(comment.date),
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
      `comments_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (comment) => {
    setSelectedComment(comment);
    setShowModal(true);
  };

  if (loading) return <div className="text-center">Đang tải...</div>;
  if (!comments.length)
    return <div className="text-center">Chưa có dữ liệu bình luận.</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Bình luận</h2>
        <div>
          <Button variant="success" className="me-2" onClick={handleExportCSV}>
            <i className="fas fa-file-export me-2"></i>
            Xuất CSV
          </Button>
          <Badge bg="primary" className="fs-6">
            Tổng: {filteredComments.length} bình luận
          </Badge>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="text-center border-success">
            <Card.Body>
              <h4 className="text-success">{sentimentStats.positive}</h4>
              <small>Tích cực</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-danger">
            <Card.Body>
              <h4 className="text-danger">{sentimentStats.negative}</h4>
              <small>Tiêu cực</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-secondary">
            <Card.Body>
              <h4 className="text-secondary">{sentimentStats.neutral}</h4>
              <small>Trung tính</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="text-center border-primary">
            <Card.Body>
              <h4 className="text-primary">{comments.length}</h4>
              <small>Tổng cộng</small>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <div className="row">
            <div className="col-md-8">
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm bình luận hoặc tác giả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
            <div className="col-md-4">
              <Form.Select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
              >
                <option value="all">Tất cả cảm xúc</option>
                <option value="positive">Tích cực</option>
                <option value="negative">Tiêu cực</option>
                <option value="neutral">Trung tính</option>
              </Form.Select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Comments Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Chi tiết bình luận</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table striped hover className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: "100px" }}>Video ID</th>
                  <th style={{ width: "150px" }}>Tác giả</th>
                  <th>Nội dung</th>
                  <th style={{ width: "120px" }}>Cảm xúc</th>
                  <th style={{ width: "120px" }}>Ngày đăng</th>
                </tr>
              </thead>
              <tbody>
                {currentComments.map((comment, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(comment)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <code className="text-primary">{comment.video_id}</code>
                    </td>
                    <td>
                      <strong>{comment.author}</strong>
                    </td>
                    <td>
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "400px" }}
                        title={comment.text}
                      >
                        {comment.text}
                      </div>
                    </td>
                    <td>{getSentimentBadge(comment.sentiment)}</td>
                    <td>
                      <Badge bg="secondary">{formatDate(comment.date)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === currentPage ||
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Pagination.Item>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <Pagination.Ellipsis key={page} />;
              }
              return null;
            })}

            <Pagination.Next
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* Comment Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComment && (
            <div>
              <h4>Nội dung bình luận</h4>
              <p className="text-muted">{selectedComment.text}</p>

              <div className="mt-4">
                <p>
                  <strong>Tác giả:</strong> {selectedComment.author}
                </p>
                <p>
                  <strong>Video ID:</strong>{" "}
                  <code>{selectedComment.video_id}</code>
                </p>
                <p>
                  <strong>Cảm xúc:</strong>{" "}
                  {getSentimentBadge(selectedComment.sentiment)}
                </p>
                <p>
                  <strong>Ngày đăng:</strong> {formatDate(selectedComment.date)}
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

export default Comments;
