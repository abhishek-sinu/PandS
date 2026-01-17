// server/fix-missing-steps.js
import mongoose from 'mongoose';
import Ticket from './models/Ticket.js';

const MONGO_URI = 'mongodb://localhost:27017/your-db-name'; // <-- update this if needed

async function fixMissingSteps() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const tickets = await Ticket.find();
  let fixedCount = 0;
  for (const ticket of tickets) {
    let changed = false;
    for (const ps of ticket.problemsSolutions) {
      if (!ps.step) {
        ps.step = '[MISSING STEP]'; // or any default text
        changed = true;
      }
    }
    if (changed) {
      await ticket.save();
      fixedCount++;
      console.log(`Fixed ticket ${ticket._id}`);
    }
  }
  console.log(`Done. Fixed ${fixedCount} tickets.`);
  await mongoose.disconnect();
}

fixMissingSteps();
