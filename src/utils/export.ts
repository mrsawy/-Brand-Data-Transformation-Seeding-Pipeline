import * as fs from 'fs';
import * as path from 'path';
import Brand from '../models/Brand.ts';

export class BrandExporter {
  /**
   * Export brands collection to JSON file
   */
  async exportToJson(): Promise<void> {
    try {
      console.log('\n📤 Exporting brands collection...\n');

      // Fetch all brands
      const brands = await Brand.find({}).lean();

      console.log(`📊 Found ${brands.length} brands to export\n`);

      // Ensure data directory exists
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Write to file
      const filePath = path.join(dataDir, 'brands-transformed.json');
      fs.writeFileSync(filePath, JSON.stringify(brands, null, 2), 'utf-8');

      console.log(`✅ Brands exported successfully to: ${filePath}`);
      console.log(`📦 Total documents exported: ${brands.length}\n`);

    } catch (error) {
      console.error('❌ Error exporting brands:', error);
      throw error;
    }
  }

  /**
   * Display export statistics
   */
  async displayStatistics(): Promise<void> {
    try {
      console.log('\n📊 Collection Statistics:\n');

      const totalCount = await Brand.countDocuments();
      
      // Get year range
      const oldestBrand = await Brand.findOne().sort({ yearFounded: 1 });
      const newestBrand = await Brand.findOne().sort({ yearFounded: -1 });

      // Get location range
      const smallestBrand = await Brand.findOne().sort({ numberOfLocations: 1 });
      const largestBrand = await Brand.findOne().sort({ numberOfLocations: -1 });

      console.log(`   Total Brands: ${totalCount}`);
      console.log(`   Oldest Brand: ${oldestBrand?.brandName} (${oldestBrand?.yearFounded})`);
      console.log(`   Newest Brand: ${newestBrand?.brandName} (${newestBrand?.yearFounded})`);
      console.log(`   Smallest: ${smallestBrand?.brandName} (${smallestBrand?.numberOfLocations} locations)`);
      console.log(`   Largest: ${largestBrand?.brandName} (${largestBrand?.numberOfLocations} locations)`);
      console.log('');

    } catch (error) {
      console.error('❌ Error displaying statistics:', error);
      throw error;
    }
  }
}