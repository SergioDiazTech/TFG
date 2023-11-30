from pymongo import MongoClient

def load_information():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db['tweets_colombia']

    total_tweets = twitter_collection.count_documents({})

    positive_tweets = twitter_collection.count_documents({'sentiment': {'$gt': 0}})
    negative_tweets = twitter_collection.count_documents({'sentiment': {'$lt': 0}})


    print("Número total de tweets:", total_tweets)

    return total_tweets, positive_tweets, negative_tweets