from pymongo import MongoClient
import pandas as pd

def draw_pointmap(min_lat=None, max_lat=None, min_lng=None, max_lng=None):
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']

    twitter_collection_name = "tweets_colombia"
    twitter_collection = db[twitter_collection_name]

    query = {"latitude": {"$exists": True, "$ne": None}, "longitude": {"$exists": True, "$ne": None}}
    if min_lat is not None and max_lat is not None and min_lng is not None and max_lng is not None:
        query['latitude'] = {"$gte": min_lat, "$lte": max_lat}
        query['longitude'] = {"$gte": min_lng, "$lte": max_lng}

    data = list(twitter_collection.find(
        query,
        {'latitude': 1, 'longitude': 1, 'sentiment': 1, 'text': 1, '_id': 0}
    ))

    total_tweets = twitter_collection.count_documents({})

    map_data = pd.DataFrame(data)

    # Asegúrate de que todas las columnas necesarias existen
    if 'latitude' in map_data.columns and 'longitude' in map_data.columns and 'sentiment' in map_data.columns:
        map_data.dropna(subset=['latitude', 'longitude', 'sentiment'], inplace=True)

        highest_sentiment_tweet = map_data.sort_values(by='sentiment', ascending=False).iloc[0]['text'] if not map_data.empty else 'N/A'

        data_formatted = map_data.to_dict('records')
    else:
        highest_sentiment_tweet = 'N/A'
        data_formatted = []

    registry_document = db['Ingestion_Registry'].find_one({"CollectionName": twitter_collection_name})
    collection_display_name = registry_document['Name'] if registry_document else 'Default Name'

    return {
        'data': data_formatted, 
        'collectionName': collection_display_name, 
        'totalTweets': total_tweets,
        'highestSentimentTweet': highest_sentiment_tweet
    }
