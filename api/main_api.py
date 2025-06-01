from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os
from datetime import datetime
import uvicorn

# Import YouTube extractor
from youtube_extractor import YouTubeDataExtractor

app = FastAPI(title="YouTube Analytics API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SearchRequest(BaseModel):
    keyword: str
    max_results: Optional[int] = 30
    max_comments: Optional[int] = 5
    region_code: Optional[str] = "US"

class AnalyticsResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None

# Global storage for extracted data
current_data = {
    "videos": [],
    "comments": [],
    "statistics": [],
    "sentiment_stats": []
}

@app.get("/")
async def root():
    return {"message": "YouTube Analytics API"}

@app.post("/api/extract", response_model=AnalyticsResponse)
async def extract_youtube_data(request: SearchRequest):
    """Thu thập dữ liệu YouTube theo từ khóa"""
    try:
        extractor = YouTubeDataExtractor()
        
        # Thu thập dữ liệu
        data = extractor.extract_complete_data(
            keyword=request.keyword,
            max_results=request.max_results,
            max_comments=request.max_comments
        )
        
        # Tính toán sentiment statistics
        sentiment_stats = []
        if data['comments']:
            sentiment_df = extractor.calculate_sentiment_statistics(data['comments'])
            if not sentiment_df.empty:
                sentiment_stats = sentiment_df.to_dict('records')
        
        # Lưu vào global storage
        global current_data
        current_data = {
            "videos": data['processed_videos'],
            "comments": data['comments'],
            "statistics": data['statistics'],
            "sentiment_stats": sentiment_stats
        }
        
        return AnalyticsResponse(
            status="success",
            message=f"Đã thu thập {len(data['processed_videos'])} video và {len(data['comments'])} bình luận",
            data={
                "video_count": len(data['processed_videos']),
                "comment_count": len(data['comments']),
                "stats_count": len(data['statistics'])
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard")
async def get_dashboard_data():
    """Lấy dữ liệu tổng quan cho dashboard"""
    try:
        global current_data
        
        # Tính toán các metrics tổng quan
        total_videos = len(current_data["videos"])
        total_comments = len(current_data["comments"])
        total_views = sum(int(stat.get('viewCount', 0)) for stat in current_data["statistics"])
        total_likes = sum(int(stat.get('likeCount', 0)) for stat in current_data["statistics"])
        
        # Top 5 video có nhiều view nhất
        top_videos = sorted(
            current_data["statistics"], 
            key=lambda x: int(x.get('viewCount', 0)), 
            reverse=True
        )[:5]
        
        # Phân bố cảm xúc tổng thể
        sentiment_distribution = {"positive": 0, "negative": 0, "neutral": 0}
        for comment in current_data["comments"]:
            sentiment = comment.get('sentiment', 'neutral')
            sentiment_distribution[sentiment] += 1
        
        return {
            "overview": {
                "total_videos": total_videos,
                "total_comments": total_comments,
                "total_views": total_views,
                "total_likes": total_likes
            },
            "top_videos": top_videos,
            "sentiment_distribution": sentiment_distribution,
            "recent_comments": current_data["comments"][:10]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/videos")
async def get_videos():
    """Lấy danh sách video"""
    return {"videos": current_data["videos"]}

@app.get("/api/comments")
async def get_comments():
    """Lấy danh sách bình luận"""
    return {"comments": current_data["comments"]}

@app.get("/api/statistics")
async def get_statistics():
    """Lấy thống kê video"""
    return {"statistics": current_data["statistics"]}

@app.get("/api/sentiment")
async def get_sentiment_analysis():
    """Lấy phân tích cảm xúc"""
    return {"sentiment_stats": current_data["sentiment_stats"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8008)
