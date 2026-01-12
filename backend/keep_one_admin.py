import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model

def keep_one_admin():
    User = get_user_model()
    admins = User.objects.filter(is_superuser=True).order_by('id')
    
    if admins.count() <= 1:
        print("Only 1 (or 0) admin exists. No action needed.")
        if admins.exists():
            print(f"Keeping admin: {admins.first().username}")
        return

    # Prefer 'admin' user
    keeper = admins.filter(username='admin').first()
    if not keeper:
        keeper = admins.first()
        
    print(f"Keeping admin: {keeper.username} (ID: {keeper.id})")
    
    deleted_count, _ = User.objects.filter(is_superuser=True).exclude(id=keeper.id).delete()
    print(f"Deleted {deleted_count} other admin(s).")

if __name__ == "__main__":
    keep_one_admin()
