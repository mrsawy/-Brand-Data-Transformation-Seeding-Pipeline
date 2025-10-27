import { closeDatabaseConnection, connectDatabase } from "./config/database";
import { BrandTransformer } from "./services/transformer";



async function main() {
    try {
        // Connect to database
        await connectDatabase();

        // Create transformer instance
        const transformer = new BrandTransformer();

        // Transform all documents
        await transformer.transformAll();

        // Verify transformation
        await transformer.verifyTransformation();

        // Close connection
        await closeDatabaseConnection();

        console.log('✅ Transformation completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        await closeDatabaseConnection();
        process.exit(1);
    }
}

main();