# HomeBound Care – Tech Stack and Installation Guide

## Tech Stack

### Frontend
- React 19
- Tailwind CSS
- Shadcn/UI components
- Axios
- React Router

### Backend
- FastAPI (Python)
- Motor (Async MongoDB driver)
- Pydantic for data validation
- Passlib + bcrypt for password hashing
- Python-JOSE for JWT authentication
- Cryptography (Fernet) for AES-256 encryption
- Aiosmtplib for email sending

### Database
- MongoDB

## Installation and Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18+ and Yarn
- MongoDB 5.0 or higher

### Backend Setup

```bash
cd /app/backend

pip install -r requirements.txt

cp .env.example .env
# Edit .env with:
# MONGO_URL
# JWT_SECRET
# ENCRYPTION_KEY
# SMTP_API_KEY

uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

```bash
cd /app/frontend

yarn install

cp .env.example .env
# Set REACT_APP_BACKEND_URL

yarn start
```

### MongoDB Setup

```bash
# Start MongoDB
mongod --dbpath /data/db
```

The application will automatically create the required database and collections on first run.
