from pymongo import MongoClient #Biblioteca que nos permite conectarnos a mongoDB
import json
import os
from datetime import datetime

import pandas as pd
from geopy.geocoders import ArcGIS

DATA_FOLDER = ('/Users/sergio/Desktop/TFG/backend/')

MONGO_URI = 'mongodb://127.0.0.1'#Direccion donde esta el servidor de MongoDB , 
#a partir del protocolo mongodb, va a conectarse al localhost (127.0.0.1)

def save_json_to_mongodb(filename):

    DATA_FILEPATH = os.path.join(DATA_FOLDER, filename)

    with open(DATA_FILEPATH, 'r', encoding='utf-8') as file:
        data = json.load(file)

    os.remove(DATA_FILEPATH)
    
    if filename.endswith(".json"): # Comprobamos si el archivo que vamos a guardar en bbdd es un fichero json
        
        new_count = 0

        #Una vez se conecte, nos devolverá un objeto llamado client
        client = MongoClient(MONGO_URI)
        
        if filename == "tweets_colombia21.json" or filename == "users_colombia21.json" or filename == "test_33.json":
            
            db = client['DB_External_Data_Ingestion']
            collection_name = filename
            dataset_collection = db[collection_name]

            for tweet in data:
                tweet['_id'] = tweet['_id']['$oid']

                latitude, longitude = None, None
                
                address = tweet.get('location')

                if address:
                    latitude, longitude = geolocate(address)
                    tweet['latitude'] = latitude
                    tweet['longitude'] = longitude
                else:
                    tweet['latitude'] = None
                    tweet['longitude'] = None

                # Ahora verifica si el tweet ya existe y si no, insértalo en la base de datos
                if dataset_collection.find_one({'_id': tweet['_id']}) is None:
                    dataset_collection.insert_one(tweet)
                    new_count += 1
                    print(f"Tweet ID: {tweet['_id']} - Nuevo tweet añadido con latitud: {latitude} y longitud: {longitude}")
        else:

            db = client['DB_External_Data_Ingestion']
            collection_name = filename
            dataset_collection = db[collection_name]

            for tweet in data:
                if dataset_collection.find_one({'id': tweet['id']}) is None: # Insertar documentos(tweets) en la collection si no existen
                    dataset_collection.insert_one(tweet)
                    new_count  += 1
                    print(new_count)
            


        registro_collection = db["Ingestion_Registry"]

        documento_registro = {
            'Name': filename,
            'Date': datetime.now().strftime('%Y-%m-%d'),
            'Time': datetime.now().strftime('%H:%M:%S'),
            'Documents': dataset_collection.count_documents({}),
        }

        registro_collection.insert_one(documento_registro)


        print(documento_registro)
        print(f"Total documents: {dataset_collection.count_documents({})}")
        print(f"New documents added: {new_count}")
        

geolocator = ArcGIS()


def geolocate(location):
        try:
            location = geolocator.geocode(location)
            if location is not None:
                return location.latitude, location.longitude
        except Exception as e:
            print(f'Error: {e}')
        return None, None