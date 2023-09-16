import tweepy
from pymongo import MongoClient
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import os
import auth
import json
import time

# Importar las claves de Twitter desde otro archivo
from Files.keysTwitter import consumerKey, consumerSecret, accessToken, accessTokenSecret



tweets_json = []

def load_tweets():
    # Generamos y guardamos un archivo JSON con los tweets
    dir_path = os.path.dirname(os.path.realpath(__file__)) # Directorio del proyecto

    data_dir_path = os.path.join(dir_path, 'Data')

    if not os.path.exists(data_dir_path):
        os.makedirs(data_dir_path)
    
    # Leer tweets desde archivo JSON
    with open(os.path.join(dir_path, 'Data', 'data_01.json'), 'r') as file:
        tweets_json = json.load(file)
    
    return tweets_json


def wait_until_reset(api):
    """
    Pausa el script hasta que el límite de tasa de la API se restablezca.
    """
    reset_time = api.rate_limit_status()['resources']['statuses']['/statuses/user_timeline']['reset']
    sleep_time = reset_time - time.time()
    print(f'Esperando {sleep_time} segundos para volver a hacer la consulta...')
    time.sleep(sleep_time)


def get_tweets(keyword, numeroDeTweets):

    import nltk

    nltk.download('vader_lexicon')


    #Authentication
    auth = tweepy.OAuthHandler(consumerKey,consumerSecret)
    auth.set_access_token(accessToken,accessTokenSecret)
    api = tweepy.API(auth)

    user = api.verify_credentials()
    print("Autenticación exitosa. Bienvenido, @" + user.screen_name)
    print(keyword)
    print(numeroDeTweets)

    
    
    # Crea una instancia del geocodificador de OpenStreetMap
    geolocator = Nominatim(user_agent="my-app")

    # Conexión a MongoDB
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['BD_Twitter']
    tweets_collection = db['tweets']

    
    # Realizar la búsqueda de tweets
    tweets_encontrados = 0
    tweets_json = []
    tweet_ids = []

    while tweets_encontrados < numeroDeTweets:
        try:
            for tweet in tweepy.Cursor(api.search_tweets, q=keyword).items(numeroDeTweets):
                
                # Comprobar si el tweet ya ha sido encontrado
                if tweet.id in tweet_ids:
                    continue

                if not tweet.text.startswith('RT') and tweet.user.location is not None and tweet.user.location.strip() != "":
                    score = SentimentIntensityAnalyzer().polarity_scores(tweet.text)
                    comp = score['compound']
                             
                    MAX_ATTEMPTS = 5
                    attempt = 1
                    while attempt <= MAX_ATTEMPTS:
                        try:
                            # Intenta obtener las coordenadas de la ubicación del usuario
                            location = tweet.user.location
                            # Obtén las coordenadas de una ubicación específica
                            coordinates = geolocator.geocode(location, addressdetails=True)
                            break
                        except (GeocoderTimedOut, GeocoderUnavailable) as e:
                            # Si se produce una excepción de límite de peticiones alcanzadas, espera 60 segundos y vuelve a intentarlo
                            if attempt == MAX_ATTEMPTS:
                                coordinates = None
                                break
                            else:
                                print("Error: ", e)
                                print("Esperando 60 segundos antes de volver a intentarlo...")
                                time.sleep(60)
                                attempt += 1
                        except AttributeError as e:
                            # Si se produce una excepción de atributo erroneo, pasa al siguiente intento
                            print("Error: ", e)
                            print("Pasando al siguiente intento...")
                            time.sleep(60)
                            attempt += 1

                    if coordinates is not None:
                        longitude_str = coordinates.raw['lon']
                        latitude_str = coordinates.raw['lat']
                        longitude = float(longitude_str) if longitude_str is not None else None
                        latitude = float(latitude_str) if latitude_str is not None else None
                    else:
                        longitude = None
                        latitude = None

                    tweet_data = {
                        "id": tweet.id,
                        "Compound": comp,
                        "location": location,
                        "geo_enabled": tweet.user.geo_enabled,
                        "all_info": tweet._json,
                        "longitude": longitude,
                        "latitude": latitude
                    }

                    tweets_json.append(tweet_data)
                    tweet_ids.append(tweet.id)
                    print(tweet.id)
                    tweets_encontrados += 1

                    # Espera 5 segundos antes de continuar con la siguiente iteración
                    time.sleep(5)

            if tweets_encontrados >= numeroDeTweets:
                break
        except tweepy.TooManyRequests:
            wait_until_reset(api)
        except Exception as e:
            print("Error: ", e)
            print("Pasando al siguiente intento...")
            time.sleep(60)

    client.drop_database('DB_Twitter')

    dir_path = os.path.dirname(os.path.realpath(__file__)) # Directorio del proyecto

    data_dir_path = os.path.join(dir_path, 'Data')

    if not os.path.exists(data_dir_path):
        os.makedirs(data_dir_path)

    with open(os.path.join(dir_path, 'Data', 'data_01.json'), 'w') as file:
        json.dump(tweets_json, file)

    # Iterar a través de cada tweet y guardar en la base de datos
    for tweet in tweets_json:
        tweets_collection.insert_one(tweet)
    
    # Consultar los tweets de la base de datos y excluir el campo "_id"
    #tweets_cursor = tweets_collection.find({}, {"_id": 0}).limit(numeroDeTweets)

    # Convertir los tweets a una lista de diccionarios
    #tweets = [tweet for tweet in tweets_cursor]

    # Serializar los tweets a JSON
    #tweets_json = json.dumps(tweets)

    
    print("Los tweets han sido guardados en la base de datos.")

    print(tweets_json)


