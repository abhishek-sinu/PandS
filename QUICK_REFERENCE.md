# Quick Reference Guide

## Running Your Application

### Terminal 1: MongoDB (if not auto-running)
```bash
mongod
```
Status: ✅ Already running via Windows Service

### Terminal 2: Backend Server
```bash
cd server
npm start       # Already running on port 5000
# or use for development:
npm run dev     # With auto-reload
```
Status: ✅ Server is running on http://localhost:5000
Database: ✅ Connected to mongodb://localhost:27017/ticket-tracker

### Terminal 3: Frontend App
```bash
npm run dev     # From root directory
```
Will open on http://localhost:5173 (or next available port)

---

## Key Features

### Create a Ticket
1. Click "+ Add New Ticket"
2. Fill: Title, Problem, Solution
3. Click "Create Ticket"
→ Ticket created with 1 problem/solution in MongoDB

### View & Expand Ticket
1. Tickets show problem/solution count
2. Click ▼ to expand and see all P/S pairs
3. Each P/S shows: Problem, Solution, Date

### Add More Problems/Solutions
1. Expand ticket
2. Click "+ Add Problem/Solution"
3. Fill in new problem and solution
4. Click "Add"
→ New P/S added to existing ticket

### Edit Problem/Solution
1. Expand ticket
2. Click ✏️ on P/S item you want to edit
3. Modify problem/solution text
4. Click "Save"

### Delete Problem/Solution
1. Expand ticket
2. Click 🗑️ on P/S item
3. Confirm deletion

### Rename Ticket
1. Click ✏️ next to ticket title
2. Edit the title
3. Click ✓ to save or ✕ to cancel

### Delete Entire Ticket
1. Click 🗑️ Delete button on ticket
2. Confirm deletion

### Search Tickets
- Type in search bar to filter by title or P/S text
- Real-time filtering

---

## File Structure

```
├── server/
│   ├── models/Ticket.js           ← Database schema
│   ├── routes/tickets.js          ← API endpoints
│   ├── server.js                  ← Express server
│   ├── config.js                  ← Configuration
│   ├── .env                       ← Database URL
│   └── package.json               ← Dependencies
├── src/
│   ├── App.jsx                    ← Main component with API calls
│   ├── components/
│   │   ├── TicketForm.jsx         ← Create ticket form
│   │   ├── TicketList.jsx         ← Display & manage tickets
│   │   └── SearchBar.jsx          ← Search filter
│   └── ...
└── UPDATED_SCHEMA.md              ← Schema documentation
```

---

## API Endpoints Cheat Sheet

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tickets` | Fetch all tickets |
| POST | `/api/tickets` | Create new ticket |
| GET | `/api/tickets/:id` | Get single ticket |
| PATCH | `/api/tickets/:id` | Update ticket title |
| DELETE | `/api/tickets/:id` | Delete entire ticket |
| POST | `/api/tickets/:id/problems` | Add P/S to ticket |
| PATCH | `/api/tickets/:id/problems/:psId` | Update P/S |
| DELETE | `/api/tickets/:id/problems/:psId` | Delete P/S |

---

## Troubleshooting

**Frontend won't connect to backend?**
- Ensure backend is running on port 5000
- Check browser console for errors (F12)
- Verify MongoDB is running

**Ticket won't save?**
- Check network tab in DevTools (F12)
- Verify backend logs for errors
- Ensure MongoDB is running

**Port already in use?**
- Backend: Change PORT in `server/.env`
- Frontend: Vite will auto-assign next port

**Database connection error?**
- Verify MongoDB is running: `Get-Process mongod`
- Check connection string in `server/.env`
- Restart MongoDB service if needed

---

## Next Steps (Optional Enhancements)

- Add user authentication
- Add tags/categories to tickets
- Export tickets to CSV/PDF
- Add comments on P/S items
- Add priority/status tracking
- Implement ticket assignment
- Add timestamps for P/S edits

---

## Important Notes

✅ All changes have been implemented
✅ Backend is running and connected to MongoDB
✅ Schema updated to support multiple P/S per ticket
✅ React components updated for new workflow
✅ CSS styling added for new features

🎉 Your IT Ticket Tracker with Multiple Problems/Solutions is ready!
