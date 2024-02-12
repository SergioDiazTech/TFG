from pymongo import MongoClient
import pandas as pd
import re
import numpy as np

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

    positive_words_list = []
    negative_words_list = []
    positive_hashtags_list = []
    negative_hashtags_list = []

    excluded_words = ["a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "durante", 
                      "en", "entre", "hacia", "hasta", "mediante", "para", "por", "según", 
                      "sin", "so", "sobre", "tras", "versus", "vía", "que", "se", "es", "me", 
                      "una", "co", "y", "nos", "su", "del", "le", "t", "https", "el", "pero", 
                      "lo", "le", "va", "al", "un", "los", "la", "como", "olla", "está", "este", 
                      "esto", "están", "esmad", "esta", "o", "cuado", "también", "mi","porque", 
                      "hay", "les", "ni", "las", "si", "no", "esos", "7", "ya", "sus", "son", "más", "todo"]

    for doc in texts:
        if 'sentiment' in doc:
            clean_text = re.sub(r'@\w+|\W+', ' ', doc['text'])
            words = clean_text.split()

            if doc['sentiment'] >= positive_threshold:
                hashtags = re.findall(r'#\w+', doc['text'])
                positive_hashtags_list.extend(hashtags)

                for word in words:
                    if word.lower() not in excluded_words and not word.startswith('#'):
                        positive_words_list.append(word.lower())

            elif doc['sentiment'] <= negative_threshold:
                hashtags = re.findall(r'#\w+', doc['text'])
                negative_hashtags_list.extend(hashtags)

                for word in words:
                    if word.lower() not in excluded_words and not word.startswith('#'):
                        negative_words_list.append(word.lower())

    df_positive_words = pd.DataFrame(positive_words_list, columns=['word'])
    df_negative_words = pd.DataFrame(negative_words_list, columns=['word'])

    df_positive_hashtags = pd.DataFrame(positive_hashtags_list, columns=['hashtag'])
    df_positive_hashtags_counted = df_positive_hashtags['hashtag'].value_counts().rename_axis('hashtag').reset_index(name='counts')
    top_hashtags_positives = df_positive_hashtags_counted.head(7)

    df_negative_hashtags = pd.DataFrame(negative_hashtags_list, columns=['hashtag'])
    df_negative_hashtags_counted = df_negative_hashtags['hashtag'].value_counts().rename_axis('hashtag').reset_index(name='counts')
    top_hashtags_negatives = df_negative_hashtags_counted.head(7)

    return df_positive_words, df_negative_words, top_hashtags_positives, top_hashtags_negatives
