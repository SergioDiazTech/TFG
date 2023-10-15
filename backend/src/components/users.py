from pymongo import MongoClient

USERS_PER_PAGE = 10

def load_users(option, page, per_page):
    # Conexión a MongoDB
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    users_collection = client['COLOMBIA']['users_colombia21.json']

    skip = (page - 1) * per_page

    if option == 'all':
        users = list(users_collection.find({}).skip(skip).limit(per_page))
    elif option == 'mostRelevant':
    
        pass
    elif option == 'mostFollowers':

        pass
    elif option == 'positiveReputation':
        
        pass
    elif option == 'negativeReputation':
        
        pass

    return users
