import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from utils.firebase import db

def list_assignments():
    print("--- Assignments in Firestore ---")
    assignments_ref = db.collection('assignments')
    docs = assignments_ref.stream()
    
    count = 0
    for doc in docs:
        data = doc.to_dict()
        print(f"ID: {doc.id}")
        print(f"  Title: {data.get('title')}")
        print(f"  Status: {data.get('status')}")
        print(f"  StudentId: {data.get('studentId')}")
        print(f"  WriterId: {data.get('writerId')}")
        print("-" * 20)
        count += 1
    
    print(f"Total assignments: {count}")

if __name__ == "__main__":
    list_assignments()
