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

async function verifyAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to database\n');

        // Find admin user
        const admin = await User.findOne({ email: 'srybroiambusy@gmail.com' });

        if (!admin) {
            console.log('❌ Admin user not found!');
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('📋 Admin User Details:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Name:', admin.name);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Has Password:', !!admin.password);
        console.log('Password Hash Length:', admin.password ? admin.password.length : 0);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Test password
        const testPassword = 'soulmad16092005';
        const isMatch = await bcrypt.compare(testPassword, admin.password);

        console.log('🔐 Password Verification:');
        console.log('Testing password:', testPassword);
        console.log('Match:', isMatch ? '✅ YES' : '❌ NO');

        if (!isMatch) {
            console.log('\n⚠️  Password does not match! Updating password...');
            const newHash = await bcrypt.hash(testPassword, 10);
            admin.password = newHash;
            await admin.save();
            console.log('✅ Password updated successfully!');
            console.log('\nYou can now login with:');
            console.log('Email: srybroiambusy@gmail.com');
            console.log('Password: soulmad16092005');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

verifyAdmin();
