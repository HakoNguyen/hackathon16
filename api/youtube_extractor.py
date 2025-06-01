from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd
import json
import os
import time
from datetime import datetime
from dotenv import load_dotenv
from textblob import TextBlob

class YouTubeDataExtractor:
    def __init__(self, api_key=None):
        """
        Khởi tạo YouTube Data Extractor
    
        api_key (str): YouTube Data API key. Nếu None, sẽ load từ .env file
        """
        if api_key is None:
            load_dotenv()
            self.api_key = os.getenv("API_KEY")
        else:
            self.api_key = api_key
            
        self.youtube = build("youtube", "v3", developerKey=self.api_key)
        
    def search_by_keyword(self, keyword, region_code='US', max_results=30):
        """
        Tìm kiếm video theo từ khóa 
        """
        try:
            request = self.youtube.search().list(
                q=keyword,
                part='snippet',
                type='video',
                order='relevance',
                regionCode=region_code,
                maxResults=max_results
            )
            response = request.execute()
            videos = response.get('items', [])
            
            results = []
            for video in videos:
                channel_title = video['snippet']['channelTitle']
                video_id = video['id']['videoId']
                title = video['snippet']['title']
                description = video['snippet']['description']
                published_at = video['snippet']['publishedAt']
                
                results.append({
                    'channel_title': channel_title,
                    'video_id': video_id,
                    'title': title,
                    'description': description,
                    'published_at': published_at
                })
            return results
        except Exception as e:
            print(f"Lỗi khi tìm kiếm video: {e}")
            return []

    def get_comments(self, video_id, max_results=5):
        """
        Lấy bình luận của video 
        """
        try:
            request = self.youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                textFormat='plainText',
                maxResults=max_results,
                order='time'
            )
            response = request.execute()
            comments = response.get('items', [])
            
            comment_texts = []
            for comment in comments:
                text = comment['snippet']['topLevelComment']['snippet']['textDisplay']
                author = comment['snippet']['topLevelComment']['snippet']['authorDisplayName']
                published_at = comment['snippet']['topLevelComment']['snippet']['publishedAt']
                
                comment_texts.append({
                    'text': text,
                    'author': author,
                    'published_at': published_at
                })
            return comment_texts
        except HttpError as e:
            if e.resp.status == 403:
                print(f"Comments are disabled for video {video_id}. Skipping...")
                return []
            else:
                print(f"Lỗi khi lấy bình luận: {e}")
                return []

    def get_statistics(self, video_id):
        """
        Lấy thống kê của video 
        """
        try:
            request = self.youtube.videos().list(
                part='statistics',
                id=video_id
            )
            response = request.execute()
            items = response.get('items', [])
            
            if not items:
                return {}
                
            stats = items[0].get('statistics', {})
            return {
                'viewCount': stats.get('viewCount', '0'),
                'likeCount': stats.get('likeCount', '0'),
                'dislikeCount': stats.get('dislikeCount', '0'),
                'commentCount': stats.get('commentCount', '0')
            }
        except Exception as e:
            print(f"Lỗi khi lấy thống kê: {e}")
            return {}

    def analyze_sentiment(self, text):
        """
        Phân tích cảm xúc của văn bản (sentimentComment.ipynb)
        """
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            if polarity > 0.1:
                return 'positive'
            elif polarity < -0.1:
                return 'negative'
            else:
                return 'neutral'
        except:
            return 'neutral'

    def process_datetime(self, datetime_str):
        """
        Xử lý chuỗi datetime thành date và time riêng biệt (process_videos.ipynb)
        """
        try:
            dt = pd.to_datetime(datetime_str)
            return dt.date(), dt.time()
        except:
            return None, None

    def extract_complete_data(self, keyword='SQL', max_results=30, max_comments=5):
        """
        Thu thập dữ liệu hoàn chỉnh cho một từ khóa
        """
        print(f"Bắt đầu thu thập dữ liệu cho từ khóa: {keyword}")
        
        # Thu thập danh sách video
        videos = self.search_by_keyword(keyword, max_results=max_results)
        print(f"Tìm thấy {len(videos)} video")
        
        all_data = []
        processed_videos = []
        all_comments = []
        all_statistics = []
        
        for i, video in enumerate(videos):
            print(f"Xử lý video {i+1}/{len(videos)}: {video['title'][:50]}...")
            
            video_id = video['video_id']
            
            # Lấy bình luận
            comments = self.get_comments(video_id, max_comments)
            
            # Lấy thống kê
            stats = self.get_statistics(video_id)
            
            # Xử lý datetime
            date, time_val = self.process_datetime(video['published_at'])
            
            # Tạo dữ liệu video đầy đủ
            video_data = {
                'video_id': video_id,
                'channel_title': video['channel_title'],
                'title': video['title'],
                'description': video['description'],
                'published_at': video['published_at'],
                'date': str(date) if date else None,
                'time': str(time_val) if time_val else None,
                'comments': comments,
                'statistics': stats
            }
            all_data.append(video_data)
            
            # Tạo dữ liệu video đã xử lý (process_videos.ipynb)
            processed_video = {
                'video_id': video_id,
                'channel_title': video['channel_title'],
                'title': video['title'],
                'description': video['description'],
                'date': str(date) if date else None,
                'time': str(time_val) if time_val else None
            }
            processed_videos.append(processed_video)
            
            # Xử lý bình luận với phân tích cảm xúc (sentimentComment.ipynb)
            for comment in comments:
                comment_date, comment_time = self.process_datetime(comment['published_at'])
                sentiment = self.analyze_sentiment(comment['text'])
                
                comment_data = {
                    'video_id': video_id,
                    'text': comment['text'],
                    'author': comment['author'],
                    'published_at': comment['published_at'],
                    'date': str(comment_date) if comment_date else None,
                    'time': str(comment_time) if comment_time else None,
                    'sentiment': sentiment
                }
                all_comments.append(comment_data)
            
            # Xử lý thống kê (process_statistics.ipynb)
            if stats:
                stats_data = {
                    'video_id': video_id,
                    'channel_title': video['channel_title'],
                    'title': video['title'],
                    'viewCount': int(stats.get('viewCount', 0)),
                    'likeCount': int(stats.get('likeCount', 0)),
                    'commentCount': int(stats.get('commentCount', 0)),
                    'date': str(date) if date else None,
                    'time': str(time_val) if time_val else None
                }
                all_statistics.append(stats_data)
            
            # Nghỉ ngắn để tránh rate limit
            time.sleep(0.1)
        
        return {
            'raw_data': all_data,
            'processed_videos': processed_videos,
            'comments': all_comments,
            'statistics': all_statistics
        }

    def calculate_sentiment_statistics(self, comments_data):
        """
        Tính toán thống kê cảm xúc cho từng video (sentimentComment.ipynb)
        """
        if not comments_data:
            return pd.DataFrame()
            
        df_comments = pd.DataFrame(comments_data)
        
        # Tính toán phần trăm cảm xúc cho từng video
        sentiment_stats = df_comments.groupby('video_id')['sentiment'].value_counts(normalize=True).unstack(fill_value=0) * 100
        sentiment_stats = sentiment_stats.round(1)
        
        # Đếm tổng số bình luận cho từng video
        comment_counts = df_comments.groupby('video_id').size().reset_index(name='total_comments')
        
        # Merge với thống kê cảm xúc
        sentiment_stats = sentiment_stats.reset_index().merge(comment_counts, on='video_id')
        
        # Đổi tên cột
        column_mapping = {
            'negative': 'negative_pct',
            'neutral': 'neutral_pct', 
            'positive': 'positive_pct'
        }
        sentiment_stats = sentiment_stats.rename(columns=column_mapping)
        
        return sentiment_stats

    def save_data(self, data, keyword, output_dir='data'):
        """
        Lưu dữ liệu vào các file khác nhau
        """
        # Tạo thư mục nếu chưa tồn tại
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(f"{output_dir}/json_file", exist_ok=True)
        
        # Lưu dữ liệu raw dạng JSON
        json_filename = f"{keyword.replace(' ', '_')}_data.json"
        json_filepath = os.path.join(f"{output_dir}/json_file", json_filename)
        
        with open(json_filepath, 'w', encoding='utf-8') as f:
            json.dump(data['raw_data'], f, ensure_ascii=False, indent=4)
        
        # Lưu dữ liệu đã xử lý dạng CSV
        if data['processed_videos']:
            df_videos = pd.DataFrame(data['processed_videos'])
            df_videos.to_csv(f"{output_dir}/videos.csv", index=False)
        
        if data['comments']:
            df_comments = pd.DataFrame(data['comments'])
            df_comments.to_csv(f"{output_dir}/comments.csv", index=False)
            
            # Tính toán và lưu thống kê cảm xúc
            sentiment_stats = self.calculate_sentiment_statistics(data['comments'])
            if not sentiment_stats.empty:
                sentiment_stats.to_csv(f"{output_dir}/sentiment_stats.csv", index=False)
        
        if data['statistics']:
            df_statistics = pd.DataFrame(data['statistics'])
            df_statistics.to_csv(f"{output_dir}/statistics.csv", index=False)
        
        print(f"Dữ liệu đã được lưu vào thư mục: {output_dir}")
        return json_filepath

def main(keyword='aura phonkphonk', max_results=30, max_comments=5, api_key=None):
    """
    Hàm chính để chạy toàn bộ quy trình (từ api_extraction.ipynb)
    """
    try:
        # Khởi tạo extractor
        extractor = YouTubeDataExtractor(api_key)
        
        # Thu thập dữ liệu
        data = extractor.extract_complete_data(keyword, max_results, max_comments)
        
        # Lưu dữ liệu
        filepath = extractor.save_data(data, keyword)
        
        print(f"Hoàn thành! Dữ liệu chính được lưu tại: {filepath}")
        
        # In thống kê tổng quan
        print(f"\nThống kê tổng quan:")
        print(f"- Số video: {len(data['processed_videos'])}")
        print(f"- Số bình luận: {len(data['comments'])}")
        print(f"- Số video có thống kê: {len(data['statistics'])}")
        
        return data
        
    except Exception as e:
        print(f"Lỗi trong quá trình thực thi: {e}")
        return None

if __name__ == "__main__":
    # Chạy với từ khóa mặc định
    result = main()
