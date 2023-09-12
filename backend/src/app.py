from flask import Flask, request, jsonify
from flask_pymongo import PyMongo, ObjectId
from flask_cors import CORS, cross_origin
from components.twitter import get_tweets, load_tweets
from components.heatmap import draw_map
from components.dataset import save_json_to_mongodb


app = Flask(__name__)

CORS(app)

#Conexion con mongodb
app.config['MONGO_URI'] = 'mongodb://127.0.0.1/twitterdb'
mongo = PyMongo(app)
db = mongo.db.tweets

#@cross_origin
@app.route('/tweets', methods=['GET'])
def get_tweets_route():
    tweets = load_tweets()
    print(tweets)
    return jsonify(tweets)

@app.route('/twitterapi', methods=['POST'])
def search_tweets_route():
    data = request.json
    keyword = data['keyword']
    numeroDeTweets = int(data['numeroDeTweets'])
    get_tweets(keyword, numeroDeTweets)
    return jsonify({'message': 'Tweets cargados correctamente'})
 
@app.route('/heatmap', methods=['GET'])
def display_heatmap():
    data = draw_map()
    response_data = {
        'longitude': data['longitude'],
        'latitude': data['latitude'],
        'compound': data['Compound']
    }
    return jsonify(response_data)


@app.route('/dataset', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se ha seleccionado ningún archivo.'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No se ha seleccionado ningún archivo.'}), 400

    if file:
        # Guardar el archivo en el sistema de archivos del servidor
        file.save(file.filename)

        # Llamar a la función de guardado en MongoDB desde dataset.py
        save_json_to_mongodb(file.filename)

        return jsonify({'message': 'Archivo cargado correctamente.'}), 200

    return jsonify({'error': 'Error al cargar el archivo.'}), 500



if __name__ == "__main__":
    app.run(debug=True)