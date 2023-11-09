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

    return tweets