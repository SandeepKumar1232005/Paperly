import os
import json
import uuid
from pathlib import Path
from datetime import datetime

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, firestore

# Load .env file (if exists)
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

# Path to service account key
CRED_PATH = Path(__file__).resolve().parent.parent / 'firebase-credentials.json'

class MockDocumentSnapshot:
    def __init__(self, doc_id, data, ref):
        self.id = doc_id
        self._data = data
        self.exists = data is not None
        self.reference = ref

    def to_dict(self):
        return self._data

class MockDocumentReference:
    def __init__(self, collection, doc_id):
        self.collection = collection
        self.id = doc_id

    def get(self):
        data = self.collection.db.get_data(self.collection.name, self.id)
        return MockDocumentSnapshot(self.id, data, self)

    def set(self, data):
        self.collection.db.set_data(self.collection.name, self.id, data)

    def update(self, data):
        self.collection.db.update_data(self.collection.name, self.id, data)

    def delete(self):
        self.collection.db.delete_data(self.collection.name, self.id)

class MockQuery:
    def __init__(self, collection, filters=None):
        self.collection = collection
        self.filters = filters or []

    def where(self, field=None, op=None, val=None, filter=None):
        new_filters = list(self.filters)
        if filter:
            new_filters.append(('complex', filter))
        else:
            new_filters.append(('simple', (field, op, val)))
        return MockQuery(self.collection, new_filters)

    def stream(self):
        all_docs = self.collection.db.get_collection(self.collection.name)
        for doc_id, data in all_docs.items():
            match = True
            for f_type, f_data in self.filters:
                if f_type == 'simple':
                    field, op, val = f_data
                    doc_val = data.get(field)
                    if op == '==': match = match and (doc_val == val)
                    elif op == '>=': match = match and (doc_val >= val)
                    elif op == '<=': match = match and (doc_val <= val)
                    elif op == '>': match = match and (doc_val > val)
                    elif op == '<': match = match and (doc_val < val)
                elif f_type == 'complex':
                    or_filter = f_data
                    found_match = False
                    
                    if hasattr(or_filter, 'filters'):
                        for ff in or_filter.filters:
                            field_path = getattr(ff, 'field_path', None)
                            op_string = getattr(ff, 'op_string', None)
                            value = getattr(ff, 'value', None)
                            
                            if field_path and field_path in data:
                                doc_val = data.get(field_path)
                                if op_string == '==' and doc_val == value:
                                    found_match = True
                                    break
                                elif op_string == '>=' and doc_val >= value:
                                    found_match = True
                                    break
                                elif op_string == '<=' and doc_val <= value:
                                    found_match = True
                                    break
                                elif op_string == '>' and doc_val > value:
                                    found_match = True
                                    break
                                elif op_string == '<' and doc_val < value:
                                    found_match = True
                                    break

                    if not found_match:
                        match = False
            
            if match:
                ref = MockDocumentReference(self.collection, doc_id)
                yield MockDocumentSnapshot(doc_id, data, ref)

class MockCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    def document(self, doc_id=None):
        if not doc_id: doc_id = str(uuid.uuid4())
        return MockDocumentReference(self, doc_id)

    def where(self, field=None, op=None, val=None, filter=None):
        return MockQuery(self).where(field, op, val, filter)

    def stream(self):
        return MockQuery(self).stream()

class MockFirestore:
    def __init__(self):
        self.db_path = Path(__file__).resolve().parent.parent / 'mock_firestore_db.json'
        self.data = {}
        if self.db_path.exists():
            try:
                with open(self.db_path, 'r') as f:
                    self.data = json.load(f)
            except:
                pass

    def _save(self):
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=4)

    def collection(self, name):
        return MockCollection(self, name)

    def get_collection(self, col):
        return self.data.get(col, {})

    def get_data(self, col, doc_id):
        return self.data.get(col, {}).get(doc_id)

    def set_data(self, col, doc_id, data):
        if col not in self.data: self.data[col] = {}
        for k, v in data.items():
            if isinstance(v, datetime): data[k] = v.isoformat()
        self.data[col][doc_id] = data
        self._save()

    def update_data(self, col, doc_id, data):
        if col in self.data and doc_id in self.data[col]:
            for k, v in data.items():
                if isinstance(v, datetime): v = v.isoformat()
                self.data[col][doc_id][k] = v
            self._save()

    def delete_data(self, col, doc_id):
        if col in self.data and doc_id in self.data[col]:
            del self.data[col][doc_id]
            self._save()

# --- INITIALIZATION ---
"""
FIREBASE CONFIGURATION
----------------------
The project uses Firestore as the primary database. 
- Production: Requires 'firebase-credentials.json' in the backend root.
- Development: If credentials are missing, it falls back to 'mock_firestore_db.json'.
"""

db = None

if CRED_PATH.exists():
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(str(CRED_PATH))
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print(f"[Firebase] Production Mode: Using REAL Firestore ({CRED_PATH.name})")
    except Exception as e:
        print(f"[Firebase] Failed to initialize real Firebase: {e}")
        db = MockFirestore()
        print("[Firebase] Falling back to Mock Firestore")
else:
    db = MockFirestore()
    print("[Firebase] Development Mode: No credentials found. Using LOCAL MOCK Firestore (mock_firestore_db.json)")

