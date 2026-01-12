import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "paperly_project.settings")
django.setup()

from django.contrib.auth import get_user_model

def reset_admin_password():
    User = get_user_model()
    try:
        # Try to find 'admin' first, or fallback to the first superuser
        admin = User.objects.filter(username='admin').first()
        if not admin:
            admin = User.objects.filter(is_superuser=True).first()
        
        if admin:
            admin.set_password('admin123')
            admin.save()
            print(f"Successfully reset password for user: {admin.username}")
            print(f"Email: {admin.email}")
        else:
            print("No admin user found.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_admin_password()
