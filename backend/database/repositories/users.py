"""
User Repository
---------------
All database operations for the `users` table.
"""

import json
from pathlib import Path
from database.connection import supabase

MOCK_DB_PATH = Path(__file__).resolve().parent.parent.parent / "mock_firestore_db.json"

def _load_mock_users() -> dict:
    if MOCK_DB_PATH.exists():
        try:
            with open(MOCK_DB_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("users", {})
        except Exception as e:
            print("[UserRepository] Error reading mock_firestore_db.json:", e)
    return {}

def _save_mock_users(users: dict):
    try:
        data = {"users": users}
        with open(MOCK_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print("[UserRepository] Error saving to mock_firestore_db.json:", e)


class UserRepository:

    @staticmethod
    def get_by_id(user_id: str) -> dict | None:
        """Fetch a single user by primary key."""
        if supabase:
            try:
                result = supabase.table('users').select('*').eq('id', user_id).execute()
                if result.data:
                    return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase query failed: {e}")
        users = _load_mock_users()
        return users.get(user_id)

    @staticmethod
    def get_by_email(email: str) -> dict | None:
        """Fetch a single user by email."""
        if not email:
            return None
        email_lower = email.lower()
        if supabase:
            try:
                result = supabase.table('users').select('*').eq('email', email_lower).execute()
                if result.data:
                    return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase query failed: {e}")
        users = _load_mock_users()
        for u in users.values():
            if u.get('email', '').lower() == email_lower:
                return u
        return None

    @staticmethod
    def get_by_email_or_username(identifier: str) -> dict | None:
        """Fetch a user matching either email or username (case-insensitive)."""
        if not identifier:
            return None
        identifier_lower = identifier.strip().lower()
        if supabase:
            try:
                result = supabase.table('users').select('*').or_(
                    f"email.eq.{identifier_lower},username.eq.{identifier_lower}"
                ).execute()
                if result.data:
                    return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase query failed: {e}")
        users = _load_mock_users()
        for u in users.values():
            if (u.get('email', '').lower() == identifier_lower or 
                u.get('username', '').lower() == identifier_lower):
                return u
        return None

    @staticmethod
    def check_email_or_username_exists(email: str, username: str) -> dict | None:
        """Check if a user with the given email OR username already exists."""
        email_clean = (email or '').lower()
        user_clean = (username or '').lower()
        if supabase:
            try:
                result = supabase.table('users').select('*').or_(
                    f"email.eq.{email_clean},username.eq.{user_clean}"
                ).execute()
                if result.data:
                    return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase query failed: {e}")
        users = _load_mock_users()
        for u in users.values():
            if (u.get('email', '').lower() == email_clean or 
                u.get('username', '').lower() == user_clean):
                return u
        return None

    @staticmethod
    def create(user_data: dict) -> dict:
        """Insert a new user row. Returns the created user dict."""
        if supabase:
            try:
                row = _to_row(user_data)
                result = supabase.table('users').insert(row).execute()
                if result.data:
                    return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase create failed: {e}")
        users = _load_mock_users()
        uid = user_data.get('id')
        users[uid] = user_data
        _save_mock_users(users)
        return user_data

    @staticmethod
    def update(user_id: str, updates: dict) -> dict | None:
        """Update specific fields on a user row."""
        if supabase:
            try:
                row_updates = _to_row(updates)
                result = supabase.table('users').update(row_updates).eq('id', user_id).execute()
                if result.data:
                    return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase update failed: {e}")
        users = _load_mock_users()
        if user_id in users:
            users[user_id].update(updates)
            _save_mock_users(users)
            return users[user_id]
        return None

    @staticmethod
    def delete(user_id: str) -> None:
        """Hard delete a user row."""
        if supabase:
            try:
                supabase.table('users').delete().eq('id', user_id).execute()
            except Exception as e:
                print(f"[UserRepository] Supabase delete failed: {e}")
        users = _load_mock_users()
        if user_id in users:
            del users[user_id]
            _save_mock_users(users)

    @staticmethod
    def list_all(role: str = None) -> list[dict]:
        """List users, optionally filtered by role (case-insensitive match for both forms)."""
        if supabase:
            try:
                query = supabase.table('users').select('*')
                if role:
                    role_lower = role.lower()
                    role_upper = role.upper()
                    if role_lower in ['provider', 'writer']:
                        query = query.or_(f"role.eq.provider,role.eq.WRITER")
                    else:
                        query = query.or_(f"role.eq.{role_lower},role.eq.{role_upper}")
                result = query.execute()
                return [_format_user(row) for row in (result.data or [])]
            except Exception as e:
                print(f"[UserRepository] Supabase list_all failed: {e}")
        users = _load_mock_users()
        res = list(users.values())
        if role:
            role_upper = role.upper()
            res = [u for u in res if u.get('role', '').upper() == role_upper or (role_upper == 'WRITER' and u.get('role', '').upper() in ['PROVIDER', 'WRITER'])]
        return res

    @staticmethod
    def append_to_array(user_id: str, field: str, value) -> dict | None:
        """Append a value to a PostgreSQL array column (e.g. handwriting_samples)."""
        if supabase:
            try:
                current = supabase.table('users').select(field).eq('id', user_id).execute()
                if current.data:
                    current_array = current.data[0].get(field) or []
                    if value not in current_array:
                        current_array.append(value)
                    result = supabase.table('users').update({field: current_array}).eq('id', user_id).execute()
                    if result.data:
                        return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase append_to_array failed: {e}")
        users = _load_mock_users()
        if user_id in users:
            arr = users[user_id].get(field) or []
            if value not in arr:
                arr.append(value)
            users[user_id][field] = arr
            _save_mock_users(users)
            return users[user_id]
        return None

    @staticmethod
    def remove_from_array(user_id: str, field: str, value) -> dict | None:
        """Remove a value from a PostgreSQL array column."""
        if supabase:
            try:
                current = supabase.table('users').select(field).eq('id', user_id).execute()
                if current.data:
                    current_array = current.data[0].get(field) or []
                    if value in current_array:
                        current_array.remove(value)
                    result = supabase.table('users').update({field: current_array}).eq('id', user_id).execute()
                    if result.data:
                        return _format_user(result.data[0])
            except Exception as e:
                print(f"[UserRepository] Supabase remove_from_array failed: {e}")
        users = _load_mock_users()
        if user_id in users:
            arr = users[user_id].get(field) or []
            if value in arr:
                arr.remove(value)
            users[user_id][field] = arr
            _save_mock_users(users)
            return users[user_id]
        return None


# ─── Internal Helpers ─────────────────────────────────────────────────

def _to_row(data: dict) -> dict:
    """Convert camelCase/app-level keys to snake_case DB columns."""
    mapping = {
        'id': 'id',
        'email': 'email',
        'username': 'username',
        'password': 'password',
        'name': 'name',
        'role': 'role',
        'avatar': 'avatar',
        'address': 'address',
        'is_verified': 'is_verified',
        'availability_status': 'availability_status',
        'coordinates': 'coordinates',
        'handwriting_style': 'handwriting_style',
        'handwriting_confidence': 'handwriting_confidence',
        'handwriting_sample_url': 'handwriting_sample_url',
        'handwriting_samples': 'handwriting_samples',
        'qr_code_url': 'qr_code_url',
        'price_per_page': 'price_per_page',
        'created_at': 'created_at',
    }
    row = {}
    for key, value in data.items():
        col = mapping.get(key)
        # Drop columns that are not in the schema
        if col and col not in ['auth_provider', 'is_custom_profile_picture']:
            row[col] = value
    return row


def _format_user(row: dict) -> dict:
    """Convert a DB row back to the app-level dict shape."""
    if not row:
        return None
    return {
        'id': row.get('id'),
        'email': row.get('email'),
        'username': row.get('username'),
        'password': row.get('password'),
        'name': row.get('name'),
        'role': row.get('role'),
        'avatar': row.get('avatar'),
        'address': row.get('address'),
        'is_verified': row.get('is_verified', False),
        'availability_status': row.get('availability_status', 'ONLINE'),
        'coordinates': row.get('coordinates'),
        'handwriting_style': row.get('handwriting_style'),
        'handwriting_confidence': row.get('handwriting_confidence'),
        'handwriting_sample_url': row.get('handwriting_sample_url'),
        'handwriting_samples': row.get('handwriting_samples') or [],
        'qr_code_url': row.get('qr_code_url'),
        'price_per_page': row.get('price_per_page'),
        'created_at': row.get('created_at'),
        'auth_provider': row.get('auth_provider'),
        'is_custom_profile_picture': row.get('is_custom_profile_picture', False),
    }
