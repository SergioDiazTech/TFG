import os
import json
import pandas as pd
from flask import Flask, jsonify



def load_data():
    dir_path = os.path.dirname(os.path.realpath(__file__))
    json_file_path = os.path.join(dir_path, 'Data', 'data_01.json')
    with open(json_file_path) as f:
        data = json.load(f)

    map_data = pd.DataFrame(data)
    map_data['Compound'] = map_data['Compound'].astype(float)

    # Drop rows with NaN values in latitude or longitude
    map_data = map_data.dropna(subset=['latitude', 'longitude'])

    #print(map_data)

    return map_data

def draw_map():
    map_data = load_data()

    lon = map_data['longitude'].tolist()  # Convierte a lista
    lat = map_data['latitude'].tolist()  # Convierte a lista
    comp = map_data['Compound'].tolist()  # Convierte a lista

    data = {
        'longitude': lon,
        'latitude': lat,
        'Compound': comp  # Utiliza 'Compound' en lugar de 'compound'
    }
    #print(data)

    return data
