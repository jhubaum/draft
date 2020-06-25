from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()

class Draft(Base):
    __tablename__ = 'drafts'

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)

    highlights = relationship("Highlight", back_populates="draft")

    def __repr__(self):
        return f'<Draft({self.title})>'

class Highlight(Base):
    __tablename__ = 'highlights'

    id = Column(Integer, primary_key=True)
    draft_id = Column(Integer, ForeignKey('drafts.id'))
    draft = relationship("Draft", back_populates="highlights")

    paragraph = Column(String(5), nullable=False)
    start = Column(Integer, nullable=False)
    length = Column(Integer, nullable=False)

    @staticmethod
    def from_json(draft_id, json):
        return Highlight(draft_id=draft_id,
                         paragraph=json['p'],
                         start=json['start'],
                         length=json['length'])

    def to_dict(self):
        return dict(
            p=self.paragraph,
            start=self.start,
            length=self.length
        )
