from pymongo import MongoClient
import pandas as pd
import re
import numpy as np
import re

def draw_trendingtopics():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']

    twitter_collection_name = "tweets_colombia"
    twitter_collection = db[twitter_collection_name]

    query = {"referenced_tweets": {"$exists": False}, "sentiment": {"$exists": True}}
    projection = {"text": 1, "sentiment": 1, "_id": 0}
    texts = list(twitter_collection.find(query, projection))

    sentiment_values = [doc['sentiment'] for doc in texts if 'sentiment' in doc]
    positive_threshold = np.percentile(sentiment_values, 95)
    negative_threshold = np.percentile(sentiment_values, 5)

    print(f'Positive threshold (90th percentile): {positive_threshold}')
    print(f'Negative threshold (10th percentile): {negative_threshold}')

    positive_words_list = []
    negative_words_list = []
    hashtags_list = []

    excluded_words = ["a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "durante", 
                      "en", "entre", "hacia", "hasta", "mediante", "para", "por", "según", 
                      "sin", "so", "sobre", "tras", "versus", "vía", "que", "se", "es", "me", 
                      "una", "co", "y", "nos", "su", "del", "le", "t",  "https", "el", "pero", 
                      "lo", "le", "va", "al", "un", "los", "la", "como", "olla", "está", "este", 
                      "esto", "están", "esmad", "esta", "o", "cuado", "también", "mi","porque", "hay", "les", "ni", "las", "si", "no", "esos", "7"]

    positive_tweets_count = 0
    negative_tweets_count = 0

    for doc in texts:
        hashtags = re.findall(r'#\w+', doc['text'])
        hashtags_list.extend(hashtags)

        clean_text = re.sub(r'@\w+|\W+', ' ', doc['text'])
        words = clean_text.split()

        if 'sentiment' in doc:
            if doc['sentiment'] >= positive_threshold:
                positive_tweets_count += 1
            elif doc['sentiment'] <= negative_threshold:
                negative_tweets_count += 1

        for word in words:
            if word.lower() not in excluded_words and not word.startswith('#'):
                if 'sentiment' in doc and doc['sentiment'] >= positive_threshold:
                    positive_words_list.append(word.lower())
                elif 'sentiment' in doc and doc['sentiment'] <= negative_threshold:
                    negative_words_list.append(word.lower())

    print(f'Number of tweets in the top 10% (positive): {positive_tweets_count}')
    print(f'Number of tweets in the bottom 10% (negative): {negative_tweets_count}')


    print(f'Total positive words selected: {len(positive_words_list)}')
    print(f'Total negative words selected: {len(negative_words_list)}')


    df_positive_words = pd.DataFrame(positive_words_list, columns=['word'])
    df_negative_words = pd.DataFrame(negative_words_list, columns=['word'])

    df_hashtags = pd.DataFrame(hashtags_list, columns=['hashtag'])
    df_hashtags_counted = df_hashtags['hashtag'].value_counts().rename_axis('hashtag').reset_index(name='counts')
    top_hashtags = df_hashtags_counted.head(5)

    return df_positive_words, df_negative_words, top_hashtags
