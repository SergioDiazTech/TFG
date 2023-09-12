from pymongo import MongoClient #Biblioteca que nos permite conectarnos a mongoDB
import json
import os

# Obtiene la ruta absoluta del directorio actual donde se encuentra el archivo dataset.py
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FOLDER = os.path.join(CURRENT_DIR, "Data")

MONGO_URI = 'mongodb://127.0.0.1'#Direccion donde esta el servidor de MongoDB , 
#a partir del protocolo mongodb, va a conectarse al local host

def save_json_to_mongodb(filename):

    #Una vez se conecte, nos devolverá un objeto llamado client
    client = MongoClient(MONGO_URI)

    db = client['Twitter']
    tweets_collection = db['tweets_colombia21']
    users_collection = db['users_colombia21']

    
    # Verificar si la carpeta "Data" existe, si no, crearla
    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)

    # Mover el archivo a la carpeta "Data" y reemplazar si ya existe
    new_filename = os.path.join(DATA_FOLDER, filename)
    if os.path.exists(new_filename):
        os.remove(new_filename)
    os.rename(filename, new_filename)


    with open(new_filename, 'r', encoding='utf-8') as file:
        data = json.load(file)


    #Convertimos los valores '_id' en las colecciones de usuarios y tweets de diccionarios a cadenas. 
    # En los archivos JSON, el valor de '_id' es un diccionario que contiene una clave '$oid' 
    # que apunta al identificador del objeto. La cadena de identificación se guarda en lugar del diccionario.
    for tweet in data:
        tweet['_id'] = tweet['_id']['$oid']

    # Eliminar los documentos existentes en la colección users_colombia21
    #tweets_collection.delete_many({})

    # Insertar documentos en colecciones si no existen
    if filename == "tweets_colombia21.json":
        new_count = 0
        for tweet in data:
            if tweets_collection.find_one({'_id': tweet['_id']}) is None:
                tweets_collection.insert_one(tweet)
                new_count  += 1
                print(new_count)
        
        print(f"Total de documentos: {tweets_collection.count_documents({})}")
        print(f"Nuevos documentos añadidos: {new_count}")

    if filename == "users_colombia21.json":
        new_count = 0
        for tweet in data:
            if users_collection.find_one({'_id': tweet['_id']}) is None:
                users_collection.insert_one(tweet)
                new_count  += 1
                print(new_count)
        
        print(f"Total de documentos: {users_collection.count_documents({})}")
        print(f"Nuevos documentos añadidos: {new_count}")


    # Imprimir información de cada colección
    
