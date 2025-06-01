import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { youtubeAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Sentiment = () => {
  const [sentimentData, setSentimentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentimentData();
  }, []);

  const fetchSentimentData = async () => {
    try {
      const response = await youtubeAPI.getSentiment();
      setSentimentData(response.data.sentiment_stats);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (!sentimentData.length) return <div>Chưa có dữ liệu cảm xúc.</div>;

  // Chuẩn bị dữ liệu cho biểu đồ Bar
  const barChartData = {
    labels: sentimentData.map((item, index) => `Video ${index + 1}`),
    datasets: [
      {
        label: 'Tích cực (%)',
        data: sentimentData.map(item => item.positive_pct || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Tiêu cực (%)',
        data: sentimentData.map(item => item.negative_pct || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Trung tính (%)',
        data: sentimentData.map(item => item.neutral_pct || 0),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Tính tổng cảm xúc cho Pie chart
  const totalPositive = sentimentData.reduce((sum, item) => sum + (item.positive_pct || 0), 0);
  const totalNegative = sentimentData.reduce((sum, item) => sum + (item.negative_pct || 0), 0);
  const totalNeutral = sentimentData.reduce((sum, item) => sum + (item.neutral_pct || 0), 0);

  const pieChartData = {
    labels: ['Tích cực', 'Tiêu cực', 'Trung tính'],
    datasets: [
      {
        data: [totalPositive, totalNegative, totalNeutral],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Phân tích cảm xúc bình luận',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div>
      <h2>Phân tích cảm xúc</h2>
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5>Phân bố cảm xúc theo từng video</h5>
            </Card.Header>
            <Card.Body>
              <Bar data={barChartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header>
              <h5>Tổng quan cảm xúc</h5>
            </Card.Header>
            <Card.Body>
              <Pie data={pieChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bảng chi tiết */}
      <Card className="mt-4">
        <Card.Header>
          <h5>Chi tiết phân tích cảm xúc</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Video ID</th>
                  <th>Tích cực (%)</th>
                  <th>Tiêu cực (%)</th>
                  <th>Trung tính (%)</th>
                  <th>Tổng bình luận</th>
                </tr>
              </thead>
              <tbody>
                {sentimentData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.video_id}</td>
                    <td className="text-success">{item.positive_pct || 0}%</td>
                    <td className="text-danger">{item.negative_pct || 0}%</td>
                    <td className="text-secondary">{item.neutral_pct || 0}%</td>
                    <td>{item.total_comments || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Sentiment;
