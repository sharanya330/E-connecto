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

async function testLogin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to database\n');

        const email = 'srybroiambusy@gmail.com';
        const password = 'soulmad16092005';

        console.log('🔍 Testing Login Flow:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Step 1: Find user
        console.log('Step 1: Finding user...');
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found!');
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('✅ User found');
        console.log('   - Name:', user.name);
        console.log('   - Email:', user.email);
        console.log('   - Role:', user.role);
        console.log('   - Has Password:', !!user.password);
        console.log('   - Password Hash:', user.password ? user.password.substring(0, 20) + '...' : 'N/A');
        console.log();

        // Step 2: Check password
        console.log('Step 2: Verifying password...');
        if (!user.password) {
            console.log('❌ User has no password set!');
            await mongoose.connection.close();
            process.exit(1);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('   - Password Match:', isMatch ? '✅ YES' : '❌ NO');
        console.log();

        if (isMatch) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('User Details:');
            console.log('   - ID:', user._id);
            console.log('   - Name:', user.name);
            console.log('   - Email:', user.email);
            console.log('   - Role:', user.role);
            console.log('   - Eco Points:', user.ecoPoints);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else {
            console.log('❌ LOGIN FAILED - Password mismatch');
            console.log('\nTrying to fix password...');
            const newHash = await bcrypt.hash(password, 10);
            user.password = newHash;
            await user.save();
            console.log('✅ Password reset! Try logging in again.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

testLogin();
