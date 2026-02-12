from utils.mongo import db
import sys

try:
    with open('users_dump.txt', 'w', encoding='utf-8') as f:
        count = db.users.count_documents({})
        f.write(f"Total Users: {count}\n")
        print(f"Total Users: {count}")
        
        user = db.users.find_one({'email': 'charlie@admin.com'})
        if user:
            f.write(f"User FOUND: {user['email']}\n")
            f.write(f"ID: {user.get('id')}\n")
            f.write(f"Role: {user.get('role')}\n")
        else:
            f.write("User NOT FOUND\n")

        f.write("-" * 20 + "\n")
        f.write("All Users:\n")
        for u in db.users.find():
            f.write(f"Email: {u.get('email')}, Username: {u.get('username')}, Role: {u.get('role')}\n")

except Exception as e:
    print(f"Error querying DB: {e}")
