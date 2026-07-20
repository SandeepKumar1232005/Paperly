"""
Message Repository
------------------
All database operations for the `messages` table.
"""

from database.connection import supabase


class MessageRepository:

    @staticmethod
    def create(data: dict) -> dict:
        """Insert a new message row."""
        if not supabase:
            raise Exception("Database not connected")
        row = _to_row(data)
        result = supabase.table('messages').insert(row).execute()
        if result.data:
            return _format_message(result.data[0])
        raise Exception("Failed to create message")

    @staticmethod
    def list_filtered(sender_id: str = None, receiver_id: str = None) -> list[dict]:
        """List messages with optional sender/receiver filters, ordered by timestamp desc."""
        if not supabase:
            return []
        query = supabase.table('messages').select('*')
        if receiver_id:
            query = query.eq('receiver_id', receiver_id)
        if sender_id:
            query = query.eq('sender_id', sender_id)
        query = query.order('timestamp', desc=True)
        result = query.execute()
        return [_format_message(row) for row in (result.data or [])]


# ─── Internal Helpers ─────────────────────────────────────────────────

_FIELD_MAP = {
    'id': 'id',
    'senderId': 'sender_id',
    'sender_id': 'sender_id',
    'receiverId': 'receiver_id',
    'receiver_id': 'receiver_id',
    'content': 'content',
    'assignmentId': 'assignment_id',
    'assignment_id': 'assignment_id',
    'timestamp': 'timestamp',
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


def _format_message(row: dict) -> dict:
    if not row:
        return None
    extra = row.get('extra_data') or {}
    result = {
        'id': row.get('id'),
        'senderId': row.get('sender_id'),
        'receiverId': row.get('receiver_id'),
        'content': row.get('content'),
        'assignmentId': row.get('assignment_id'),
        'timestamp': row.get('timestamp'),
    }
    result.update(extra)
    return result
