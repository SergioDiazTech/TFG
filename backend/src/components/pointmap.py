from pymongo import MongoClient
import pandas as pd


def load_data():
    
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db["donald_trump.json"]

    data = list(twitter_collection.find({}))

    map_data = pd.DataFrame(data)
    map_data['Compound'] = map_data['Compound'].astype(float)

    # Eliminamos los valores NaN de las filas en latitude y longitude
    map_data = map_data.dropna(subset=['latitude', 'longitude'])

    #print(map_data)
    return map_data



def draw_pointmap():
    map_data = load_data()

    lon = map_data['longitude'].tolist()  # Convierte a lista
    lat = map_data['latitude'].tolist()  # Convierte a lista
    comp = map_data['Compound'].tolist()  # Convierte a lista

    data = {
        'longitude': lon,
        'latitude': lat,
        'Compound': comp  # Utiliza 'Compound' en lugar de 'compound'
    }
    #print(data)

    return data
