"""
Assignment Repository
---------------------
All database operations for the `assignments` table.
"""

from database.connection import supabase


class AssignmentRepository:

    @staticmethod
    def get_by_id(assignment_id: str) -> dict | None:
        """Fetch a single assignment by primary key."""
        if not supabase:
            return None
        result = supabase.table('assignments').select('*').eq('id', assignment_id).execute()
        if result.data:
            return _format_assignment(result.data[0])
        return None

    @staticmethod
    def create(data: dict) -> dict:
        """Insert a new assignment row."""
        if not supabase:
            raise Exception("Database not connected")
        row = _to_row(data)
        result = supabase.table('assignments').insert(row).execute()
        if result.data:
            return _format_assignment(result.data[0])
        raise Exception("Failed to create assignment")

    @staticmethod
    def update(assignment_id: str, updates: dict) -> dict | None:
        """Update specific fields on an assignment."""
        if not supabase:
            return None
        row_updates = _to_row(updates)
        result = supabase.table('assignments').update(row_updates).eq('id', assignment_id).execute()
        if result.data:
            return _format_assignment(result.data[0])
        return None

    @staticmethod
    def delete(assignment_id: str) -> None:
        """Hard delete an assignment row."""
        if not supabase:
            return
        supabase.table('assignments').delete().eq('id', assignment_id).execute()

    @staticmethod
    def list_all() -> list[dict]:
        """List all assignments, ordered by created_at descending."""
        if not supabase:
            return []
        result = supabase.table('assignments').select('*').order('created_at', desc=True).execute()
        return [_format_assignment(row) for row in (result.data or [])]

    @staticmethod
    def atomic_accept(assignment_id: str, writer_id: str):
        """
        Atomically accept an assignment: only succeeds if status is still PENDING.
        Returns (success: bool, error_msg: str | None).
        """
        if not supabase:
            return False, "Database not connected"

        import datetime
        # Read current status
        result = supabase.table('assignments').select('status').eq('id', assignment_id).execute()
        if not result.data:
            return False, 'Assignment not found'

        current_status = result.data[0].get('status')
        if current_status != 'PENDING':
            return False, 'Assignment already accepted.'

        # Update only if still PENDING (optimistic concurrency)
        accepted_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        update_result = supabase.table('assignments').update({
            'status': 'ASSIGNED',
            'writer_id': writer_id,
            'accepted_at': accepted_at,
        }).eq('id', assignment_id).eq('status', 'PENDING').execute()

        if update_result.data:
            return True, None
        return False, 'Assignment already accepted.'


# ─── Internal Helpers ─────────────────────────────────────────────────

# Mapping from app-level camelCase keys to DB snake_case columns
_FIELD_MAP = {
    'id': 'id',
    'title': 'title',
    'description': 'description',
    'subject': 'subject',
    'pages': 'pages',
    'budget': 'budget',
    'deadline': 'deadline',
    'status': 'status',
    'assignmentType': 'assignment_type',
    'assignment_type': 'assignment_type',
    'visibility': 'visibility',
    'preferredHandwritingStyles': 'preferred_handwriting_styles',
    'preferred_handwriting_styles': 'preferred_handwriting_styles',
    'studentId': 'student_id',
    'student_id': 'student_id',
    'writerId': 'writer_id',
    'writer_id': 'writer_id',
    'assignedWriterId': 'assigned_writer_id',
    'assigned_writer_id': 'assigned_writer_id',
    'quotingWriterId': 'quoting_writer_id',
    'quoting_writer_id': 'quoting_writer_id',
    'quoted_amount': 'quoted_amount',
    'quoteComment': 'quote_comment',
    'quote_comment': 'quote_comment',
    'fileUrl': 'file_url',
    'file_url': 'file_url',
    'cancelledBy': 'cancelled_by',
    'cancelled_by': 'cancelled_by',
    'cancelledAt': 'cancelled_at',
    'cancelled_at': 'cancelled_at',
    'cancellationReason': 'cancellation_reason',
    'cancellation_reason': 'cancellation_reason',
    'acceptedAt': 'accepted_at',
    'accepted_at': 'accepted_at',
    'createdAt': 'created_at',
    'created_at': 'created_at',
}

# Known DB columns — anything not in this set goes into extra_data
_KNOWN_COLUMNS = set(_FIELD_MAP.values())


def _to_row(data: dict) -> dict:
    """Convert app-level data dict to DB row, putting unknown fields into extra_data."""
    row = {}
    extra = {}
    for key, value in data.items():
        col = _FIELD_MAP.get(key)
        if col:
            row[col] = value
        else:
            # Unknown field → store in extra_data JSONB
            extra[key] = value

    if extra:
        row['extra_data'] = extra

    return row


def _format_assignment(row: dict) -> dict:
    """Convert a DB row back to the camelCase dict shape the frontend expects."""
    if not row:
        return None
    extra = row.get('extra_data') or {}
    result = {
        'id': row.get('id'),
        'title': row.get('title'),
        'description': row.get('description'),
        'subject': row.get('subject'),
        'pages': row.get('pages'),
        'budget': row.get('budget'),
        'deadline': row.get('deadline'),
        'status': row.get('status'),
        'assignmentType': row.get('assignment_type'),
        'visibility': row.get('visibility'),
        'preferredHandwritingStyles': row.get('preferred_handwriting_styles') or [],
        'studentId': row.get('student_id'),
        'writerId': row.get('writer_id'),
        'assignedWriterId': row.get('assigned_writer_id'),
        'quotingWriterId': row.get('quoting_writer_id'),
        'quoted_amount': row.get('quoted_amount'),
        'quoteComment': row.get('quote_comment'),
        'fileUrl': row.get('file_url'),
        'cancelledBy': row.get('cancelled_by'),
        'cancelledAt': row.get('cancelled_at'),
        'cancellationReason': row.get('cancellation_reason'),
        'acceptedAt': row.get('accepted_at'),
        'createdAt': row.get('created_at'),
    }
    # Merge extra_data back into the result (preserves dynamic frontend fields)
    result.update(extra)
    return result
