import tweepy
from pymongo import MongoClient
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable
import os
import auth
import json
import time

# Importamos las claves de Twitter desde el archivo keysTwitter que se encuentra en el directorio Files
from Files.keysTwitter import consumerKey, consumerSecret, accessToken, accessTokenSecret


tweets_json = []

def load_tweets(page, per_page):
    # Conexión a MongoDB
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    twitter_collection = client['COLOMBIA']['tweets_colombia21.json']

    skip = (page - 1) * per_page
    tweets = list(twitter_collection.find({}).skip(skip).limit(per_page))

    return tweets




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


    # Autenticacion en la API de twitter
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
    db = client['TWITTER']
    twitter_collection = db[keyword]

    
    # Realizar la búsqueda de tweets
    tweets_encontrados = 0
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

                    twitter_collection.insert_one(tweet_data)
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
    
    print("Los tweets han sido guardados en la base de datos.")

    print(tweets_json)