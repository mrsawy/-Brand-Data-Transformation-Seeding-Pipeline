import mongoose from 'mongoose';
import dotenv from 'dotenv';
import process from "node:process"

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');
        console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

export const closeDatabaseConnection = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
    }
};