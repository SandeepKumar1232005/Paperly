"""
Transaction Repository
----------------------
All database operations for the `transactions` table.
"""

from database.connection import supabase


class TransactionRepository:

    @staticmethod
    def create(data: dict) -> dict:
        """Insert a new transaction row."""
        if not supabase:
            raise Exception("Database not connected")
        row = _to_row(data)
        result = supabase.table('transactions').insert(row).execute()
        if result.data:
            return _format_transaction(result.data[0])
        raise Exception("Failed to create transaction")


# ─── Internal Helpers ─────────────────────────────────────────────────

_FIELD_MAP = {
    'id': 'id',
    'assignmentId': 'assignment_id',
    'assignment_id': 'assignment_id',
    'userId': 'user_id',
    'user_id': 'user_id',
    'amount': 'amount',
    'status': 'status',
    'createdAt': 'created_at',
    'created_at': 'created_at',
}


def _to_row(data: dict) -> dict:
    row = {}
    for key, value in data.items():
        col = _FIELD_MAP.get(key)
        if col:
            row[col] = value
    return row


def _format_transaction(row: dict) -> dict:
    if not row:
        return None
    return {
        'id': row.get('id'),
        'assignmentId': row.get('assignment_id'),
        'userId': row.get('user_id'),
        'amount': row.get('amount'),
        'status': row.get('status'),
        'createdAt': row.get('created_at'),
    }
