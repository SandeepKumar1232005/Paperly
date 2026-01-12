import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def delete_user():
    if len(sys.argv) < 2:
        print("\n❌ Error: Please provide the email address.")
        print("Usage: python delete_user.py <email>")
        print("Example: python delete_user.py john@example.com\n")
        return

    email_to_delete = sys.argv[1]

    try:
        user = User.objects.get(email=email_to_delete)
        user_id = user.id
        user.delete()
        print(f"\n✅ User deleted successfully!")
        print(f"   - Email: {email_to_delete}")
        print(f"   - ID: {user_id}\n")
    except User.DoesNotExist:
        print(f"\n⚠️ User not found: '{email_to_delete}'")
    except Exception as e:
        print(f"\n❌ Error deleting user: {str(e)}")

if __name__ == "__main__":
    delete_user()
