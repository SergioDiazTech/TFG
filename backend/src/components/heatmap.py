from pymongo import MongoClient
import pandas as pd
import random

def draw_heatmap():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db["test_33.json"]

    # Obtenemos todos los documentos de la collection
    data = list(twitter_collection.find({}, {'latitude': 1, 'longitude': 1, '_id': 0}))

    # Creamos un dataframe a partir de los datos que hemos obtenido
    map_data = pd.DataFrame(data)

    # Eliminamos las filas que tienen NaN en 'latitude' o 'longitude'
    map_data.dropna(subset=['latitude', 'longitude'], inplace=True)

    map_data['compound'] = [random.uniform(-1, 1) for _ in range(len(map_data))]

    data_formatted = []
    for index, row in map_data.iterrows():
        # Creamos un diccionario para cada fila con los valores de 'latitude', 'longitude', y 'compound'
        row_data = {
            'latitude': row['latitude'],
            'longitude': row['longitude'],
            'compound': row['compound']
        }
        # Añadimos este diccionario a la lista de datos formateados
        data_formatted.append(row_data)


    return data_formatted

