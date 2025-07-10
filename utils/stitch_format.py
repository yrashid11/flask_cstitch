import json
import zlib

def validate_stitch_data(data):
    required_keys = {"width", "height", "symbols", "grid"}
    return isinstance(data, dict) and required_keys.issubset(data.keys())

def compress_stitch_data(data):
    json_data = json.dumps(data)
    return zlib.compress(json_data.encode("utf-8"))

def decompress_stitch_data(compressed_data):
    json_data = zlib.decompress(compressed_data).decode("utf-8")
    return json.loads(json_data)