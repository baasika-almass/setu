"""Add or reset a doctor account:  python -m app.create_user DOC-1234 "Dr. Name" password"""
import sys

from . import db

if len(sys.argv) != 4:
    sys.exit('Usage: python -m app.create_user <doctorId> "<Full Name>" <password>')
db.init_db()
db.add_user(sys.argv[1], sys.argv[2], sys.argv[3])
print(f"Saved doctor {sys.argv[1]}")
