import os

from . import app
from .views import setup

if __name__ == '__main__':
    setup()
    app.secret_key = os.urandom(12)
    app.run(debug=True)
