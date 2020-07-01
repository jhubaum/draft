from . import app
from .views import setup

if __name__ == '__main__':
    setup()
    app.run(debug=True)
