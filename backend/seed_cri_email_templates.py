"""
Seed script to import CRI email templates from SQL dump file.
Run this after running migrations: python seed_cri_email_templates.py
"""
import re
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.cri_email_template import CRIEmailTemplate


def parse_sql_values(sql_content: str) -> list:
    """Parse INSERT VALUES from SQL content"""
    templates = []

    # Find all value tuples - they start with \t ('title' and end with '),
    # The pattern matches tuples like ('title','tab',...)

    # Remove the INSERT INTO line
    values_start = sql_content.find("VALUES")
    if values_start == -1:
        return templates

    values_content = sql_content[values_start + 6:]

    # Split by the tuple pattern - each tuple starts with \n\t ('
    tuples = re.split(r'\),\s*\n\s*\(', values_content)

    for i, tuple_str in enumerate(tuples):
        # Clean up the tuple string
        tuple_str = tuple_str.strip()
        if tuple_str.startswith('('):
            tuple_str = tuple_str[1:]
        if tuple_str.endswith(');'):
            tuple_str = tuple_str[:-2]
        elif tuple_str.endswith(')'):
            tuple_str = tuple_str[:-1]

        # Parse the values - split by ',' but be careful of commas inside strings
        values = []
        current_value = ""
        in_string = False
        escape_next = False

        for char in tuple_str:
            if escape_next:
                current_value += char
                escape_next = False
                continue

            if char == '\\' or (char == "'" and len(current_value) > 0 and current_value[-1] == "'"):
                # Handle escaped quotes ('' in SQL)
                if char == "'" and in_string:
                    current_value += char
                    continue
                escape_next = True
                current_value += char
                continue

            if char == "'" and not in_string:
                in_string = True
                continue
            elif char == "'" and in_string:
                in_string = False
                continue

            if char == ',' and not in_string:
                values.append(current_value.strip())
                current_value = ""
                continue

            current_value += char

        # Don't forget the last value
        if current_value:
            values.append(current_value.strip())

        # Map values to our model fields
        # Source: title, tab, email_format, email_format_option_value, subject, created_by, company_id, created_at, updated_at, email_template
        if len(values) >= 10:
            template_data = {
                'title': values[0].replace("''", "'") if values[0] != 'NULL' else None,
                'tab': values[1].replace("''", "'") if values[1] != 'NULL' else None,
                'email_format': values[2].replace("''", "'") if values[2] != 'NULL' else None,
                'email_format_option_values': values[3].replace("''", "'") if values[3] != 'NULL' else None,
                'subject': values[4].replace("''", "'") if values[4] != 'NULL' else None,
                'created_by': int(values[5]) if values[5] != 'NULL' and values[5].isdigit() else None,
                'company_id': int(values[6]) if values[6] != 'NULL' and values[6].isdigit() else None,
                'email_template': values[9].replace("''", "'") if len(values) > 9 and values[9] != 'NULL' else None,
            }
            templates.append(template_data)

    return templates


def seed_templates():
    """Seed CRI email templates from SQL file"""
    sql_file_path = os.path.join(os.path.dirname(__file__), '..', 'cust_req_email_template_202602111346.sql')

    if not os.path.exists(sql_file_path):
        print(f"SQL file not found: {sql_file_path}")
        return

    print(f"Reading SQL file: {sql_file_path}")

    with open(sql_file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    templates = parse_sql_values(sql_content)
    print(f"Found {len(templates)} templates to import")

    db = SessionLocal()
    try:
        # Check if data already exists
        existing_count = db.query(CRIEmailTemplate).count()
        if existing_count > 0:
            print(f"Table already has {existing_count} records. Skipping seed.")
            return

        # Insert templates
        for i, template_data in enumerate(templates):
            template = CRIEmailTemplate(**template_data)
            db.add(template)
            if (i + 1) % 10 == 0:
                print(f"Added {i + 1} templates...")

        db.commit()
        print(f"Successfully imported {len(templates)} CRI email templates!")

    except Exception as e:
        db.rollback()
        print(f"Error importing templates: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_templates()
