import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI;

    console.log('🔍 Attempting database connection...');
    console.log('📝 MONGO_URL/MONGODB_URI exists:', !!MONGODB_URI);

    if (!MONGODB_URI) {
        console.error('❌ MONGO_URL or MONGODB_URI environment variable is not defined!');
        throw new Error(
            'Please define the MONGO_URL or MONGODB_URI environment variable inside .env.local'
        );
    }

    if (cached.conn) {
        console.log('✅ Using cached database connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        console.log('🔗 Creating new database connection...');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ Database connected successfully!');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        console.error('❌ Database connection failed:', e);
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
