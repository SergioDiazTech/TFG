from pymongo import MongoClient
import pandas as pd
import random

def draw_heatmap():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db["tweets_colombia"]

    # Obtenemos todos los documentos de la colección que tienen 'latitude', 'longitude' y 'sentiment'
    data = list(twitter_collection.find(
        {"latitude": {"$exists": True, "$ne": None}, "longitude": {"$exists": True, "$ne": None}},
        {'latitude': 1, 'longitude': 1, 'sentiment': 1, '_id': 0}
    ))

    # Creamos un DataFrame a partir de los datos que hemos obtenido
    map_data = pd.DataFrame(data)

    # Eliminamos las filas que tienen NaN en 'latitude', 'longitude' o 'sentiment'
    map_data.dropna(subset=['latitude', 'longitude', 'sentiment'], inplace=True)

    data_formatted = []
    for index, row in map_data.iterrows():
        # Creamos un diccionario para cada fila con los valores de 'latitude', 'longitude', y 'sentiment'
        row_data = {
            'latitude': row['latitude'],
            'longitude': row['longitude'],
            'sentiment': row['sentiment']
        }
        # Añadimos este diccionario a la lista de datos formateados
        data_formatted.append(row_data)


    return data_formatted

