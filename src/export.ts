import { connectDatabase, closeDatabaseConnection } from './config/database';
import { BrandExporter } from './utils/export.ts';

async function main() {
    try {
        // Connect to database
        await connectDatabase();

        // Create exporter instance
        const exporter = new BrandExporter();

        // Display statistics
        await exporter.displayStatistics();

        // Export to JSON
        await exporter.exportToJson();

        // Close connection
        await closeDatabaseConnection();

        console.log('✅ Export completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        await closeDatabaseConnection();
        process.exit(1);
    }
}

main();