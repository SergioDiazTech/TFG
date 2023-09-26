import os
import json
from pymongo import MongoClient
import pandas as pd
from flask import Flask, jsonify, render_template, send_file, Response
import folium
from folium.plugins import HeatMap
import base64



def load_data():
    
    MONGO_URI = 'mongodb://127.0.0.1'
    client = MongoClient(MONGO_URI)
    db = client['TFG-DATASETS']
    twitter_collection = db["data_01.json"]

    data = list(twitter_collection.find({}))

    map_data = pd.DataFrame(data)
    map_data['Compound'] = map_data['Compound'].astype(float)

    # Eliminamos los valores NaN de las filas en latitude y longitude
    map_data = map_data.dropna(subset=['latitude', 'longitude'])

    #print(map_data)
    return map_data


def draw_heatmap():
    map_data = load_data()

    lon = map_data['longitude'].tolist()
    lat = map_data['latitude'].tolist()
    comp = map_data['Compound'].tolist()

    data = {
        'longitude': lon,
        'latitude': lat,
        'Compound': comp
    }

    return data