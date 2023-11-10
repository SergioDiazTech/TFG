from pymongo import MongoClient
import json
import os
from datetime import datetime

from geopy.geocoders import ArcGIS

DATA_FOLDER = '/Users/sergio/Desktop/TFG/backend/'
MONGO_URI = 'mongodb://127.0.0.1'

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
        if location:
            return location.latitude, location.longitude
    except Exception as e:
        print(f'Error: {e}')
    return None, None

def calculate_sentiment(tweets):
    for tweet in tweets:
        positive_sentiment = tweet.get('sentiment', {}).get('positive', 0)
        negative_sentiment = tweet.get('sentiment', {}).get('negative', 0)
        sentiment_value = round(positive_sentiment - negative_sentiment, 2)
        tweet['sentiment'] = sentiment_value

def save_json_to_mongodb(filename, custom_name):
    DATA_FILEPATH = os.path.join(DATA_FOLDER, filename)
    with open(DATA_FILEPATH, 'r', encoding='utf-8') as file:
        data = json.load(file)

    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    
    if filename == "tweets_colombia21.json":
        dataset_collection = db['tweets_colombia']
        calculate_sentiment(data)
        for tweet in data:
            tweet['_id'] = tweet['_id']['$oid']
            if dataset_collection.find_one({'_id': tweet['_id']}) is None:
                dataset_collection.insert_one(tweet)
                print(f"Tweet ID: {tweet['_id']} - Nuevo tweet añadido con sentimiento: {tweet['sentiment']}")

    elif filename == "users_colombia.json":
        dataset_collection = db['users_colombia']
        tweets_collection = db['tweets_colombia']
        for user in data:
            user = procesamiento_geoparsing(user)
            user['_id'] = user['_id']['$oid']
            if dataset_collection.find_one({'_id': user['_id']}) is None:
                dataset_collection.insert_one(user)
                print(f"User ID: {user['_id']} - Nuevo usuario añadido con latitud: {user['latitude']} y longitud: {user['longitude']}")

            # Actualiza las coordenadas en los tweets correspondientes
            tweets_to_update = tweets_collection.find({
                'author_id': user['id'], 
                'referenced_tweets': {'$exists': False}
            })

            for tweet in tweets_to_update:
                result = tweets_collection.update_one(
                    {'_id': tweet['_id']},
                    {'$set': {'latitude': user['latitude'], 'longitude': user['longitude']}}
                )
                # Si se realizó la actualización, imprimir el documento actualizado
                if result.modified_count > 0:
                    updated_tweet = tweets_collection.find_one({'_id': tweet['_id']})
                    print(updated_tweet)

    os.remove(DATA_FILEPATH)  # Elimina el archivo después de procesarlo

    # Registro de la ingesta
    registro_collection = db['Ingestion_Registry']
    documento_registro = {
        'Name': custom_name,
        'CollectionName': dataset_collection.name,
        'Filename': filename,
        'Date': datetime.now().strftime('%Y-%m-%d'),
        'Time': datetime.now().strftime('%H:%M:%S'),
        'Documents': dataset_collection.count_documents({})
    }
    registro_collection.insert_one(documento_registro)
    print(documento_registro)
    print(f"Total documents: {dataset_collection.count_documents({})}")
    #print(f"New documents added: {new_count}")
