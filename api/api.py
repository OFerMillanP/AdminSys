import datetime
import copy

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

items = []

valid_users = [
    {
        'user': 'Anel',
        'name': 'Anel CZV',
        'password': '1234',
        'level': 'admin'
    },
    {
        'user': 'Oscar',
        'name': 'Oscar FMP',
        'password': '1234',
        'level': 'general'
    }
]

levels = [
    {'L100': 'admin'},
    {'L050': 'general'},
]

# User in session
current_logged_user = {
    'user': 'Anel',
    'name': 'Anel CZV',
    'password': '1234',
    'level': 'admin'
}

# Not User in session
# current_logged_user = {}

@app.route('/api/v0/permissions', methods=['GET'])
def obtener_datos():
    return jsonify(levels)

# Api to Login
@app.route('/api/v0/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_to_access = request.get_json()
        for user in valid_users:
            # Validate if the user is in db (Object - temporaly)
            if user['user'] == user_to_access['user'] and user['password'] == user_to_access['password']:
                # Get JSON data from the request body
                # print(user)
                user['loginDate'] = datetime.datetime.now()
                data_to_send = ['name','level','loginDate']
                user_data = {k: user[k] for k in data_to_send if k in user}
                return jsonify(user_data), 201
        if len(user_data) == 0:
            return jsonify({'message': 'User Not Found', 'code': 'E0001','status': False}), 400
    if request.method == 'GET':
            current_logged_user['loginDate'] = datetime.datetime.now()
            data_to_send = ['name','level']
            current_user = {k: current_logged_user[k] for k in data_to_send if k in current_logged_user}
            return jsonify(current_user), 201

if __name__ == '__main__':
    app.run(port=8100, debug=True)
