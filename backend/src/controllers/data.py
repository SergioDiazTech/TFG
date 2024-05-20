from pymongo import MongoClient


def get_collection_names():
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    collection = db['Ingestion_Registry']
    target_collection_name = 'tweets_colombia'

    # Buscar documentos que tienen el 'CollectionName' especificado
    documents = collection.find({'CollectionName': target_collection_name}, {'Name': 1, '_id': 0})

    # Construir una lista con los nombres encontrados
    names_list = [doc['Name'] for doc in documents if 'Name' in doc]

    if names_list:
        print(names_list)
    else:
        print("No se encontraron documentos con el CollectionName especificado")

    return names_list




def load_data(collection_name, page, per_page):
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['DB_External_Data_Ingestion']
    twitter_collection = db[collection_name]

    skip = (page - 1) * per_page
    tweets = list(twitter_collection.find({"referenced_tweets": {"$exists": False}}).skip(skip).limit(per_page))

    return tweets