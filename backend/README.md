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
   - Currently configured for **SQLite** for development/testing ease.
   - To enable **MongoDB**:
     1. Ensure MongoDB is running.
     2. Open `paperly_project/settings.py`.
     3. Comment out the SQLite `DATABASES` block.
     4. Uncomment the MongoDB `DATABASES` block.

3. **Run Server**:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

## API
- Admin: `/admin/`
- Auth: standard Django URLs (not yet exposed via DRF router, need to configure URLs).

> Note: To expose JWT endpoints, update `paperly_project/urls.py`.
