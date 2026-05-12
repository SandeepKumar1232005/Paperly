import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def fix_sandeep_style():
    print("--- Fixing SANDEEP's style ---")
    users_ref = db.collection('users')
    # Find user named SANDEEP
    docs = users_ref.where('name', '==', 'SANDEEP').stream()
    
    found = False
    for doc in docs:
        found = True
        print(f"Updating user {doc.id} (SANDEEP)")
        users_ref.document(doc.id).update({
            'handwriting_style': 'Cursive',
            'handwriting_confidence': 0.89
        })
        print("Updated successfully.")
    
    if not found:
        print("SANDEEP not found in database.")

if __name__ == "__main__":
    fix_sandeep_style()
