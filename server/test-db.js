import mongoose from 'mongoose';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection URL: mongodb://localhost:27017/ticket-tracker');
    
    await mongoose.connect('mongodb://localhost:27017/ticket-tracker', {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Get database info
    const db = mongoose.connection.db;
    const stats = await db.stats();
    console.log('\n📊 Database Stats:');
    console.log('  Database Name:', stats.db);
    console.log('  Collections:', stats.collections);
    console.log('  Data Size:', stats.dataSize, 'bytes');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    if (collections.length === 0) {
      console.log('  (No collections yet)');
    } else {
      collections.forEach(col => {
        console.log('  -', col.name);
      });
    }
    
    // Check if tickets collection exists and show document count
    if (collections.some(col => col.name === 'tickets')) {
      const ticketsCollection = db.collection('tickets');
      const count = await ticketsCollection.countDocuments();
      console.log('\n🎫 Tickets Collection:');
      console.log('  Total documents:', count);
      
      if (count > 0) {
        const sample = await ticketsCollection.findOne();
        console.log('\n📄 Sample Ticket:');
        console.log(JSON.stringify(sample, null, 2));
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('  1. MongoDB is installed');
    console.error('  2. MongoDB service is running');
    console.error('  3. MongoDB is listening on port 27017');
    console.error('\nTo start MongoDB on Windows:');
    console.error('  - Check Services and start "MongoDB Server"');
    console.error('  - Or run: mongod');
    process.exit(1);
  }
}

testConnection();
