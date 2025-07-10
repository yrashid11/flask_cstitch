from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
import random
import string

def generate_pattern_from_image(image_path, width, height, num_colors):
    image = Image.open(image_path).convert("RGB")
    image = image.resize((width, height))
    np_image = np.array(image).reshape(-1, 3)

    kmeans = KMeans(n_clusters=num_colors)
    kmeans.fit(np_image)
    colors = kmeans.cluster_centers_.astype(int)
    labels = kmeans.labels_.reshape((height, width))

    symbol_pool = list(string.ascii_letters + string.punctuation)
    symbol_map = {i: symbol_pool[i] for i in range(num_colors)}
    color_map = {symbol_map[i]: '#{:02x}{:02x}{:02x}'.format(*colors[i]) for i in range(num_colors)}

    grid = []
    for row in labels:
        grid.append("".join(symbol_map[val] for val in row))

    return {
        "width": width,
        "height": height,
        "symbols": color_map,
        "grid": grid
    }