import mongoose from 'mongoose';
import Ticket from './models/Ticket.js';

const MONGO_URI = 'mongodb://localhost:27017/your-db-name'; // Update if needed

async function migrateProblemToStep() {
  await mongoose.connect(MONGO_URI);
  const tickets = await Ticket.find();
  let changedCount = 0;
  for (const ticket of tickets) {
    let changed = false;
    for (const ps of ticket.problemsSolutions) {
      if (!ps.step && ps.problem) {
        ps.step = ps.problem;
        changed = true;
      }
    }
    if (changed) {
      await ticket.save();
      changedCount++;
      console.log(`Migrated ticket ${ticket._id}`);
    }
  }
  console.log(`Done. Migrated ${changedCount} tickets.`);
  await mongoose.disconnect();
}

migrateProblemToStep();
