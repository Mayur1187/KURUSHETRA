from database.sqlite_db import db_sqlite

# Local SQLite Database Alias
db = db_sqlite
db_service = db_sqlite

def get_db():
    return db_sqlite
