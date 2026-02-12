import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model
from utils.mongo import db

if db is None:
  print("DB not connected")
  import sys
  sys.exit(1)

def list_detailed_admins():
    User = get_user_model()
    # Filter for superusers or staff
    admins = User.objects.filter(is_superuser=True)
    
    print("\n" + "="*100)
    print(f"{'ID':<5} | {'USERNAME':<20} | {'EMAIL':<30} | {'SUPERUSER':<10} | {'ROLE'}")
    print("="*100)
    
    for u in admins:
        print(f"{u.id:<5} | {u.username:<20} | {u.email:<30} | {str(u.is_superuser):<10} | {u.role}")
    
    print("="*100 + "\n")

if __name__ == "__main__":
    list_detailed_admins()
