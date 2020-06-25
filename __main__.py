import json

from flask import Flask, render_template, request

from database import Session
from database.models import Draft, Highlight


app = Flask(__name__)

def setup():
    session = Session()
    session.add(Draft(title="Example", filename="example.html"))
    session.commit()

    # Session.add_all to add multiple elements

@app.route('/')
def home():
    return render_template('files/example.html')

@app.route('/<int:draft_id>')
def show_draft(draft_id):
    session = Session()
    draft = session.query(Draft).get(draft_id)

    if draft is None:
        return "Not found"
   
    highlights = list(map(lambda x: x.to_dict(), draft.highlights))


    return render_template(f'files/{draft.filename}',
                           title=draft.title,
                           highlights=json.dumps(highlights))


@app.route('/<int:draft_id>/highlight/add', methods=['POST'])
def add_highlight(draft_id):
    session = Session()

    print(request.json)

    session.add(Highlight.from_json(draft_id, request.json))
    session.commit()

    return 'ok'



if __name__ == '__main__':
    setup()
    app.run(debug=True)
