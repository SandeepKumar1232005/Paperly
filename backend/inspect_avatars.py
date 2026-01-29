
from utils.mongo import db

def inspect_users():
    print("--- Inspecting Users ---")
    users = list(db.users.find())
    with open("avatars.txt", "w", encoding="utf-8") as f:
        print(f"Total Users: {len(users)}", file=f)
        
        for u in users:
            email = u.get('email', 'No Email')
            address = u.get('address', 'No Address')
            avatar = u.get('avatar')
            
            avatar_status = "MISSING"
            if avatar:
                if len(str(avatar)) > 100:
                    avatar_status = f"PRESENT (Len: {len(str(avatar))})"
                else:
                    avatar_status = f"PRESENT (Short: {avatar})"
            
            print(f"User: {email}", file=f)
            print(f"  Address: {address}", file=f)
            print(f"  Avatar:  {avatar_status}", file=f)
            print("-" * 30, file=f)

if __name__ == "__main__":
    inspect_users()
