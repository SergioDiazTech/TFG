from pymongo import MongoClient  # Biblioteca que nos permite conectarnos a mongoDB
import json
import os
from datetime import datetime

import pandas as pd
from geopy.geocoders import ArcGIS

DATA_FOLDER = ('/Users/sergio/Desktop/TFG/backend/')

MONGO_URI = 'mongodb://127.0.0.1'  # Direccion donde esta el servidor de MongoDB

geolocator = ArcGIS()

def procesamiento_geoparsing(tweet):
    address = tweet.get('location')
    if address:
        latitude, longitude = geolocate(address)
        tweet['latitude'] = latitude
        tweet['longitude'] = longitude
    else:
        tweet['latitude'] = None
        tweet['longitude'] = None
    return tweet

def geolocate(location):
    try:
        location = geolocator.geocode(location)
        if location is not None:
            return location.latitude, location.longitude
    except Exception as e:
        print(f'Error: {e}')
    return None, None

def calculate_sentiment(tweets):
    # Combina los campos de sentimiento en un solo campo llamado 'sentiment'
    for tweet in tweets:
        positive_sentiment = tweet.get('sentiment', {}).get('positive', 0)
        negative_sentiment = tweet.get('sentiment', {}).get('negative', 0)

        # Calcula el valor de 'sentiment' como la diferencia entre 'positive_sentiment' y 'negative_sentiment'
        sentiment_value = round(positive_sentiment - negative_sentiment, 2)
        tweet['sentiment'] = sentiment_value

def save_json_to_mongodb(filename):
    DATA_FILEPATH = os.path.join(DATA_FOLDER, filename)
    with open(DATA_FILEPATH, 'r', encoding='utf-8') as file:
        data = json.load(file)

    os.remove(DATA_FILEPATH)
    
    if filename.endswith(".json"):  # Comprobamos si el archivo es un json
        new_count = 0
        client = MongoClient(MONGO_URI)
        db = client['DB_External_Data_Ingestion']
        collection_name = filename.replace('.json', '')
        dataset_collection = db[collection_name]

        if filename == "Colombia.json":
            for tweet in data:
                tweet = procesamiento_geoparsing(tweet)
                tweet['_id'] = tweet['_id']['$oid']
                if dataset_collection.find_one({'_id': tweet['_id']}) is None:
                    dataset_collection.insert_one(tweet)
                    new_count += 1
                    print(f"Tweet ID: {tweet['_id']} - Nuevo tweet añadido con latitud: {tweet['latitude']} y longitud: {tweet['longitude']}")

        elif filename == "tweets_prueba.json":
            calculate_sentiment(data)
            for tweet in data:
                tweet['_id'] = tweet['_id']['$oid']
                if dataset_collection.find_one({'_id': tweet['_id']}) is None:
                    dataset_collection.insert_one(tweet)
                    new_count += 1
                    print(f"Tweet ID: {tweet['_id']} - Nuevo tweet añadido con sentimiento: {tweet['sentiment']}")

        else:
            for tweet in data:
                if dataset_collection.find_one({'id': tweet['id']}) is None:
                    dataset_collection.insert_one(tweet)
                    new_count += 1
                    print(new_count)

        # Registro de la ingesta
        registro_collection = db["Ingestion_Registry"]
        documento_registro = {
            'Name': collection_name,
            'Filename': filename,
            'Date': datetime.now().strftime('%Y-%m-%d'),
            'Time': datetime.now().strftime('%H:%M:%S'),
            'Documents': dataset_collection.count_documents({}),
        }
        registro_collection.insert_one(documento_registro)
        print(documento_registro)
        print(f"Total documents: {dataset_collection.count_documents({})}")
        print(f"New documents added: {new_count}")
