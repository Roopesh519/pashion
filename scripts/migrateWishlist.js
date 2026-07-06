const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://jovialmathewcloths:Jovial%40123@cluster0.wp3hl0k.mongodb.net/pashion?retryWrites=true&w=majority';

mongoose.connect(uri).then(async () => {
    const result = await mongoose.connection.db.collection('users').updateMany(
        { wishlist: { $exists: false } },
        { $set: { wishlist: [] } }
    );
    console.log(`Updated ${result.modifiedCount} users with missing wishlist field`);
    process.exit(0);
}).catch(e => {
    console.error(e.message);
    process.exit(1);
});
