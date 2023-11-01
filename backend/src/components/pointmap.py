from pymongo import MongoClient
import pandas as pd
from geopy.geocoders import ArcGIS
import random

def load_data():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db["users_colombia21.json"]

    data = list(twitter_collection.find({}))[:5]

    map_data = pd.DataFrame(data)

    # Creamos un objeto de geolocalización
    geolocator = ArcGIS()

    # Convertimos la ubicación en latitud y longitud
    def geolocate(location, index, total):
        try:
            location = geolocator.geocode(location)
            if location is not None:
                print(f'Latitud: {location.latitude}, Longitud: {location.longitude}, Coordenada {index+1}/{total} procesada')
                return location.latitude, location.longitude
        except Exception as e:
            print(f'Error: {e}')
        return None, None  # Devuelve None en caso de error

    total = len(map_data)
    map_data['latitude'], map_data['longitude'] = zip(*[geolocate(loc, index, total) for index, loc in enumerate(map_data['location'])])

    # Eliminamos los valores NaN de las filas en latitude y longitude
    map_data = map_data.dropna(subset=['latitude', 'longitude'])

    map_data['Compound'] = [random.uniform(-1, 1) for _ in range(len(map_data))]

    for index, row in map_data.iterrows():
        print(f'Latitud: {row["latitude"]}, Longitud: {row["longitude"]}, Compound: {row["Compound"]}')

    return map_data


def draw_pointmap():
    map_data = load_data()

    lon = map_data['longitude'].tolist()
    lat = map_data['latitude'].tolist()
    comp = map_data['Compound'].tolist()

    data = {
        'longitude': lon,
        'latitude': lat,
        'Compound': comp
    }

    return data
