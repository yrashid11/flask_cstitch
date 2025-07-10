from . import db

class Example(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200), nullable=False)
    
class ThreadColor(db.Model):
    __tablename__ = 'thread_colors'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, unique=True, nullable=False)   # e.g. "3713"
    name = db.Column(db.String, nullable=False)                 # e.g. "Salmon Very Light"
    r = db.Column(db.Integer, nullable=False)
    g = db.Column(db.Integer, nullable=False)
    b = db.Column(db.Integer, nullable=False)
    hex = db.Column(db.String, nullable=False)                 # e.g. "#ffe2e2"

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "r": self.r,
            "g": self.g,
            "b": self.b,
            "hex": self.hex
        }