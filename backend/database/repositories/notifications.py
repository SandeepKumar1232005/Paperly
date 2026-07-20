"""
Notification Repository
-----------------------
All database operations for the `notifications` table.
"""

from database.connection import supabase


class NotificationRepository:

    @staticmethod
    def create(data: dict) -> dict:
        """Insert a new notification row."""
        if not supabase:
            raise Exception("Database not connected")
        row = _to_row(data)
        result = supabase.table('notifications').insert(row).execute()
        if result.data:
            return _format_notification(result.data[0])
        raise Exception("Failed to create notification")

    @staticmethod
    def list_by_user(user_id: str) -> list[dict]:
        """List notifications for a specific user, ordered by timestamp desc."""
        if not supabase:
            return []
        result = supabase.table('notifications').select('*').eq(
            'user_id', user_id
        ).order('timestamp', desc=True).execute()
        return [_format_notification(row) for row in (result.data or [])]


# ─── Internal Helpers ─────────────────────────────────────────────────

_FIELD_MAP = {
    'id': 'id',
    'userId': 'user_id',
    'user_id': 'user_id',
    'type': 'type',
    'title': 'title',
    'message': 'message',
    'assignmentId': 'assignment_id',
    'assignment_id': 'assignment_id',
    'studentId': 'student_id',
    'student_id': 'student_id',
    'writerId': 'writer_id',
    'writer_id': 'writer_id',
    'isRead': 'is_read',
    'is_read': 'is_read',
    'timestamp': 'timestamp',
}


def _to_row(data: dict) -> dict:
    row = {}
    for key, value in data.items():
        col = _FIELD_MAP.get(key)
        if col:
            row[col] = value
    return row


def _format_notification(row: dict) -> dict:
    if not row:
        return None
    return {
        'id': row.get('id'),
        'userId': row.get('user_id'),
        'type': row.get('type'),
        'title': row.get('title'),
        'message': row.get('message'),
        'assignmentId': row.get('assignment_id'),
        'studentId': row.get('student_id'),
        'writerId': row.get('writer_id'),
        'isRead': row.get('is_read', False),
        'timestamp': row.get('timestamp'),
    }
