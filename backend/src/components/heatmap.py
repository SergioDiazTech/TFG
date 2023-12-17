from pymongo import MongoClient
import numpy as np

def draw_heatmap():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']

    twitter_collection_name = "tweets_colombia"
    twitter_collection = db[twitter_collection_name]

    pipeline = [
        {
            "$match": {"latitude": {"$exists": True, "$ne": None}, "longitude": {"$exists": True, "$ne": None}}
        },
        {
            "$group": {
                "_id": {"latitude": "$latitude", "longitude": "$longitude"},
                "sentiment": {"$avg": "$sentiment"}
            }
        },
        {
            "$project": {
                "latitude": "$_id.latitude", 
                "longitude": "$_id.longitude", 
                "_id": 0,
                "sentiment": 1
            }
        }
    ]

    data = list(twitter_collection.aggregate(pipeline))

    
    global_sentiment_mean = round(np.mean([item['sentiment'] for item in data]), 2)

    
    for item in data:
        
        item['sentiment'] = (item['sentiment'] + 1) / 2

    min_sentiment = min(item['sentiment'] for item in data)
    max_sentiment = max(item['sentiment'] for item in data)
    percentiles = np.percentile([item['sentiment'] for item in data], [25, 50, 75])

    registry_document = db['Ingestion_Registry'].find_one({"CollectionName": twitter_collection_name})
    collection_display_name = registry_document['Name'] if registry_document else 'Default Name'


    response = {
        'data': data,
        'minSentiment': min_sentiment,
        'maxSentiment': max_sentiment,
        'percentiles': percentiles.tolist(),
        'collectionName': collection_display_name,
        'globalSentiment': global_sentiment_mean
    }

    print(response)

    return response
