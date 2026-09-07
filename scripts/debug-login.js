const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/e-connecto';

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    ecoPoints: Number,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function debugLogin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to database:', MONGODB_URI);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test both admin accounts
        const admins = [
            { email: 'admin@econnecto.com', password: 'admin123' },
            { email: 'srybroiambusy@gmail.com', password: 'soulmad16092005' }
        ];

        for (const testCreds of admins) {
            console.log(`\n🔍 Testing: ${testCreds.email}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            const user = await User.findOne({ email: testCreds.email });

            if (!user) {
                console.log('❌ User NOT FOUND in database');
                continue;
            }

            console.log('✅ User found');
            console.log('   Name:', user.name);
            console.log('   Email:', user.email);
            console.log('   Role:', user.role);
            console.log('   Has Password:', !!user.password);

            if (user.password) {
                const isMatch = await bcrypt.compare(testCreds.password, user.password);
                console.log('   Password Match:', isMatch ? '✅ YES' : '❌ NO');

                if (isMatch) {
                    console.log('\n   ✅ THIS ACCOUNT SHOULD WORK!');
                    console.log('   📧 Email:', testCreds.email);
                    console.log('   🔑 Password:', testCreds.password);
                }
            }
        }

        // List ALL users in database
        console.log('\n\n📋 ALL USERS IN DATABASE:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const allUsers = await User.find({}).select('name email role');
        allUsers.forEach((u, i) => {
            console.log(`${i + 1}. ${u.email} - ${u.role} - ${u.name}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

debugLogin();
