/**
 * Script to manage users in the database
 * Run with: node scripts/list-users.js
 * 
 * To delete a user: node scripts/list-users.js delete user@email.com
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import User model
const User = require('../src/models/User');

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Helper function to list all users
async function listUsers() {
  try {
    const users = await User.find({}).select('email role name lastActive');
    console.log('\n=== Registered Users ===');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.name || 'N/A'}`);
      });
    }
    console.log('\nTotal users:', users.length);
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

// Helper function to delete a user by email
async function deleteUser(email) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`\nUser with email ${email} not found.`);
      return;
    }
    
    await User.deleteOne({ email });
    console.log(`\nUser ${email} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Parse command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Just list users if no arguments
    await listUsers();
  } else if (args[0] === 'delete' && args[1]) {
    // Delete user by email
    const email = args[1];
    await deleteUser(email);
    // Show updated list
    await listUsers();
  } else {
    console.log('Invalid command. Usage:');
    console.log('  - List users: node scripts/list-users.js');
    console.log('  - Delete user: node scripts/list-users.js delete user@email.com');
  }
  
  // Close MongoDB connection
  mongoose.connection.close();
}

// Run the script
main().catch(err => console.error(err)); 