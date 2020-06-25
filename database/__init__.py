from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from . import models

engine = create_engine('sqlite:///draft.db', echo=True)

# create tables
models.Base.metadata.create_all(engine)

Session = sessionmaker(bind=engine)


