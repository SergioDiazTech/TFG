from pymongo import MongoClient
from datetime import datetime
from geopy.geocoders import ArcGIS, Nominatim
from geopy.exc import GeocoderTimedOut
from collections import Counter
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize

import time
import json
import os
import spacy
import re
import nltk

nltk.download('punkt')
nltk.download('stopwords')

DATA_FOLDER = '/Users/sergio/Desktop/TFG/backend/'
MONGO_URI = 'mongodb://127.0.0.1'

geolocator_arcgis = ArcGIS()
geolocator_nominatim = Nominatim(user_agent="myGeocoder")

# Cargar el modelo de lenguaje de spaCy
nlp = spacy.load('es_core_news_sm')

STOPWORDS = set(stopwords.words('spanish'))

KNOWN_LOCATIONS = set([
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta",
    "Bucaramanga", "Pereira", "Santa Marta", "Manizales", "Villavicencio",
    "Armenia", "Ibagué", "Pasto", "Neiva", "Montería", "Popayán", "Valledupar",
    "Tunja", "Riohacha", "Florencia", "Sincelejo", "Quibdó", "Mocoa", 
    "San Andrés", "Yopal", "Inírida", "Puerto Carreño", "Leticia", 
    "San José del Guaviare", "Casanare", "Arauca", "Girardot", "Turbo", 
    "Rionegro", "Apartadó", "Soledad", "Malambo", "Magangué", "Sogamoso", 
    "Duitama", "Zipaquirá", "Facatativá", "Chía", "Fusagasugá", "Cajicá", 
    "Chocontá", "Mosquera", "Madrid", "Funza", "La Dorada", "Honda", 
    "Arjona", "El Carmen de Bolívar", "El Banco", "Maicao", "Fonseca", 
    "Ciénaga", "La Jagua de Ibirico", "Aguachica", "Ocaña", "Pamplona", 
    "Tumaco", "Ipiales", "Tuluá", "Palmira", "Jamundí", "Yumbo", "Buga", 
    "Buenaventura", "Cartago", "Floridablanca", "Girón", "Piedecuesta", 
    "Barrancabermeja", "San Gil", "Socorro", "Lorica", "Sahagún", "Cereté",
    "Planeta Rica", "Tierralta", "Chiquinquirá", "Garzón", "Pitalito", 
    "La Plata", "Puerto Boyacá", "Guateque", "El Espinal", "Mariquita", 
    "Líbano", "Saldaña", "El Guamo", "Chaparral", "Purificación", 
    "San Vicente del Caguán", "La Montañita", "El Doncello", "Puerto Asís", 
    "Orito", "Puerto Leguízamo", "Puerto Nariño", "Aipe", "Algeciras", 
    "Barbosa", "Betania", "Betulia", "Caldas", "Carmen de Viboral", 
    "Copacabana", "Dabeiba", "El Retiro", "Envigado", "Fredonia", "Frontino", 
    "Giraldo", "Guarne", "La Ceja", "La Estrella", "La Pintada", "Marinilla", 
    "Mutatá", "Rionegro", "Sabaneta", "Salgar", "Santa Bárbara", "Santa Fe de Antioquia", 
    "Sonsón", "Titiribí", "Yalí", "Yarumal", "Yolombó", "Zaragoza"
])


def clean_text(text):
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = re.sub(r'http\S+|www.\S+', '', text)
    return text

def extract_location(text):
    cleaned_text = clean_text(text)
    doc = nlp(cleaned_text)
    
    locations = [ent.text for ent in doc.ents if ent.label_ == 'LOC']
    
    potential_locations = []
    for token in doc:
        if token.text.lower() not in STOPWORDS:
            if token.pos_ in ['PROPN', 'ADJ'] and token.ent_type_ == 'LOC':
                potential_locations.append(token.text)
    
    sentences = sent_tokenize(cleaned_text)
    co_occurrence_locations = []
    for sentence in sentences:
        words = word_tokenize(sentence)
        for word in words:
            if word in KNOWN_LOCATIONS:
                co_occurrence_locations.append(word)
    
    all_locations = locations + potential_locations + co_occurrence_locations
    
    location_counts = Counter(all_locations)
    if location_counts:
        most_common_location = location_counts.most_common(1)[0][0]
        return most_common_location
    else:
        return ' '.join(locations)

def geolocate(location, retries=3):
    for attempt in range(retries):
        try:
            location_arcgis = geolocator_arcgis.geocode(location)
            if location_arcgis:
                return location_arcgis.latitude, location_arcgis.longitude
        except GeocoderTimedOut:
            print(f"ArcGIS geocode timeout, retrying {attempt + 1}/{retries}")
        except Exception as e:
            print(f'ArcGIS Error: {e}')

        try:
            location_nominatim = geolocator_nominatim.geocode(location)
            if location_nominatim:
                return location_nominatim.latitude, location_nominatim.longitude
        except GeocoderTimedOut:
            print(f"Nominatim geocode timeout, retrying {attempt + 1}/{retries}")
        except Exception as e:
            print(f'Nominatim Error: {e}')

    return None, None

def calculate_sentiment(tweets):
    for tweet in tweets:
        positive_sentiment = tweet.get('sentiment', {}).get('positive', 0)
        negative_sentiment = tweet.get('sentiment', {}).get('negative', 0)
        sentiment_value = round(positive_sentiment - negative_sentiment, 2)
        tweet['sentiment'] = sentiment_value

def calculate_hate_speech_score(tweets):
    for tweet in tweets:
        hate_speech_data = tweet.get('hate_speech', {})
        hate = hate_speech_data.get('hate', 0)
        non_hate = hate_speech_data.get('non_hate', 0) * -1

        tweet['hate_speech'] = hate + non_hate

def normalize_source(tweets):
    for tweet in tweets:
        source = tweet.get('source', '')
        if source not in ['Twitter for Android', 'Twitter for iPhone']:
            tweet['source'] = 'Other Source'


def load_last_processed_id():
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    state_collection = db['State']
    state_document = state_collection.find_one({'name': 'last_processed_id'})
    if state_document:
        return state_document['value']
    return None

def save_last_processed_id(last_id):
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    state_collection = db['State']
    state_collection.update_one(
        {'name': 'last_processed_id'},
        {'$set': {'value': last_id}},
        upsert=True
    )

def format_time(seconds):
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    return f"{int(hours)}h {int(minutes)}m {int(seconds)}s"

def procesamiento_geoparsing(tweet):
    address = tweet.get('location')
    if address:
        latitude, longitude = geolocate(address)
        if latitude is not None and longitude is not None:
            tweet['latitude'] = latitude
            tweet['longitude'] = longitude
            tweet['location'] = address
        else:
            tweet['latitude'] = None
            tweet['longitude'] = None
            tweet.pop('location', None)


def save_json_to_mongodb(filename, custom_name):
    DATA_FILEPATH = os.path.join(DATA_FOLDER, filename)
    with open(DATA_FILEPATH, 'r', encoding='utf-8') as file:
        data = json.load(file)

    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']

    if filename == "geolocation.json":
        dataset_collection = db['geolocation']
        for document in data:
            text = document.get('text', '')
            location_name = extract_location(text)
            latitude, longitude = geolocate(location_name)
            
            document['location_name'] = location_name
            document['latitude'] = latitude
            document['longitude'] = longitude

            document['_id'] = document['_id']['$oid']
            if dataset_collection.find_one({'_id': document['_id']}) is None:
                dataset_collection.insert_one(document)
                print(f"Document ID: {document['_id']} - Nuevo documento añadido con latitud: {document['latitude']} y longitud: {document['longitude']}")
    
    elif filename == "tweets_colombia21.json":
        dataset_collection = db['tweets_colombia']
        calculate_sentiment(data)
        calculate_hate_speech_score(data)
        normalize_source(data)
        for tweet in data:

            tweet.pop('election', None)
            tweet.pop('attachments', None)
            tweet.pop('lang', None)
            tweet.pop('reply_settings', None)
            tweet.pop('context_annotations', None)


            tweet['_id'] = tweet['_id']['$oid']
            if dataset_collection.find_one({'_id': tweet['_id']}) is None:
                dataset_collection.insert_one(tweet)
                print(f"Tweet ID: {tweet['_id']} - Nuevo tweet añadido con sentimiento: {tweet['sentiment']}")

    elif filename == "users_colombia21.json":
        dataset_collection = db['users_colombia']
        tweets_collection = db['tweets_colombia']

        last_processed_id = load_last_processed_id()

        start_time = time.time()
        processed_count = 0

        try:
            for user in data:
                if last_processed_id and user['_id']['$oid'] <= last_processed_id:
                    continue

                user = procesamiento_geoparsing(user)

                user.pop('profile_image_url', None)
                user.pop('url', None)
                user.pop('protected', None)

                user['_id'] = user['_id']['$oid']
                if dataset_collection.find_one({'_id': user['_id']}) is None:
                    dataset_collection.insert_one(user)
                    print(f"User ID: {user['_id']} - Nuevo usuario añadido con latitud: {user['latitude']} y longitud: {user['longitude']}")

                tweets_to_update = tweets_collection.find({
                    'author_id': user['id'], 
                    'referenced_tweets': {'$exists': False}
                })

                for tweet in tweets_to_update:
                    update_fields = {
                        'latitude': user['latitude'], 
                        'longitude': user['longitude']
                    }
                    if 'location' in user:
                        update_fields['location'] = user['location']

                    tweets_collection.update_one(
                        {'_id': tweet['_id']},
                        {'$set': update_fields}
                    )
                    updated_tweet = tweets_collection.find_one({'_id': tweet['_id']})
                    print(updated_tweet)

                save_last_processed_id(user['_id'])
                processed_count += 1
                print(f"Procesados {processed_count} usuarios hasta ahora.")

        except KeyboardInterrupt:
            print("Interrupción por el usuario (CTRL+C). Guardando estado actual...")

        finally:
            end_time = time.time()
            elapsed_time = end_time - start_time
            print(f"Tiempo total de ejecución: {format_time(elapsed_time)}")
            print(f"Total de documentos procesados: {processed_count}")

            
    os.remove(DATA_FILEPATH)

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
