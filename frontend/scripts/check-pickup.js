const mongoose = require('mongoose');
const MONGODB_URI = "mongodb+srv://karthik:kar123@cluster0.4k30v.mongodb.net/e-connecto?retryWrites=true&w=majority&appName=Cluster0";

async function checkPickup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // ID from the user's error log
        const id = '6921c10079e10a0e7be979f4';
        // Also check the other ID seen in logs: 6924455bdca81ca8b14a46bf
        const id2 = '6924455bdca81ca8b14a46bf';

        const pickup1 = await mongoose.connection.db.collection('pickups').findOne({ _id: new mongoose.Types.ObjectId(id) });
        console.log(`Pickup ${id}:`, pickup1 ? 'Found' : 'Not Found');

        const pickup2 = await mongoose.connection.db.collection('pickups').findOne({ _id: new mongoose.Types.ObjectId(id2) });
        console.log(`Pickup ${id2}:`, pickup2 ? 'Found' : 'Not Found');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkPickup();
