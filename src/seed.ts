import { connectDatabase, closeDatabaseConnection } from './config/database';
import { BrandSeeder } from './services/seeder';

async function main() {
  try {
    // Connect to database
    await connectDatabase();

    // Create seeder instance
    const seeder = new BrandSeeder();

    // Seed brands
    await seeder.seedBrands();

    // Generate Excel documentation
    await seeder.generateExcelDocumentation();

    // Close connection
    await closeDatabaseConnection();

    console.log('✅ Seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await closeDatabaseConnection();
    process.exit(1);
  }
}

main();