"""
User Repository
---------------
All database operations for the `users` table.
"""

from database.connection import supabase


class UserRepository:

    @staticmethod
    def get_by_id(user_id: str) -> dict | None:
        """Fetch a single user by primary key."""
        if not supabase:
            return None
        result = supabase.table('users').select('*').eq('id', user_id).execute()
        if result.data:
            return _format_user(result.data[0])
        return None

    @staticmethod
    def get_by_email(email: str) -> dict | None:
        """Fetch a single user by email."""
        if not supabase:
            return None
        result = supabase.table('users').select('*').eq('email', email.lower()).execute()
        if result.data:
            return _format_user(result.data[0])
        return None

    @staticmethod
    def get_by_email_or_username(identifier: str) -> dict | None:
        """Fetch a user matching either email or username (case-insensitive)."""
        if not supabase:
            return None
        identifier_lower = identifier.strip().lower()
        result = supabase.table('users').select('*').or_(
            f"email.eq.{identifier_lower},username.eq.{identifier_lower}"
        ).execute()
        if result.data:
            return _format_user(result.data[0])
        return None

    @staticmethod
    def check_email_or_username_exists(email: str, username: str) -> dict | None:
        """Check if a user with the given email OR username already exists."""
        if not supabase:
            return None
        result = supabase.table('users').select('*').or_(
            f"email.eq.{email.lower()},username.eq.{username.lower()}"
        ).execute()
        if result.data:
            return _format_user(result.data[0])
        return None

    @staticmethod
    def create(user_data: dict) -> dict:
        """Insert a new user row. Returns the created user dict."""
        if not supabase:
            raise Exception("Database not connected")
        row = _to_row(user_data)
        result = supabase.table('users').insert(row).execute()
        if result.data:
            return _format_user(result.data[0])
        raise Exception("Failed to create user")

    @staticmethod
    def update(user_id: str, updates: dict) -> dict | None:
        """Update specific fields on a user row."""
        if not supabase:
            return None
        row_updates = _to_row(updates)
        result = supabase.table('users').update(row_updates).eq('id', user_id).execute()
        if result.data:
            return _format_user(result.data[0])
        return None

    @staticmethod
    def delete(user_id: str) -> None:
        """Hard delete a user row."""
        if not supabase:
            return
        supabase.table('users').delete().eq('id', user_id).execute()

    @staticmethod
    def list_all(role: str = None) -> list[dict]:
        """List users, optionally filtered by role (case-insensitive match for both forms)."""
        if not supabase:
            return []
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

    @staticmethod
    def append_to_array(user_id: str, field: str, value) -> dict | None:
        """Append a value to a PostgreSQL array column (e.g. handwriting_samples)."""
        if not supabase:
            return None
        # Fetch current array
        current = supabase.table('users').select(field).eq('id', user_id).execute()
        if not current.data:
            return None
        current_array = current.data[0].get(field) or []
        if value not in current_array:
            current_array.append(value)
        result = supabase.table('users').update({field: current_array}).eq('id', user_id).execute()
        if result.data:
            return _format_user(result.data[0])
        return None

    @staticmethod
    def remove_from_array(user_id: str, field: str, value) -> dict | None:
        """Remove a value from a PostgreSQL array column."""
        if not supabase:
            return None
        current = supabase.table('users').select(field).eq('id', user_id).execute()
        if not current.data:
            return None
        current_array = current.data[0].get(field) or []
        if value in current_array:
            current_array.remove(value)
        result = supabase.table('users').update({field: current_array}).eq('id', user_id).execute()
        if result.data:
            return _format_user(result.data[0])
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
        'auth_provider': 'auth_provider',
        'is_custom_profile_picture': 'is_custom_profile_picture',
    }
    row = {}
    for key, value in data.items():
        col = mapping.get(key)
        if col:
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
