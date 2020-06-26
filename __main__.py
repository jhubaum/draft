import json

from flask import Flask, render_template, request, jsonify, redirect, url_for

from database import Session
from database.models import Draft, Highlight

import parsing

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
    print('\t add highlight')
    session = Session()
    new = Highlight.from_json(draft_id, request.json)
    session.add(new)
    session.commit()

    return jsonify(dict(id=new.id))


@app.route('/<int:draft_id>/highlight/delete', methods=['POST'])
def remove_highlight(draft_id):
    print('\t remove highlight')
    session = Session()
    highlight = session.query(Highlight).get(request.json['id'])

    if highlight is not None and highlight.draft_id == draft_id:
        session.delete(highlight)
        session.commit()

    return 'ok'

@app.route('/config')
def admin_view():
    session = Session()
    return render_template('config.html', drafts=session.query(Draft).all())

@app.route('/config/draft/add', methods=['POST'])
def add_draft():
    filename, title = parsing.create_draft_file(request.form['content'])

    session = Session()
    session.add(Draft(title=title, filename=filename))
    session.commit()
   
    return redirect(url_for('admin_view'))

@app.route('/config/draft/delete/<int:draft_id>', methods=['POST'])
def delete_draft(draft_id):
    session = Session()
    draft = session.query(Draft).get(draft_id)
    parsing.delete_draft_file(draft)
    session.delete(draft)
    session.commit()

    return 'ok'

if __name__ == '__main__':
    setup()
    app.run(debug=True)
