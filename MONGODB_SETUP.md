# IT Ticket Tracker with MongoDB

A React application for managing IT tickets with MongoDB backend integration.

## Project Structure

```
├── src/                    # React frontend
│   ├── App.jsx
│   ├── components/
│   │   ├── TicketForm.jsx
│   │   ├── TicketList.jsx
│   │   └── SearchBar.jsx
│   └── ...
├── server/                 # Node.js/Express backend
│   ├── models/
│   │   └── Ticket.js       # MongoDB Ticket schema
│   ├── routes/
│   │   └── tickets.js      # API routes
│   ├── server.js           # Express server entry point
│   ├── config.js           # Configuration
│   ├── .env                # Environment variables
│   └── package.json
└── ...
```

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running on your system

## Installation

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
npm install
```

2. Update `.env` file if needed (default connects to `mongodb://localhost:27017/ticket-tracker`)

### Frontend Setup

1. In the root directory, install dependencies:
```bash
npm install
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On Windows (if installed as service)
# MongoDB should auto-start

# Or manually run mongod
mongod
```

### Start the Backend Server

```bash
cd server
npm start       # Run once
# or
npm run dev     # Run with auto-reload on changes
```

The server will start on `http://localhost:5000`

### Start the Frontend

In a new terminal (from root directory):
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or similar)

## API Endpoints

### Tickets

- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get a single ticket
- `POST /api/tickets` - Create a new ticket
- `PATCH /api/tickets/:id` - Update a ticket
- `DELETE /api/tickets/:id` - Delete a ticket

## Ticket Schema

```javascript
{
  title: String,           // Ticket title/number
  description: String,     // Problem description
  priority: String,        // 'Low', 'Medium', 'High'
  status: String,          // 'Open', 'In Progress', 'Resolved', 'Closed'
  assignee: String,        // Person assigned (default: 'Unassigned')
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

## Features

- Create, read, update, and delete tickets
- Priority and status tracking
- Search functionality
- Persistent MongoDB storage
- Real-time updates between frontend and backend

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `.env` file for correct connection string
- Default: `mongodb://localhost:27017/ticket-tracker`

### CORS Error
- Backend CORS is configured to allow frontend requests
- Make sure backend is running on port 5000

### Port Already in Use
- Backend default: 5000 (change in `.env` if needed)
- Frontend default: 5173 (Vite will assign if busy)
