"""
Supabase Connection Module
--------------------------
Initializes a singleton Supabase client using environment variables.
All repository modules import `supabase` from here.
"""

import os
from pathlib import Path
from supabase import create_client, Client

# Load .env file (if exists) - same pattern the project already uses
env_path = Path(__file__).resolve().parent.parent / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip())

SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

supabase: Client = None

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print(f"[Supabase] Connected to: {SUPABASE_URL}")
    except Exception as e:
        print(f"[Supabase] Failed to connect: {e}")
        supabase = None
else:
    print("[Supabase] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.")
    print("[Supabase] Please set them in backend/.env")
    supabase = None
