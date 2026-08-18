# 💍 Marriage Guest List Management System

A full-stack web application to manage marriage guest lists with PDF and Word export support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Export | PDFKit (PDF) + docx (Word) |

## Project Structure

```
guest list project/
├── backend/
│   ├── models/
│   │   ├── Lot.js
│   │   └── Guest.js
│   ├── routes/
│   │   ├── lots.js
│   │   ├── guests.js
│   │   └── export.js
│   ├── .env            ← Put your MongoDB Atlas URI here
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── LotCard.jsx
    │   │   ├── GuestForm.jsx
    │   │   └── GuestTable.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Lots.jsx
    │   │   └── Guests.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    └── package.json
```

## Setup & Run

### Step 1: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Open `backend/.env` and replace `your_mongodb_atlas_connection_string_here` with your URI:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/guestlist?retryWrites=true&w=majority
   ```

### Step 2: Start Backend

```bash
cd backend
npm install
npm start
# Server runs at http://localhost:5000
```

### Step 3: Start Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

## Features

- 📋 **Lots** — Group guests into batches (bride's side, groom's side, etc.)
- 👥 **Guest Management** — Add, edit, delete guests
- 📤 **Bulk Import** — Add up to 500 guests at once via CSV-style text
- 🔍 **Search** — Search guests by name, mobile, or place
- 📄 **PDF Export** — Download a formatted guest list as PDF
- 📝 **Word Export** — Download a formatted guest list as .docx
- 🌐 **Shared Database** — All data stored in MongoDB Atlas, visible to everyone

## Guest Fields (All Optional)

| Field | Description |
|-------|-------------|
| First Name | Guest's first name |
| Father Name | Guest's father's name |
| Surname | Family surname |
| Mobile Number | Contact number |
| Place | City or address |

## Bulk Import Format

```
FirstName, FatherName, Surname, MobileNumber, Place
Rahul, Kumar, Sharma, 9876543210, Mumbai
Priya, Raj, Patel, 9123456789, Delhi
, , Gupta, , Pune
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lots` | Get all lots with guest count |
| POST | `/api/lots` | Create a new lot |
| DELETE | `/api/lots/:id` | Delete lot and all its guests |
| GET | `/api/guests?lotId=` | Get guests in a lot (with pagination & search) |
| POST | `/api/guests` | Add single guest |
| POST | `/api/guests/bulk` | Bulk add up to 500 guests |
| PUT | `/api/guests/:id` | Update a guest |
| DELETE | `/api/guests/:id` | Delete a guest |
| GET | `/api/export/pdf/:lotId` | Download lot as PDF |
| GET | `/api/export/word/:lotId` | Download lot as Word |
