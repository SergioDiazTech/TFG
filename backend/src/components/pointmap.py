from pymongo import MongoClient
import pandas as pd
import random

def draw_pointmap():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db["Colombia"]

    data = list(twitter_collection.find({}, {'latitude': 1, 'longitude': 1, '_id': 0}))

    map_data = pd.DataFrame(data)

    # Eliminamos los valores NaN de las filas en latitude y longitude
    map_data.dropna(subset=['latitude', 'longitude'], inplace=True)

    map_data['compound'] = [random.uniform(-1, 1) for _ in range(len(map_data))]

    data_formatted = []
    for index, row in map_data.iterrows():
        row_data = {
            'latitude': row['latitude'],
            'longitude': row['longitude'],
            'compound': row['compound']
        }
        data_formatted.append(row_data)

    return data_formatted