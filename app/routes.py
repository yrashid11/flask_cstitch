import os

from flask import Blueprint, request, jsonify, render_template, current_app
from werkzeug.utils import secure_filename

from utils.image_to_pattern import generate_pattern_from_image
from utils.stitch_format import validate_stitch_data, compress_stitch_data, decompress_stitch_data

bp = Blueprint('routes', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({'message': 'File uploaded', 'filename': filename}), 200
    return jsonify({'error': 'File type not allowed'}), 400

@bp.route('/generate-pattern', methods=['POST'])
def generate_pattern():
    data = request.json
    image_filename = data.get('filename')
    width = data.get('width', 50)
    height = data.get('height', 50)
    num_colors = data.get('colors', 10)

    image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_filename)
    if not os.path.exists(image_path):
        return jsonify({'error': 'Image not found'}), 404

    pattern_data = generate_pattern_from_image(image_path, width, height, num_colors)
    return jsonify({'pattern': pattern_data})

@bp.route('/save-pattern', methods=['POST'])
def save_pattern():
    stitch_data = request.json
    if not validate_stitch_data(stitch_data):
        return jsonify({'error': 'Invalid stitch format'}), 400

    name = stitch_data.get('name', 'unnamed')
    compressed = compress_stitch_data(stitch_data)

    db = current_app.extensions['sqlalchemy'].db
    conn = db.engine.connect()
    conn.execute("INSERT INTO patterns (name, data) VALUES (?, ?)", (name, compressed))
    conn.close()

    return jsonify({'message': 'Pattern saved'}), 200

@bp.route('/load-pattern/<int:pattern_id>', methods=['GET'])
def load_pattern(pattern_id):
    db = current_app.extensions['sqlalchemy'].db
    conn = db.engine.connect()
    result = conn.execute("SELECT data FROM patterns WHERE id = ?", (pattern_id,))
    row = result.fetchone()
    conn.close()

    if not row:
        return jsonify({'error': 'Pattern not found'}), 404

    decompressed = decompress_stitch_data(row[0])
    return jsonify(decompressed)

@bp.route('/api/thread-colors')
def thread_colors():
    from app.models import ThreadColor
    colors = ThreadColor.query.all()
    return jsonify([c.to_dict() for c in colors])
