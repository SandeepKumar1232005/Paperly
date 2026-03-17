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
- **Authentication**: JWT & Role-Based Access Control
- **Payments**: Stripe Integration

### Backend
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: MongoDB (via PyMongo)
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Generative AI (Gemini)

---

## ✨ Key Features
- **User Roles**: Distinct flows for Students, Writers, and Admins.
- **Assignment Management**: Post, track, and manage assignment requests instantly.
- **Find Writers**: Browse available writers, filter by their handwriting styles, and view sample work.
- **Real-Time Dashboards**: Beautiful glassmorphism UI for monitoring all requests.
- **Location-Based Connections**: See how far writers are from your location.
- **Secure Payments**: Integrated Stripe payment gateway for seamless transactions.
- **Social Login**: One-click sign-in with Google.
- **Admin Control**: Comprehensive control over users and system data.

---

## 📂 Project Structure

- **`frontend/`**: Contains the client-side React + Vite application.
- **`backend/`**: Contains the server-side Django API, linking PyMongo to MongoDB Atlas.

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
python -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Django development server
python manage.py runserver
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the client.

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

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
Create a `.env` file in the `backend` directory:
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
```
*(Please do not commit your `.env` file!)*

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
