import json
import random
import string

from flask import Flask, render_template, request, jsonify, redirect, url_for

from .database import Session
from .database.models import Draft, Highlight, URL

from . import parsing

from . import app

def setup():
    session = Session()
    session.add(Draft(title="Example", filename="example.html"))
    session.commit()

    # Session.add_all to add multiple elements

@app.route('/')
def home():
    return render_template('files/example.html', highlights=[], title="Example")

@app.route('/<url>')
def resolve_url(url):
    session = Session()
    q = session.query(URL).filter(URL.url == url)
    if q.count() == 0:
        return "Invalid URL, maybe I've deleted the post already. Thanks for your help anyways"

    url = q.first()
    highlights = list(map(lambda x: x.to_dict(), url.draft.highlights))

    return render_template('files/{}'.format(url.draft.filename),
                           title=url.draft.title,
                           highlights=json.dumps(highlights),
                           url=url)


@app.route('/<url>/highlight/add', methods=['POST'])
def add_highlight(url):
    session = Session()
    q = session.query(URL).filter(URL.url == url)
    if q.count() == 0:
        return "invalid URL"
    new = Highlight.from_json(q.first().draft, request.json)
    session.add(new)
    session.commit()

    return jsonify(dict(id=new.id))


@app.route('/<url>/highlight/delete', methods=['POST'])
def remove_highlight(url):
    session = Session()
    q = session.query(URL).filter(URL.url == url)
    if q.count() == 0:
        return "invalid URL"
    url = q.first()

    highlight = session.query(Highlight).get(request.json['id'])

    if highlight is not None and highlight.draft == url.draft:
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

@app.route('/config/url/add', methods=['POST'])
def add_url():
    def gen(length=8):
        return ''.join(random.sample(string.ascii_lowercase, length))

    session = Session()
    url = gen()
    while session.query(URL).filter(URL.url == url).count() > 1:
        url = gen()

    url = URL(url=url, name=request.json['name'],
              draft=session.query(Draft).get(request.json['draft_id']))

    session.add(url)
    session.commit()

    return 'ok'

@app.route('/config/url/delete/<url>', methods=['POST'])
def delete_url(url):
    session = Session()
    session.query(URL).filter(URL.url == url).delete()
    session.commit()

    return 'ok'
