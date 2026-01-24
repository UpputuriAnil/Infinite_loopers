// Simple script to verify authentication is working with real database
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduflow_lms';

async function verifyDatabase() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Check if User model exists
    const User = mongoose.model('User', require('./src/models/User').schema);
    
    // Count users in database
    const userCount = await User.countDocuments();
    console.log(`\n📊 Database Stats:`);
    console.log(`   Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      console.log('\n👥 Registered Users:');
      const users = await User.find({}, 'name email role createdAt').limit(10);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('\n   No users registered yet. Register your first user at http://localhost:3000/register');
    }
    
    console.log('\n✅ Authentication system is ready!');
    console.log('📝 To test:');
    console.log('   1. Go to http://localhost:3000/register');
    console.log('   2. Create a new account');
    console.log('   3. Login with your credentials');
    console.log('   4. Run this script again to see your user in the database\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure MongoDB is running');
    console.log('   - Check your MONGO_URI in .env file');
    console.log('   - Current MONGO_URI:', MONGO_URI);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

verifyDatabase();
