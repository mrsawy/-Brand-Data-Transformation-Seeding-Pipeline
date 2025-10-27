import mongoose from 'mongoose';
import Brand from '../models/Brand.ts';

export interface RawDocument {
    _id: mongoose.Types.ObjectId ;
    brandName?: string;
    yearFounded?: any;
    yearCreated?: any;
    yearsFounded?: any;
    headquarters?: string;
    hqAddress?: string;
    numberOfLocations?: any;
    brand?: any;
    [key: string]: any;
}

interface TransformedData {
    brandName: string;
    yearFounded: number;
    headquarters: string;
    numberOfLocations: number;
}

export class BrandTransformer {
    private readonly MIN_YEAR = 1600;
    private readonly CURRENT_YEAR = new Date().getFullYear();
    private readonly MIN_LOCATIONS = 1;

    /**
     * Extract and validate brandName from various possible fields
     */
    private extractBrandName(doc: RawDocument): string {
        // Check direct brandName field
        if (doc.brandName && typeof doc.brandName === 'string' && doc.brandName.trim()) {
            return doc.brandName.trim();
        }

        // Check nested brand.name
        if (doc.brand && typeof doc.brand === 'object' && doc.brand.name) {
            return doc.brand.name.trim();
        }

        // Fallback
        console.warn(`⚠️  Document ${doc._id}: No valid brandName found, using fallback`);
        return 'Unknown Brand';
    }

    /**
     * Extract and validate yearFounded from various possible fields
     */
    private extractYearFounded(doc: RawDocument): number {
        const fields = ['yearFounded', 'yearCreated', 'yearsFounded'];

        for (const field of fields) {
            const value = doc[field];

            // Skip null, undefined, or empty strings
            if (value === null || value === undefined || value === '') {
                continue;
            }

            // If it's already a number
            if (typeof value === 'number') {
                if (value >= this.MIN_YEAR && value <= this.CURRENT_YEAR) {
                    return value;
                }
            }

            // If it's a string, try to parse it
            if (typeof value === 'string') {
                const parsed = parseInt(value, 10);
                if (!isNaN(parsed) && parsed >= this.MIN_YEAR && parsed <= this.CURRENT_YEAR) {
                    return parsed;
                }
            }
        }

        // Fallback to minimum year
        console.warn(`⚠️  Document ${doc._id}: No valid yearFounded found, using ${this.MIN_YEAR}`);
        return this.MIN_YEAR;
    }

    /**
     * Extract and validate headquarters from various possible fields
     */
    private extractHeadquarters(doc: RawDocument): string {
        // Check headquarters field
        if (doc.headquarters && typeof doc.headquarters === 'string' && doc.headquarters.trim()) {
            return doc.headquarters.trim();
        }

        // Check hqAddress field
        if (doc.hqAddress && typeof doc.hqAddress === 'string' && doc.hqAddress.trim()) {
            return doc.hqAddress.trim();
        }

        // Fallback
        console.warn(`⚠️  Document ${doc._id}: No valid headquarters found, using fallback`);
        return 'Unknown Location';
    }

    /**
     * Extract and validate numberOfLocations
     */
    private extractNumberOfLocations(doc: RawDocument): number {
        const value = doc.numberOfLocations;

        // If it's already a valid number
        if (typeof value === 'number' && value >= this.MIN_LOCATIONS) {
            return value;
        }

        // If it's a string, try to parse it
        if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed) && parsed >= this.MIN_LOCATIONS) {
                return parsed;
            }
        }

        // Fallback to minimum
        console.warn(`⚠️  Document ${doc._id}: No valid numberOfLocations found, using ${this.MIN_LOCATIONS}`);
        return this.MIN_LOCATIONS;
    }

    /**
     * Transform a single document
     */
    private transformDocument(doc: RawDocument): TransformedData {
        return {
            brandName: this.extractBrandName(doc),
            yearFounded: this.extractYearFounded(doc),
            headquarters: this.extractHeadquarters(doc),
            numberOfLocations: this.extractNumberOfLocations(doc),
        };
    }

    /**
     * Get fields to unset (remove incorrect field names)
     */
    private getFieldsToUnset(doc: RawDocument): Record<string, string> {
        const fieldsToRemove: Record<string, string> = {};
        const correctFields = ['_id', 'brandName', 'yearFounded', 'headquarters', 'numberOfLocations', 'createdAt', 'updatedAt', '__v'];

        for (const key in doc) {
            if (!correctFields.includes(key)) {
                fieldsToRemove[key] = '';
            }
        }

        return fieldsToRemove;
    }

    /**
     * Transform all documents in the brands collection
     */
    async transformAll(rawDocs: RawDocument[] = []): Promise<void> {
        try {
            console.log('\n🔄 Starting brand data transformation...\n');

            // Get all documents from the collection (without using the model to avoid validation)
            const collection = mongoose.connection.collection('brands');
            if (rawDocs.length > 0) {
                await collection.insertMany(rawDocs)
            }
            const documents = await collection.find({}).toArray();

            console.log(`📊 Found ${documents.length} documents to transform\n`);

            let successCount = 0;
            let errorCount = 0;

            for (const doc of documents) {
                try {
                    console.log(`\n📝 Processing document: ${doc._id}`);
                    console.log(`   Original data:`, {
                        brandName: doc.brandName,
                        yearFounded: doc.yearFounded,
                        yearCreated: doc.yearCreated,
                        yearsFounded: doc.yearsFounded,
                        headquarters: doc.headquarters,
                        hqAddress: doc.hqAddress,
                        numberOfLocations: doc.numberOfLocations,
                        brand: doc.brand
                    });

                    // Transform the document
                    const transformedData = this.transformDocument(doc as RawDocument);

                    console.log(`   Transformed to:`, transformedData);

                    // Get fields to remove
                    const fieldsToUnset = this.getFieldsToUnset(doc as RawDocument);

                    // Build update operation
                    const updateOperation: any = {
                        $set: transformedData
                    };

                    // Only add $unset if there are fields to remove
                    if (Object.keys(fieldsToUnset).length > 0) {
                        updateOperation.$unset = fieldsToUnset;
                        console.log(`   Removing fields:`, Object.keys(fieldsToUnset));
                    }

                    // Update the document in-place (same _id)
                    await collection.updateOne(
                        { _id: doc._id },
                        updateOperation
                    );

                    // Validate the updated document using Mongoose model
                    const updatedDoc = await Brand.findById(doc._id);
                    if (updatedDoc) {
                        await updatedDoc.validate();
                        console.log(`   ✅ Document validated successfully`);
                        successCount++;
                    } else {
                        throw new Error('Document not found after update');
                    }

                } catch (error) {
                    console.error(`   ❌ Error transforming document ${doc._id}:`, error);
                    errorCount++;
                }
            }

            console.log('\n' + '='.repeat(60));
            console.log('📊 Transformation Summary:');
            console.log(`   ✅ Successfully transformed: ${successCount}`);
            console.log(`   ❌ Errors: ${errorCount}`);
            console.log(`   📦 Total documents: ${documents.length}`);
            console.log('='.repeat(60) + '\n');

        } catch (error) {
            console.error('❌ Error during transformation:', error);
            throw error;
        }
    }

    /**
     * Verify all documents are correctly transformed
     */
    async verifyTransformation(): Promise<void> {
        try {
            console.log('\n🔍 Verifying transformation...\n');

            const brands = await Brand.find({});

            console.log(`📊 Found ${brands.length} documents in brands collection\n`);

            let validCount = 0;
            let invalidCount = 0;

            for (const brand of brands) {
                try {
                    await brand.validate();
                    console.log(`✅ ${brand._id}: ${brand.brandName} - VALID`);
                    validCount++;
                } catch (error) {
                    console.error(`❌ ${brand._id}: INVALID -`, error);
                    invalidCount++;
                }
            }

            console.log('\n' + '='.repeat(60));
            console.log('📊 Verification Summary:');
            console.log(`   ✅ Valid documents: ${validCount}`);
            console.log(`   ❌ Invalid documents: ${invalidCount}`);
            console.log('='.repeat(60) + '\n');

        } catch (error) {
            console.error('❌ Error during verification:', error);
            throw error;
        }
    }
}