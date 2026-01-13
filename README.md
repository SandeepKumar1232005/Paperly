# 📚 PAPERLY

**Study Smarter, Not Harder** ⭐

Paperly is a comprehensive platform connecting students with professional writers and assignment providers. It facilitates easy assignment management, secure payments, and seamless communication between users.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: Google OAuth (@react-oauth/google)
- **Payments**: Stripe Integration

### Backend
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: SQLite (Development) / MongoDB (Supported)
- **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
- **AI Integration**: Google Generative AI (Gemini)

---

## 📂 Project Structure

The project is organized into two main distinct folders:

- **`frontend/`**: Contains the client-side React application.
- **`backend/`**: Contains the server-side Django application and API logic.

---

## 🛠️ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/SandeepKumar1232005/Paperly.git
cd Paperly
```

### 2. Backend Setup
Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations (default is SQLite)
python manage.py migrate

# Create a superuser (for Admin access)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```
The backend API will run at `http://127.0.0.1:8000/`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the client.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will run at `http://localhost:3000/` (or the port shown in your terminal).

---

## 🔑 Environment Variables

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend` directory:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory (if not using default settings):
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
GOOGLE_API_KEY=your_gemini_api_key
```

---

## ✨ Key Features
- **User Roles**: Distinct flows for Students, Writers, and Admins.
- **Assignment Management**: Post, track, and manage assignment requests.
- **Secure Payments**: Integrated Stripe payment gateway.
- **Social Login**: One-click sign-in with Google.
- **Admin Dashboard**: Comprehensive control over users and system data.

---

## 🤝 Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
This project is licensed under the MIT License.
