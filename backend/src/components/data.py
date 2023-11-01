from pymongo import MongoClient

from pymongo import MongoClient


def get_collection_names():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    collection_names = db.list_collection_names()
    return collection_names


def load_data(collection_name, page, per_page):
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db[collection_name]

    skip = (page - 1) * per_page
    tweets = list(twitter_collection.find({"referenced_tweets": {"$exists": False}}).skip(skip).limit(per_page))


    # Combina los campos de sentimiento en un solo campo llamado 'sentiment'
    for tweet in tweets:
        positive_sentiment = tweet.get('sentiment', {}).get('positive', 0)
        negative_sentiment = tweet.get('sentiment', {}).get('negative', 0)

        # Calcula el valor de 'sentiment' como la diferencia entre 'positive_sentiment' y 'negative_sentiment'
        sentiment_value = round(positive_sentiment - negative_sentiment, 2)
        tweet['sentiment'] = sentiment_value

    return tweets