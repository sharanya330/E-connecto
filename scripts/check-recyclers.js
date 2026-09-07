const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://karthik:kar123@cluster0.4k30v.mongodb.net/e-connecto?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

async function checkRecyclers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await mongoose.connection.db.collection('users').find({ role: 'recycler' }).toArray();

        console.log(`Found ${users.length} recyclers:`);
        users.forEach(u => {
            console.log(`- ID: ${u._id}`);
            console.log(`  Name: ${u.name}`);
            console.log(`  Email: ${u.email}`);
            console.log(`  Status: ${u.verificationStatus}`);
            console.log(`  Business: ${u.businessName}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkRecyclers();
