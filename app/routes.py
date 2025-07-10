from flask import Blueprint, request, jsonify, render_template, current_app
from werkzeug.utils import secure_filename
import os
from .models import Message

bp = Blueprint('routes', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

@bp.route('/messages')
def show_messages():
    messages = Message.query.all()
    return render_template('messages.html', messages=messages)
