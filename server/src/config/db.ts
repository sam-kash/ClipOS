import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.warn('⚠️  MONGO_URI not set. Running without database connection.');
            console.warn('   Set MONGO_URI in .env file to enable database features.');
            return;
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(` MongoDB Connection Error: ${error.message}`);
        console.warn('   Continuing without database connection...');
        // Don't exit in development - allow server to run without DB
        // process.exit(1);
    }
};

export default connectDB;
