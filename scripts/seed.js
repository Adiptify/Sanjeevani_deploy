const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sanjeevni';

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    // await mongoose.connection.db.dropDatabase();

    const Hospital = mongoose.model('Hospital', new mongoose.Schema({
        name: String,
        location: String,
        distance: String,
        facilities: [String]
    }));

    const hospitals = [
        { name: 'Apollo Hospital', location: 'Jubilee Hills, Hyderabad', distance: '2.5 km', facilities: ['Emergency', 'ICU', 'Lab', 'Pharmacy'] },
        { name: 'Yashoda Hospital', location: 'Somajiguda, Hyderabad', distance: '4.1 km', facilities: ['Emergency', 'Surgery', 'Lab', 'Imaging'] },
        { name: 'CARE Hospital', location: 'Banjara Hills, Hyderabad', distance: '3.8 km', facilities: ['Emergency', 'ICU', 'Cardiology', 'Pharmacy'] },
        { name: 'Continental Hospitals', location: 'Gachibowli, Hyderabad', distance: '6.2 km', facilities: ['Emergency', 'ICU', 'Surgery', 'Neurology', 'Lab'] }
    ];

    await Hospital.deleteMany({});
    await Hospital.insertMany(hospitals);
    console.log('Hospitals seeded');

    // Add a few doctors as Submissions/Users if needed
    // For now, let's just make sure we have hospitals.

    await mongoose.disconnect();
    console.log('Seeding complete');
}

// Check if running directly
if (require.main === module) {
    seed().catch(err => console.error(err));
}
