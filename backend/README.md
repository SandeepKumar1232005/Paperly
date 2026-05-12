# PAPERLY Backend

Django backend with JWT authentication and Role-Based Access Control.

## Key Features
- **Apps**: `authentication`, `assignments`, `communication`.
- **Auth**: JWT (SimpleJWT).
- **Users**: Custom User model with roles (Student, Provider, Admin).

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   (Make sure to create requirements.txt or use the installed packages: `django`, `djangorestframework`, `simplejwt`, `corsheaders`, `djongo`, `pymongo`)

2. **Database**:
   - The project uses **Firebase Firestore** as the primary database.
   - For local development, it automatically uses a **Mock Firestore** (`mock_firestore_db.json`) if credentials are missing.
   - To enable **Real Firestore**:
     1. Create a Firebase project.
     2. Download the service account JSON key.
     3. Save it as `firebase-credentials.json` in the `backend/` root.

3. **Run Server**:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

## API
- Admin: `/admin/`
- Auth: standard Django URLs (not yet exposed via DRF router, need to configure URLs).

> Note: To expose JWT endpoints, update `paperly_project/urls.py`.
