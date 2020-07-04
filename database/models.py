from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()

class Draft(Base):
    __tablename__ = 'drafts'

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)

    urls = relationship("URL", back_populates="draft",
                        cascade="all, delete, delete-orphan")


class Highlight(Base):
    __tablename__ = 'highlights'

    id = Column(Integer, primary_key=True)
    url_id = Column(Integer, ForeignKey('urls.id'))
    url = relationship("URL", back_populates="highlights")

    paragraph = Column(String(5), nullable=False)
    start = Column(Integer, nullable=False)
    length = Column(Integer, nullable=False)
    type = Column(String(5), nullable=False)

    @staticmethod
    def from_json(url, json):
        return Highlight(url_id=url.id,
                         paragraph=json['p'],
                         start=json['start'],
                         length=json['length'],
                         type=json['type'])

    def to_dict(self):
        return dict(
            id=self.id,
            p=self.paragraph,
            start=self.start,
            length=self.length,
            type=self.type
        )


class URL(Base):
    __tablename__ = 'urls'

    id = Column(Integer, primary_key=True)
    url = Column(String(8), nullable=False)
    name = Column(String, nullable=False)

    draft_id = Column(Integer, ForeignKey('drafts.id'))
    draft = relationship("Draft", back_populates="urls")

    highlights = relationship("Highlight", back_populates="url",
                              cascade="all, delete, delete-orphan")
