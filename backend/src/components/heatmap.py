from pymongo import MongoClient
import numpy as np

def draw_heatmap(min_lat=None, max_lat=None, min_lng=None, max_lng=None):
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']

    twitter_collection_name = "tweets_colombia"
    twitter_collection = db[twitter_collection_name]

    match_stage = {"latitude": {"$exists": True, "$ne": None}, "longitude": {"$exists": True, "$ne": None}}
    # Aplicar filtro si se proporcionan los parámetros de latitud y longitud
    if min_lat is not None and max_lat is not None and min_lng is not None and max_lng is not None:
        match_stage.update({
            "latitude": {"$gte": min_lat, "$lte": max_lat},
            "longitude": {"$gte": min_lng, "$lte": max_lng}
        })

    pipeline = [
        {"$match": match_stage},
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

    coordinate_groups = len(data)


    global_sentiment_mean = round(np.mean([item['sentiment'] for item in data]), 2) if data else 0


    for item in data:
        item['sentiment'] = (item['sentiment'] + 1) / 2


    min_sentiment = min(item['sentiment'] for item in data) if data else 0
    max_sentiment = max(item['sentiment'] for item in data) if data else 0
    percentiles = np.percentile([item['sentiment'] for item in data], [25, 50, 75]) if data else [0, 0, 0]


    registry_document = db['Ingestion_Registry'].find_one({"CollectionName": twitter_collection_name})
    collection_display_name = registry_document['Name'] if registry_document else 'Default Name'

    response = {
        'data': data,
        'coordinateGroups': coordinate_groups,
        'minSentiment': min_sentiment,
        'maxSentiment': max_sentiment,
        'percentiles': percentiles.tolist(),
        'collectionName': collection_display_name,
        'globalSentiment': global_sentiment_mean
    }

    print(response)

    return response
