import { faker } from '@faker-js/faker';
import Brand from '../models/Brand.ts';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

interface SeedCase {
  caseNumber: number;
  brandName: string;
  yearFounded: number;
  headquarters: string;
  numberOfLocations: number;
  testPurpose: string;
  notes: string;
}

export class BrandSeeder {
  private seedCases: SeedCase[] = [];

  /**
   * Generate 10 different test cases for brand seeding
   */
  private generateSeedCases(): SeedCase[] {
    const currentYear = new Date().getFullYear();
    
    const cases: SeedCase[] = [
      {
        caseNumber: 1,
        brandName: faker.company.name(),
        yearFounded: 1600,
        headquarters: faker.location.city(),
        numberOfLocations: 100,
        testPurpose: 'Test minimum year boundary (1600)',
        notes: 'Oldest possible brand to test lower boundary validation'
      },
      {
        caseNumber: 2,
        brandName: faker.company.name(),
        yearFounded: 1850,
        headquarters: faker.location.city(),
        numberOfLocations: 250,
        testPurpose: 'Test historical brand from 1800s',
        notes: 'Victorian era brand, tests historical data handling'
      },
      {
        caseNumber: 3,
        brandName: faker.company.name(),
        yearFounded: 1920,
        headquarters: faker.location.city(),
        numberOfLocations: 500,
        testPurpose: 'Test early 20th century brand',
        notes: 'Post-WWI era brand, tests early modern period'
      },
      {
        caseNumber: 4,
        brandName: faker.company.name(),
        yearFounded: 1950,
        headquarters: faker.location.city(),
        numberOfLocations: 1000,
        testPurpose: 'Test mid-20th century brand',
        notes: 'Post-WWII boom era, tests modern brand establishment'
      },
      {
        caseNumber: 5,
        brandName: faker.company.name(),
        yearFounded: 2000,
        headquarters: faker.location.city(),
        numberOfLocations: 750,
        testPurpose: 'Test millennium era brand',
        notes: 'Dot-com era brand, tests recent historical data'
      },
      {
        caseNumber: 6,
        brandName: faker.company.name(),
        yearFounded: currentYear,
        headquarters: faker.location.city(),
        numberOfLocations: 50,
        testPurpose: 'Test current year boundary',
        notes: 'Brand founded this year, tests maximum year validation'
      },
      {
        caseNumber: 7,
        brandName: faker.company.name(),
        yearFounded: 2010,
        headquarters: faker.location.city(),
        numberOfLocations: 1,
        testPurpose: 'Test minimum locations boundary (1)',
        notes: 'Single location startup, tests lower boundary for locations'
      },
      {
        caseNumber: 8,
        brandName: faker.company.name(),
        yearFounded: 1980,
        headquarters: faker.location.city(),
        numberOfLocations: 50,
        testPurpose: 'Test small chain business',
        notes: 'Small regional chain, tests typical small business scale'
      },
      {
        caseNumber: 9,
        brandName: faker.company.name(),
        yearFounded: 1975,
        headquarters: faker.location.city(),
        numberOfLocations: 5000,
        testPurpose: 'Test large enterprise chain',
        notes: 'National chain, tests large-scale business operations'
      },
      {
        caseNumber: 10,
        brandName: faker.company.name(),
        yearFounded: 1965,
        headquarters: faker.location.city(),
        numberOfLocations: 20000,
        testPurpose: 'Test global mega-brand',
        notes: 'International corporation, tests maximum scale operations'
      }
    ];

    return cases;
  }

  /**
   * Seed the database with test data
   */
  async seedBrands(): Promise<void> {
    try {
      console.log('\n🌱 Starting brand seeding process...\n');

      // Generate seed cases
      this.seedCases = this.generateSeedCases();

      console.log(`📦 Generated ${this.seedCases.length} test cases\n`);

      let successCount = 0;
      let errorCount = 0;

      for (const seedCase of this.seedCases) {
        try {
          console.log(`📝 Seeding Case ${seedCase.caseNumber}:`);
          console.log(`   Brand: ${seedCase.brandName}`);
          console.log(`   Year: ${seedCase.yearFounded}`);
          console.log(`   HQ: ${seedCase.headquarters}`);
          console.log(`   Locations: ${seedCase.numberOfLocations}`);
          console.log(`   Purpose: ${seedCase.testPurpose}`);

          const brand = new Brand({
            brandName: seedCase.brandName,
            yearFounded: seedCase.yearFounded,
            headquarters: seedCase.headquarters,
            numberOfLocations: seedCase.numberOfLocations,
          });

          await brand.save();
          console.log(`   ✅ Successfully seeded\n`);
          successCount++;

        } catch (error) {
          console.error(`   ❌ Error seeding case ${seedCase.caseNumber}:`, error);
          errorCount++;
        }
      }

      console.log('='.repeat(60));
      console.log('📊 Seeding Summary:');
      console.log(`   ✅ Successfully seeded: ${successCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }

  /**
   * Generate Excel documentation for seed cases
   */
  async generateExcelDocumentation(): Promise<void> {
    try {
      console.log('\n📄 Generating Excel documentation...\n');

      // Prepare data for Excel
      const excelData = this.seedCases.map(seedCase => ({
        'Case Number': seedCase.caseNumber,
        'Brand Name': seedCase.brandName,
        'Year Founded': seedCase.yearFounded,
        'Headquarters': seedCase.headquarters,
        'Number of Locations': seedCase.numberOfLocations,
        'Test Purpose': seedCase.testPurpose,
        'Notes': seedCase.notes
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 },  // Case Number
        { wch: 35 },  // Brand Name
        { wch: 15 },  // Year Founded
        { wch: 25 },  // Headquarters
        { wch: 20 },  // Number of Locations
        { wch: 40 },  // Test Purpose
        { wch: 50 }   // Notes
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Seed Data Cases');

      // Ensure docs directory exists
      const docsDir = path.join(process.cwd(), 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }

      // Write to file
      const filePath = path.join(docsDir, 'seed-data-cases.xlsx');
      XLSX.writeFile(workbook, filePath);

      console.log(`✅ Excel documentation generated: ${filePath}\n`);

    } catch (error) {
      console.error('❌ Error generating Excel documentation:', error);
      throw error;
    }
  }
}