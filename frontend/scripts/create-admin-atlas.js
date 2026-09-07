const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use the ACTUAL database from .env.local
const MONGODB_URI = 'mongodb+srv://srybroiambusy_db_user:soulmad@e-connecto.sgfvk8h.mongodb.net/?appName=e-connecto';

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    ecoPoints: Number,
    verificationStatus: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdminInAtlas() {
    try {
        console.log('🔗 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        const admins = [
            {
                name: 'Admin',
                email: 'admin@econnecto.com',
                password: 'admin123'
            },
            {
                name: 'Admin',
                email: 'srybroiambusy@gmail.com',
                password: 'soulmad16092005'
            }
        ];

        for (const adminData of admins) {
            console.log(`\n📧 Creating/Updating: ${adminData.email}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Check if admin already exists
            let user = await User.findOne({ email: adminData.email });

            // Hash the password
            const hashedPassword = await bcrypt.hash(adminData.password, 10);

            if (user) {
                console.log('⚠️  User exists, updating...');
                user.password = hashedPassword;
                user.role = 'admin';
                user.name = adminData.name;
                user.verificationStatus = 'verified';
                await user.save();
                console.log('✅ Updated existing user to admin');
            } else {
                // Create new admin user
                user = await User.create({
                    name: adminData.name,
                    email: adminData.email,
                    password: hashedPassword,
                    role: 'admin',
                    ecoPoints: 0,
                    verificationStatus: 'verified'
                });
                console.log('✅ Created new admin user');
            }

            console.log('📧 Email:', adminData.email);
            console.log('🔑 Password:', adminData.password);
            console.log('👤 Role:', user.role);
        }

        console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ ADMIN ACCOUNTS CREATED IN ATLAS!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n📋 Admin Credentials:');
        console.log('\n1️⃣  Simple Admin:');
        console.log('   📧 Email:    admin@econnecto.com');
        console.log('   🔑 Password: admin123');
        console.log('\n2️⃣  Personal Admin:');
        console.log('   📧 Email:    srybroiambusy@gmail.com');
        console.log('   🔑 Password: soulmad16092005');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

createAdminInAtlas();
