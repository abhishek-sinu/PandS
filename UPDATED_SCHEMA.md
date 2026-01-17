# Updated Schema: Multiple Problems & Solutions

## What Changed

Your ticket system now supports **multiple problems and solutions per ticket** instead of priority and status fields.

### New Structure

Each ticket now contains:
- **Title**: Ticket identifier/name
- **problemsSolutions**: Array of problem/solution pairs

```javascript
{
  _id: ObjectId,
  title: String,                    // e.g., "INC-12345 - Network Down"
  problemsSolutions: [
    {
      _id: ObjectId,
      problem: String,              // e.g., "WiFi not connecting"
      solution: String,             // e.g., "Restarted router"
      addedAt: Date
    },
    {
      _id: ObjectId,
      problem: String,
      solution: String,
      addedAt: Date
    }
    // ...more problems/solutions
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Features

### TicketForm.jsx
- Create new tickets with initial title, problem, and solution
- Simplified form (no priority/status dropdowns)

### TicketList.jsx
- **View Mode**: Shows problem count and ticket title
- **Expand**: Click expand button (▼) to see all problems/solutions
- **Edit Title**: Click ✏️ next to ticket title to rename it
- **Add Problem/Solution**: Inside expanded view, click "+ Add Problem/Solution"
- **Edit P/S**: Edit individual problem/solution pairs
- **Delete P/S**: Remove specific problem/solution from ticket
- **Delete Ticket**: Remove entire ticket from database

### App.jsx Functions
- `addTicket()` - Create new ticket with initial problem/solution
- `addProblemSolution()` - Add new problem/solution to existing ticket
- `updateProblemSolution()` - Edit problem or solution text
- `deleteProblemSolution()` - Remove problem/solution from ticket
- `deleteTicket()` - Remove entire ticket
- `updateTicketTitle()` - Change ticket title

## Backend API Endpoints

### Ticket Operations
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id` - Update ticket title
- `DELETE /api/tickets/:id` - Delete entire ticket

### Problem/Solution Operations
- `POST /api/tickets/:id/problems` - Add problem/solution to ticket
- `PATCH /api/tickets/:id/problems/:psId` - Update problem/solution
- `DELETE /api/tickets/:id/problems/:psId` - Delete problem/solution

## Database Changes

### Model Update (Ticket.js)
- Removed: `description`, `priority`, `status`, `assignee` fields
- Added: `problemsSolutions` array with subdocument schema
- Each subdocument has: `problem`, `solution`, `addedAt`

### Routes Update (tickets.js)
- New endpoint: `POST /:id/problems` - Add P/S
- New endpoint: `PATCH /:id/problems/:psId` - Update P/S
- New endpoint: `DELETE /:id/problems/:psId` - Delete P/S
- Simplified: `PATCH /:id` - Only updates title now

## Usage Flow

1. **Create Ticket**: Fill in title, problem, solution → Creates ticket with 1 P/S
2. **View Ticket**: See P/S count, click expand to view details
3. **Add More P/S**: Expand ticket → Click "+ Add Problem/Solution" → Fill in and save
4. **Edit P/S**: Click ✏️ on any P/S item → Edit → Save
5. **Delete P/S**: Click 🗑️ on any P/S item → Confirm
6. **Rename Ticket**: Click ✏️ next to title → Edit title → Save
7. **Delete Ticket**: Click 🗑️ Delete button → Confirm

## Notes

- All data is persisted in MongoDB
- Each problem/solution gets its own `_id` and `addedAt` timestamp
- Tickets are sorted by creation date (newest first)
- Can add unlimited problems/solutions to a ticket
- Search filters across titles and problem/solution text

## No Migration Needed

Since this is a fresh start with new schema, existing tickets (if any) will need to be recreated with the new structure.
