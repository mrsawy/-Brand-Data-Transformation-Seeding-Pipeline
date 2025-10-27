# 🏢 Brand Data Transformation & Seeding

A TypeScript/Node.js application that transforms incorrect brand data, validates against a Mongoose schema, seeds test data, and exports the clean dataset.

## 🚀 Quick Start

### Prerequisites

- **Node.js v23+** (uses native TypeScript execution)
- **MongoDB** (local or Atlas)
- **pnpm** package manager

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/brand-transformation.git
cd brand-transformation

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI


```

### Usage

```bash
# Run complete pipeline (transform + seed + export)
pnpm start

# Or for development run
pnpm start:dev

```

## 📋 What It Does

1. **Transforms** 10 brand documents with schema errors:
   - Maps incorrect field names (`yearCreated` → `yearFounded`, `hqAddress` → `headquarters`)
   - Converts string numbers to numeric types
   - Handles null/invalid values with fallbacks
   - Updates in-place (maintains original `_id`)

2. **Seeds** 10 new test cases covering:
   - Boundary values (min/max years: 1600-2025)
   - Various business scales (1-20,000 locations)
   - Different time periods (1600s-present)

3. **Exports** clean data and generates Excel documentation

## 🛠 Tech Stack

- **Runtime:** Node.js v23+ (native TypeScript support)
- **Language:** TypeScript
- **Database:** MongoDB + Mongoose
- **Tools:** Faker.js, xlsx, dotenv
- **Package Manager:** pnpm

## 📁 Key Files

```
src/
├── models/Brand.ts           # Mongoose schema
├── services/
│   ├── transformer.ts        # Transformation logic
│   └── seeder.ts             # Seeding logic
└── index.ts                  # Main pipeline

data/
├── brands.json               # Original data
└── brands-transformed.json   # Final export

docs/
└── seed-data-cases.xlsx      # Test case documentation
```

## 🔄 Transformation Logic

| Field | Incorrect Names | Type Fix | Fallback |
|-------|----------------|----------|----------|
| `brandName` | `brand.name` | - | "Unknown Brand" |
| `yearFounded` | `yearCreated`, `yearsFounded` | String → Number | 1600 |
| `headquarters` | `hqAddress` | - | "Unknown Location" |
| `numberOfLocations` | - | String → Number | 1 |

## ✅ Verification

```bash
# Check results in MongoDB
mongosh
use brands_db
db.brands.countDocuments()  # Should be 20
db.brands.find().pretty()
```

## 📤 Output

- `data/brands-transformed.json` - 20 clean brand documents
- `docs/seed-data-cases.xlsx` - Test case documentation

## 🐛 Troubleshooting

**MongoDB connection error:**
```bash
# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**TypeScript execution issues:**
Ensure Node.js v23+ is installed:
```bash
node --version  # Should be v23.0.0 or higher
```


⭐ **Star this repo if you find it helpful!**
