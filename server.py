import json
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room, send
HOST_URL = "0.0.0.0"
PORT = 5000
UI_PAGES = [
    "test1.html"
]

app = Flask(__name__)
app.config['SECRET_KEY'] = 'bad_secret_key_fix_me_later!'
app.config['TEMPLATES_AUTO_RELOAD'] = True
socketio = SocketIO(app, async_mode="gevent", cors_allowed_origins="*")


@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/<path:subpath>')
def give_page(subpath):
    """
    routing for all ui pages. Gives "page not found" if
    the page isn't in UI_PAGES
    """
    if subpath[-1] == "/":
        subpath = subpath[:-1]
    if subpath in UI_PAGES:
        return render_template(subpath)
    return "oops page not found"

@socketio.event
def connect():
    print('Established socketio connection')

@socketio.on('join')
def handle_join(name, id):
    join_room(id)
    print(f'confirmed join: {(name, id)}')

@socketio.on('ui-to-server')
def ui_to_server(p, header, args=None):
    if not password(p):
        return

if __name__ == "__main__":
    print("Hello, world!")
    print(f"Running server on port {PORT}. Pages:")
    for page in UI_PAGES:
        print(f"\thttp://localhost:{PORT}/{page}")

socketio.run(app, host=HOST_URL, port=PORT)
