import dbConnect from '../lib/db';
import User from '../models/User';
import bcrypt from 'bcryptjs';

async function createAdmin() {
    try {
        await dbConnect();
        console.log('✅ Connected to database');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'srybroiambusy@gmail.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);

            // Update to admin role if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin role');
            }

            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash('soulmad16092005', 10);

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'srybroiambusy@gmail.com',
            password: hashedPassword,
            role: 'admin',
            ecoPoints: 0,
            verificationStatus: 'verified'
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password: soulmad16092005');
        console.log('👤 Role:', admin.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nYou can now login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
