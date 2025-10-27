import { Types } from 'mongoose';
import { connectDatabase, closeDatabaseConnection } from './config/database.ts';
import { BrandSeeder } from './services/seeder.ts';
import { BrandTransformer, type RawDocument } from './services/transformer.ts';
import { BrandExporter } from './utils/export.ts';
import rawDocs from "../data/brands.json" with { type: "json" };
async function main() {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 Brand Data Transformation & Seeding Pipeline');
        console.log('='.repeat(60) + '\n');

        // Connect to database
        await connectDatabase();

        // Step 1: Transform existing data
        console.log('\n📍 STEP 1: Data Transformation');
        console.log('-'.repeat(60));
        const transformer = new BrandTransformer();
        await transformer.transformAll(rawDocs.map(d => ({ ...d, _id: new Types.ObjectId(d._id.$oid) })) as RawDocument[]);
        await transformer.verifyTransformation();

        // Step 2: Seed new data
        console.log('\n📍 STEP 2: Data Seeding');
        console.log('-'.repeat(60));
        const seeder = new BrandSeeder();
        await seeder.seedBrands();
        await seeder.generateExcelDocumentation();

        // Step 3: Export data
        console.log('\n📍 STEP 3: Data Export');
        console.log('-'.repeat(60));
        const exporter = new BrandExporter();
        await exporter.displayStatistics();
        await exporter.exportToJson();

        // Close connection
        await closeDatabaseConnection();

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TASKS COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60) + '\n');
        console.log('📂 Generated files:');
        console.log('   • data/brands-transformed.json');
        console.log('   • docs/seed-data-cases.xlsx\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Pipeline failed:', error);
        await closeDatabaseConnection();
        process.exit(1);
    }
}

main();
