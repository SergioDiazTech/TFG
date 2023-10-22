from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from components.twitter import get_tweets, load_tweets
from components.pointmap import draw_pointmap
from components.heatmap import draw_heatmap
from components.dataset import save_json_to_mongodb
from components.users import load_users


app = Flask(__name__)

CORS(app)

#Conexion con mongodb
app.config['MONGO_URI'] = 'mongodb://127.0.0.1/twitterdb'
mongo = PyMongo(app)
db = mongo.db.tweets

@app.route('/twitterapi', methods=['POST'])
def search_tweets_route():
    data = request.json
    keyword = data['keyword']
    numeroDeTweets = int(data['numeroDeTweets'])
    get_tweets(keyword, numeroDeTweets)
    return jsonify({'message': 'Tweets cargados correctamente'})


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


@app.route('/tweets', methods=['GET'])
def get_tweets_route():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 5))
    result = load_tweets(page, per_page)
    return jsonify(result)


@app.route('/users', methods=['GET'])
def get_users_route():
    option = request.args.get('option', 'all')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 5))
    result = load_users(option, page, per_page)
    return jsonify(result)


@app.route('/heatmap', methods=['GET'])
def display_heatmap():
    data = draw_heatmap()
    response_data = {
        'longitude': data['longitude'],
        'latitude': data['latitude'],
        'compound': data['Compound']
    }
    return jsonify(response_data)


@app.route('/pointmap', methods=['GET'])
def display_pointmap():
    data = draw_pointmap()
    response_data = {
        'longitude': data['longitude'],
        'latitude': data['latitude'],
        'compound': data['Compound']
    }
    return jsonify(response_data)




if __name__ == "__main__":
    app.run(debug=True)