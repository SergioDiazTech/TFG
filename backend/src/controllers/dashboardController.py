from pymongo import MongoClient


def load_information():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db['tweets_colombia']

    total_tweets = twitter_collection.count_documents({})

    positive_tweets = twitter_collection.count_documents({
        'sentiment': {'$gt': 0},
        'referenced_tweets': {'$exists': False}
    })
    
    negative_tweets = twitter_collection.count_documents({
    'sentiment': {'$lt': 0},
    'referenced_tweets': {'$exists': False}
})



    # Query to fetch the top 3 most retweeted positive tweets that are not replies
    top_positive_retweeted_tweets = list(twitter_collection.aggregate([
        # Filter for positive sentiment tweets that are not replies
        {"$match": {"sentiment": {"$gt": 0}, "referenced_tweets": {"$exists": False}}},

        # Sort by retweet count in descending order
        {"$sort": {"public_metrics.retweet_count": -1}},

        # Limit to the top 3 documents to reduce processing
        {"$limit": 3},

        # Lookup the corresponding user in 'users_colombia' collection using 'author_id'
        {"$lookup": {
            "from": "users_colombia",
            "localField": "author_id",
            "foreignField": "id",
            "as": "user_info"
        }},

        # Extract the first element from the resulting user info array
        {"$addFields": {"user_info": {"$arrayElemAt": ["$user_info", 0]}}},

        # Project required fields including the username as 'user_of_tweet'
        {"$project": {
            "text": 1,
            "public_metrics.retweet_count": 1,
            "sentiment": 1,
            "user_of_tweet": "$user_info.username"
        }}
    ]))


    top_negative_retweeted_tweets = list(twitter_collection.aggregate([
        {"$match": {"sentiment": {"$lt": 0}, "referenced_tweets": {"$exists": False}}},
        {"$sort": {"public_metrics.retweet_count": -1}},
        {"$limit": 3},
        {"$lookup": {
            "from": "users_colombia",
            "localField": "author_id",
            "foreignField": "id",
            "as": "user_info"
        }},
        {"$addFields": {
            "user_info": {"$arrayElemAt": ["$user_info", 0]}
        }},
        {"$project": {
            "text": 1,
            "public_metrics.retweet_count": 1,
            "sentiment": 1,
            "user_of_tweet": "$user_info.username"
        }}
    ]))


    return total_tweets, positive_tweets, negative_tweets, top_positive_retweeted_tweets, top_negative_retweeted_tweets


def load_sentiment_over_time():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db['tweets_colombia']

    pipeline_general = [
    {"$match": {"referenced_tweets": {"$exists": False}}},
    {
        "$project": {
            "dateHour": {
                "$dateToString": {"format": "%Y-%m-%dT%H", "date": {"$toDate": "$created_at"}}
            },
            "sentiment": 1
        }
    },
    {
        "$group": {
            "_id": "$dateHour",
            "average_sentiment": {"$avg": "$sentiment"},
            "tweet_count": {"$sum": 1}
        }
    },
    {"$sort": {"_id": 1}}
    ]


    pipeline_positive = [
    {"$match": {"sentiment": {"$gt": 0}, "referenced_tweets": {"$exists": False}}},
    {
        "$project": {
            "dateHour": {
                "$dateToString": {"format": "%Y-%m-%dT%H", "date": {"$toDate": "$created_at"}}
            },
            "sentiment": 1
        }
    },
    {
        "$group": {
            "_id": "$dateHour",
            "average_sentiment": {"$avg": "$sentiment"},
            "tweet_count": {"$sum": 1}
        }
    },
    {"$sort": {"_id": 1}}
    ]


    pipeline_negative = [
    {"$match": {"sentiment": {"$lt": 0}, "referenced_tweets": {"$exists": False}}},
    {
        "$project": {
            "dateHour": {
                "$dateToString": {"format": "%Y-%m-%dT%H", "date": {"$toDate": "$created_at"}}
            },
            "sentiment": 1
        }
    },
    {
        "$group": {
            "_id": "$dateHour",
            "average_sentiment": {"$avg": "$sentiment"},
            "tweet_count": {"$sum": 1}
        }
    },
    {"$sort": {"_id": 1}}
    ]


    sentiment_over_time_general = list(twitter_collection.aggregate(pipeline_general))
    sentiment_over_time_positive = list(twitter_collection.aggregate(pipeline_positive))
    sentiment_over_time_negative = list(twitter_collection.aggregate(pipeline_negative))

    return sentiment_over_time_general, sentiment_over_time_positive, sentiment_over_time_negative