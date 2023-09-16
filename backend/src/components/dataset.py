from pymongo import MongoClient #Biblioteca que nos permite conectarnos a mongoDB
import json
import os

# Obtiene la ruta absoluta del directorio actual donde se encuentra el archivo dataset.py
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FOLDER = os.path.join(CURRENT_DIR, "Data")

MONGO_URI = 'mongodb://127.0.0.1'#Direccion donde esta el servidor de MongoDB , 
#a partir del protocolo mongodb, va a conectarse al localhost (127.0.0.1)

def save_json_to_mongodb(filename):
    
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

    
    if filename.endswith(".json"): # Comprobamos si el archivo que vamos a guardar en bbdd es un fichero json
        
        new_count = 0

        #Una vez se conecte, nos devolverá un objeto llamado client
        client = MongoClient(MONGO_URI)
        
        if filename == "tweets_colombia21.json" or filename == "users_colombia21.json":
            
            db = client['TFG-DATASETS-COLOMBIA']
            collection_name = filename
            dataset_collection = db[collection_name]

            for tweet in data:
                tweet['_id'] = tweet['_id']['$oid']
                #Convertimos los valores '_id' en las colecciones de usuarios y tweets de diccionarios a cadenas. 
                # En los archivos JSON, el valor de '_id' es un diccionario que contiene una clave '$oid' 
                # que apunta al identificador del objeto. La cadena de identificación se guarda en lugar del diccionario.
            
            for tweet in data:
                if dataset_collection.find_one({'_id': tweet['_id']}) is None: # Insertar documentos(tweets) en la collection si no existen
                    dataset_collection.insert_one(tweet)
                    new_count  += 1
                    print(new_count)
        else:

            db = client['TFG-DATASETS']
            collection_name = filename
            dataset_collection = db[collection_name]

            for tweet in data:
                if dataset_collection.find_one({'id': tweet['id']}) is None: # Insertar documentos(tweets) en la collection si no existen
                    dataset_collection.insert_one(tweet)
                    new_count  += 1
                    print(new_count)

        print(f"Total de documentos: {dataset_collection.count_documents({})}")
        print(f"Nuevos documentos añadidos: {new_count}")

