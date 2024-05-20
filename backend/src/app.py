from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from services.twitterClient import get_tweets
from services.datasetImporter import save_json_to_mongodb
from controllers.data import load_data, get_collection_names
from controllers.heatmap import draw_heatmap
from controllers.pointmap import draw_pointmap
from controllers.trendingtopics import draw_trendingtopics
from controllers.overview import load_information, load_sentiment_over_time

import traceback

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

    if numeroDeTweets <= 0:
        return jsonify({'message': 'El número de tweets debe ser mayor que cero'}), 400

    custom_name = data.get('customName', keyword)
    get_tweets(keyword, numeroDeTweets, custom_name)
    return jsonify({'message': 'Tweets cargados correctamente'})



@app.route('/dataset', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No se ha seleccionado ningún archivo.'}), 400

    file = request.files['file']
    custom_name = request.form.get('customName')

    if file.filename == '':
        return jsonify({'error': 'No se ha seleccionado ningún archivo.'}), 400

    if file:
        # Guardar el archivo en el sistema de archivos del servidor
        file.save(file.filename)

        # Llamar a la función de guardado en MongoDB desde dataset.py
        save_json_to_mongodb(file.filename,custom_name)

        return jsonify({'message': 'Archivo cargado correctamente.'}), 200

    return jsonify({'error': 'Error al cargar el archivo.'}), 500


@app.route('/tweetsData', methods=['GET'])
def get_collections_route():
    collection_names = get_collection_names()
    return jsonify(collection_names)


@app.route('/tweetsData/<collection_name>', methods=['GET'])
def get_data_route(collection_name):
    print(collection_name)
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 5))
    result = load_data(collection_name, page, per_page)
    return jsonify(result)


@app.route('/sentiment_count', methods=['GET'])
def sentiment_count_route():
    try:
        total_tweets, positive_tweets, negative_tweets, top_tweets, top_negative_tweets = load_information()
        sentiment_over_time_general, sentiment_over_time_positive, sentiment_over_time_negative = load_sentiment_over_time()
        #print(sentiment_over_time_general)

        return jsonify({
            'total_tweets': total_tweets,
            'positive_tweets': positive_tweets,
            'negative_tweets': negative_tweets,
            'top_tweets': top_tweets,
            'top_negative_tweets': top_negative_tweets,
            'sentiment_over_time': {
                'general': sentiment_over_time_general,
                'positive': sentiment_over_time_positive,
                'negative': sentiment_over_time_negative
            }
        })
    except Exception as e:
        print(f'Error: {e}')
        traceback.print_exc()  # Traceback completo
        return jsonify({'error': str(e)}), 500



@app.route('/heatmap', methods=['GET'])
def display_heatmap():
    min_lat = request.args.get('min_lat', default=None, type=float)
    max_lat = request.args.get('max_lat', default=None, type=float)
    min_lng = request.args.get('min_lng', default=None, type=float)
    max_lng = request.args.get('max_lng', default=None, type=float)

    start_date = request.args.get('start_date', default=None, type=str)
    end_date = request.args.get('end_date', default=None, type=str)

    try:
        data = draw_heatmap(min_lat, max_lat, min_lng, max_lng,start_date, end_date)
        return jsonify(data)
    except Exception as e:
        print(f'Error: {e}')
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500




@app.route('/pointmap', methods=['GET'])
def display_pointmap():
    min_lat = request.args.get('min_lat', default=None, type=float)
    max_lat = request.args.get('max_lat', default=None, type=float)
    min_lng = request.args.get('min_lng', default=None, type=float)
    max_lng = request.args.get('max_lng', default=None, type=float)

    try:
        data = draw_pointmap(min_lat, max_lat, min_lng, max_lng)
        return jsonify(data)
    except Exception as e:
        print(f'Error: {e}')
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    
@app.route('/trendingtopics', methods=['GET'])
def display_trendingtopics():
    try:
        df_positive_words, df_negative_words, top_hashtags_positives, top_hashtags_negatives = draw_trendingtopics()
        positive_words_data = df_positive_words.to_dict(orient='records')
        negative_words_data = df_negative_words.to_dict(orient='records')
        hashtags_positives_data = top_hashtags_positives.to_dict(orient='records')
        hashtags_negatives_data = top_hashtags_negatives.to_dict(orient='records')
        return jsonify({"positive_words": positive_words_data, "negative_words": negative_words_data, "hashtags_positives": hashtags_positives_data, "hashtags_negatives": hashtags_negatives_data})
    except Exception as e:
        print(f'Error: {e}')
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)