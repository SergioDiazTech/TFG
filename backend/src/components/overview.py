from pymongo import MongoClient


def load_information():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db['tweets_colombia']

    total_tweets = twitter_collection.count_documents({})

    positive_tweets = twitter_collection.count_documents({'sentiment': {'$gt': 0}})
    negative_tweets = twitter_collection.count_documents({'sentiment': {'$lt': 0}})

    top_tweets = list(twitter_collection.find({"referenced_tweets": {"$exists": False}}, 
                                              {'text': 1, 'public_metrics.retweet_count': 1})
                      .sort([('public_metrics.retweet_count', -1)]).limit(3))

    return total_tweets, positive_tweets, negative_tweets, top_tweets

def load_sentiment_over_time():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db['tweets_colombia']

    pipeline = [
        {
            "$project": {
                "dateHour": {
                    "$dateToString": { "format": "%Y-%m-%dT%H", "date": { "$toDate": "$created_at" } }
                },
                "sentiment": 1
            }
        },
        {
            "$group": {
                "_id": "$dateHour",
                "average_sentiment": { "$avg": "$sentiment" }
            }
        },
        { "$sort": { "_id": 1 } }
    ]

    sentiment_over_time = list(twitter_collection.aggregate(pipeline))

    return sentiment_over_time


