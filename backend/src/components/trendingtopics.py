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


    projection = {"text": 1, "_id": 0}


    texts = twitter_collection.find(query, projection)

    words_list = []


    excluded_words = ["a", "ante", "bajo", "cabe", "con", "contra", "de", "desde", "durante", 
                      "en", "entre", "hacia", "hasta", "mediante", "para", "por", "según", 
                      "sin", "so", "sobre", "tras", "versus", "vía", "que", "se", "es", "me", 
                      "una", "co", "y", "nos", "su", "del", "le", "t",  "https", "el", "pero", "lo", "le", "va", "al", "un", "los", "la", "como", "olla", "está", "este", "esto", "están", "esmad", "esta", "o", "cuado", "también", "mi","porque", "hay"]

    for doc in texts:
        clean_text = re.sub(r'[@#]\w+|\W+', ' ', doc['text'])
        words = clean_text.split()
        filtered_words = [word for word in words if word.lower() not in excluded_words]
        words_list.extend(filtered_words)


    df_words = pd.DataFrame(words_list, columns=['word'])

    return df_words


df_words = draw_trendingtopics()
print(df_words)
