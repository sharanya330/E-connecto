const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// MongoDB connection from .env.local
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

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createCustomAdmin() {
    try {
        console.log('\n🔧 Custom Admin Creator');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Get admin details from user
        const name = await question('Enter admin name: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password: ');

        console.log('\n🔗 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('⚠️  User with this email already exists!');
            console.log('Email:', existingUser.email);
            console.log('Current Role:', existingUser.role);

            const update = await question('\nUpdate to admin role? (yes/no): ');

            if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUser.password = hashedPassword;
                existingUser.role = 'admin';
                existingUser.name = name;
                existingUser.verificationStatus = 'verified';
                await existingUser.save();
                console.log('✅ Updated to admin!');
            } else {
                console.log('❌ Cancelled');
                await mongoose.connection.close();
                rl.close();
                process.exit(0);
            }
        } else {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new admin
            const admin = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'admin',
                ecoPoints: 0,
                verificationStatus: 'verified'
            });

            console.log('\n✅ Admin created successfully!');
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    ' + email);
        console.log('🔑 Password: ' + password);
        console.log('👤 Role:     admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        rl.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        rl.close();
        process.exit(1);
    }
}

createCustomAdmin();
