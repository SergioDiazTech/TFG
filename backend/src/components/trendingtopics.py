from pymongo import MongoClient
import pandas as pd
import re

def draw_trendingtopics():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']

    twitter_collection_name = "tweets_colombia"
    twitter_collection = db[twitter_collection_name]

    query = {"referenced_tweets": {"$exists": False}}
    projection = {"text": 1, "sentiment": 1, "_id": 0}
    texts = twitter_collection.find(query, projection)

    positive_words_list = []
    negative_words_list = []
    hashtags_list = []

    positive_threshold = 0.90
    negative_threshold = -0.90

    excluded_words = ["a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "durante", 
                      "en", "entre", "hacia", "hasta", "mediante", "para", "por", "según", 
                      "sin", "so", "sobre", "tras", "versus", "vía", "que", "se", "es", "me", 
                      "una", "co", "y", "nos", "su", "del", "le", "t",  "https", "el", "pero", 
                      "lo", "le", "va", "al", "un", "los", "la", "como", "olla", "está", "este", 
                      "esto", "están", "esmad", "esta", "o", "cuado", "también", "mi","porque", "hay", "les", "ni", "las", "si", "no", "esos", "7"]

    for doc in texts:
        hashtags = re.findall(r'#\w+', doc['text'])
        hashtags_list.extend(hashtags)

        clean_text = re.sub(r'@\w+|\W+', ' ', doc['text'])
        words = clean_text.split()
        for word in words:
            if word.lower() not in excluded_words and not word.startswith('#'):
                if 'sentiment' in doc and doc['sentiment'] > positive_threshold:
                    positive_words_list.append(word.lower())
                elif 'sentiment' in doc and doc['sentiment'] < negative_threshold:
                    negative_words_list.append(word.lower())

    df_positive_words = pd.DataFrame(positive_words_list, columns=['word'])
    df_negative_words = pd.DataFrame(negative_words_list, columns=['word'])

    df_hashtags = pd.DataFrame(hashtags_list, columns=['hashtag'])
    df_hashtags_counted = df_hashtags['hashtag'].value_counts().rename_axis('hashtag').reset_index(name='counts')
    top_hashtags = df_hashtags_counted.head(5)

    return df_positive_words, df_negative_words, top_hashtags