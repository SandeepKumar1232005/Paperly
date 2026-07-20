"""
Announcement Repository
-----------------------
All database operations for the `announcements` table.
"""

from database.connection import supabase


class AnnouncementRepository:

    @staticmethod
    def create(data: dict) -> dict:
        """Insert a new announcement row."""
        if not supabase:
            raise Exception("Database not connected")
        row = _to_row(data)
        result = supabase.table('announcements').insert(row).execute()
        if result.data:
            return _format_announcement(result.data[0])
        raise Exception("Failed to create announcement")

    @staticmethod
    def list_all() -> list[dict]:
        """List all announcements ordered by created_at desc."""
        if not supabase:
            return []
        result = supabase.table('announcements').select('*').order(
            'created_at', desc=True
        ).execute()
        return [_format_announcement(row) for row in (result.data or [])]


# ─── Internal Helpers ─────────────────────────────────────────────────

_FIELD_MAP = {
    'id': 'id',
    'title': 'title',
    'content': 'content',
    'authorId': 'author_id',
    'author_id': 'author_id',
    'createdAt': 'created_at',
    'created_at': 'created_at',
}

_KNOWN_COLUMNS = set(_FIELD_MAP.values())


def _to_row(data: dict) -> dict:
    row = {}
    extra = {}
    for key, value in data.items():
        col = _FIELD_MAP.get(key)
        if col:
            row[col] = value
        else:
            extra[key] = value
    if extra:
        row['extra_data'] = extra
    return row


def _format_announcement(row: dict) -> dict:
    if not row:
        return None
    extra = row.get('extra_data') or {}
    result = {
        'id': row.get('id'),
        'title': row.get('title'),
        'content': row.get('content'),
        'authorId': row.get('author_id'),
        'createdAt': row.get('created_at'),
    }
    result.update(extra)
    return result
