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

async function createSimpleAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to database\n');

        const adminEmail = 'admin@econnecto.com';
        const adminPassword = 'admin123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);

            // Update password and ensure admin role
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('✅ Updated admin credentials');
        } else {
            // Hash the password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Create admin user
            const admin = await User.create({
                name: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                ecoPoints: 0,
                verificationStatus: 'verified'
            });

            console.log('✅ Simple admin user created successfully!');
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    admin@econnecto.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role:     admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nYou can now login with these simple credentials!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

createSimpleAdmin();
