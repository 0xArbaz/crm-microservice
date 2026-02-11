"""
Import CRI email templates from SQL file using SQLAlchemy.
"""
import sys
import os
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def clean_sql_content(content):
    """Remove problematic characters from SQL content"""
    # Remove control characters that cause encoding issues
    # Keep printable ASCII and common Unicode
    cleaned = ''
    for char in content:
        code = ord(char)
        # Keep standard ASCII printable, newlines, tabs, and common Unicode
        if (32 <= code <= 126) or code in (9, 10, 13) or (160 <= code <= 65535 and code not in range(0x80, 0xa0)):
            cleaned += char
        elif code in range(0x80, 0xa0):
            # Replace control characters in C1 range with space
            cleaned += ' '
        else:
            cleaned += char
    return cleaned

def import_templates():
    sql_file = os.path.join(os.path.dirname(__file__), 'seed_cri_email_templates.sql')

    with open(sql_file, 'r', encoding='utf-8-sig', errors='replace') as f:
        sql_content = f.read()

    # Clean the SQL content
    sql_content = clean_sql_content(sql_content)

    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        # Check if data already exists
        result = db.execute(text("SELECT COUNT(*) FROM cri_email_templates"))
        count = result.scalar()

        if count > 0:
            print(f"Table already has {count} records. Skipping import.")
            return

        # Execute the INSERT statement using raw connection
        connection = engine.raw_connection()
        cursor = connection.cursor()
        cursor.execute(sql_content)
        connection.commit()
        cursor.close()
        connection.close()

        # Verify import
        result = db.execute(text("SELECT COUNT(*) FROM cri_email_templates"))
        new_count = result.scalar()
        print(f"Successfully imported {new_count} CRI email templates!")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_templates()
