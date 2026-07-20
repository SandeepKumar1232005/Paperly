"""
Password Reset Repository
-------------------------
All database operations for the `password_resets` table.
"""

from database.connection import supabase


class PasswordResetRepository:

    @staticmethod
    def create(email: str, otp: str, created_at, expires_at) -> dict:
        """Upsert a password reset record (keyed by email)."""
        if not supabase:
            raise Exception("Database not connected")
        row = {
            'email': email,
            'otp': otp,
            'created_at': created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at),
            'expires_at': expires_at.isoformat() if hasattr(expires_at, 'isoformat') else str(expires_at),
        }
        # Upsert: if email exists, overwrite OTP and timestamps
        result = supabase.table('password_resets').upsert(row, on_conflict='email').execute()
        if result.data:
            return result.data[0]
        raise Exception("Failed to create password reset record")

    @staticmethod
    def get_by_email(email: str) -> dict | None:
        """Fetch a password reset record by email."""
        if not supabase:
            return None
        result = supabase.table('password_resets').select('*').eq('email', email).execute()
        if result.data:
            return result.data[0]
        return None

    @staticmethod
    def delete(email: str) -> None:
        """Delete a password reset record."""
        if not supabase:
            return
        supabase.table('password_resets').delete().eq('email', email).execute()
