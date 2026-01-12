import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model

def list_users():
    User = get_user_model()
    users = User.objects.all().order_by('role')
    
    print("\n" + "="*80)
    print(f"{'USERNAME':<20} | {'ROLE':<15} | {'EMAIL':<30} | {'NAME'}")
    print("="*80)
    
    for u in users:
        role_display = u.get_role_display() if hasattr(u, 'get_role_display') else u.role
        full_name = f"{u.first_name} {u.last_name}".strip()
        print(f"{u.username:<20} | {role_display:<15} | {u.email:<30} | {full_name}")
    
    print("="*80 + "\n")

if __name__ == "__main__":
    list_users()
