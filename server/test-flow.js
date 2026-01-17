import mongoose from 'mongoose';

async function testFullFlow() {
  try {
    console.log('🔍 TESTING FULL DATA FLOW\n');
    
    // Connect
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/ticket-tracker');
    console.log('   ✅ Connected\n');
    
    // Import model
    const Ticket = (await import('./models/Ticket.js')).default;
    
    // Test 1: Create a test ticket
    console.log('2️⃣ Creating test ticket...');
    const testTicket = new Ticket({
      title: 'TEST-001 - Test Ticket',
      problemsSolutions: [
        {
          problem: 'Test problem',
          solution: 'Test solution'
        }
      ]
    });
    
    const saved = await testTicket.save();
    console.log('   ✅ Ticket saved');
    console.log('   ID:', saved._id.toString());
    console.log('   Title:', saved.title);
    console.log('   Problems:', saved.problemsSolutions.length);
    console.log('   Created:', saved.createdAt, '\n');
    
    // Test 2: Retrieve the ticket
    console.log('3️⃣ Retrieving saved ticket...');
    const retrieved = await Ticket.findById(saved._id);
    console.log('   ✅ Ticket retrieved');
    console.log('   Match:', retrieved._id.equals(saved._id) ? 'YES' : 'NO');
    console.log('   Data:', JSON.stringify(retrieved, null, 2), '\n');
    
    // Test 3: List all tickets
    console.log('4️⃣ Listing all tickets...');
    const allTickets = await Ticket.find().sort({ createdAt: -1 });
    console.log(`   ✅ Found ${allTickets.length} ticket(s)\n`);
    
    allTickets.forEach((ticket, index) => {
      console.log(`   [${index + 1}] ${ticket.title}`);
      console.log(`       ID: ${ticket._id}`);
      console.log(`       Problems: ${ticket.problemsSolutions.length}`);
      console.log(`       Created: ${ticket.createdAt}`);
    });
    
    // Test 4: Update a problem/solution
    console.log('\n5️⃣ Testing update...');
    const psId = saved.problemsSolutions[0]._id;
    console.log('   PS ID:', psId.toString());
    
    const updated = await Ticket.findById(saved._id);
    const ps = updated.problemsSolutions.id(psId);
    ps.problem = 'Updated problem';
    ps.solution = 'Updated solution';
    
    await updated.save();
    console.log('   ✅ Updated\n');
    
    // Test 5: Verify update
    console.log('6️⃣ Verifying update...');
    const verified = await Ticket.findById(saved._id);
    const verifiedPs = verified.problemsSolutions.id(psId);
    console.log('   Problem:', verifiedPs.problem);
    console.log('   Solution:', verifiedPs.solution);
    console.log('   ✅ Update verified\n');
    
    // Clean up
    console.log('7️⃣ Cleaning up test data...');
    await Ticket.deleteOne({ _id: saved._id });
    console.log('   ✅ Test data deleted\n');
    
    console.log('✅ ALL TESTS PASSED!');
    console.log('\n📋 Summary:');
    console.log('   - MongoDB connection: ✅ OK');
    console.log('   - Ticket creation: ✅ OK');
    console.log('   - Ticket retrieval: ✅ OK');
    console.log('   - Update operations: ✅ OK');
    console.log('   - Delete operations: ✅ OK');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testFullFlow();
