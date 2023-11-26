from pymongo import MongoClient
import pandas as pd

def draw_heatmap():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']

    twitter_collection_name = "tweets_colombia"
    twitter_collection = db[twitter_collection_name]

    data = list(twitter_collection.find(
        {"latitude": {"$exists": True, "$ne": None}, "longitude": {"$exists": True, "$ne": None}},
        {'latitude': 1, 'longitude': 1, 'sentiment': 1, '_id': 0}
    ))

    map_data = pd.DataFrame(data)
    map_data.dropna(subset=['latitude', 'longitude', 'sentiment'], inplace=True)

    grouped_data = map_data.groupby(['latitude', 'longitude'])

    average_sentiment = grouped_data['sentiment'].mean()

    # Restablecemos el índice para convertir los datos agrupados en un DataFrame
    average_sentiment = average_sentiment.reset_index()

    print(average_sentiment)

    # Convertimos el DataFrame a una lista de diccionarios para el frontend
    data_formatted = average_sentiment.to_dict('records')


    registry_document = db['Ingestion_Registry'].find_one({"CollectionName": twitter_collection_name})
    collection_display_name = registry_document['Name'] if registry_document else 'Default Name'

    return {'data': data_formatted, 'collectionName': collection_display_name}
