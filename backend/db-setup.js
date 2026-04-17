// ============================================================
// MongoDB Setup Script for Legal Platform
// Separate collections: lawyers + clients + deals
// Run with: mongosh mongodb://localhost:27017 db-setup.js
// ============================================================

print("🔧 Setting up Legal Platform Database...\n");

db = db.getSiblingDB("legalplatform");

// ============================================================
// DROP existing collections
// ============================================================
print("🗑️  Dropping existing collections...");
db.users.drop();
db.lawyers.drop();
db.clients.drop();
db.deals.drop();
print("✅ Collections dropped.\n");

// ============================================================
// CREATE COLLECTIONS
// ============================================================
print("📦 Creating collections...");
db.createCollection("lawyers");
db.createCollection("clients");
db.createCollection("deals");
print("✅ Collections created.\n");

// ============================================================
// CREATE INDEXES
// ============================================================
print("📐 Creating indexes...");

// lawyers collection
db.lawyers.createIndex({ username: 1 }, { unique: true });
db.lawyers.createIndex({ email: 1 },    { unique: true });
db.lawyers.createIndex({ specialization: 1 });

// clients collection
db.clients.createIndex({ username: 1 }, { unique: true });
db.clients.createIndex({ email: 1 },    { unique: true });

// deals collection
db.deals.createIndex({ clientId: 1 });
db.deals.createIndex({ lawyerId: 1 });
db.deals.createIndex({ dealStatus: 1 });

print("✅ Indexes created.\n");

// ============================================================
// SEED LAWYERS
// ============================================================
print("🌱 Seeding sample lawyers...");

// BCrypt hash of "Password@123"
const bcryptPassword = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVdBe/m.Wa";

db.lawyers.insertMany([
  {
    name: "Adv. Priya Sharma",
    email: "priya.sharma@legalplatform.com",
    username: "priya_sharma",
    password: bcryptPassword,
    specialization: "Criminal Law",
    experience: 12,
    location: "Mumbai, Maharashtra",
    fees: 5000.0
  },
  {
    name: "Adv. Rajesh Kumar",
    email: "rajesh.kumar@legalplatform.com",
    username: "rajesh_kumar",
    password: bcryptPassword,
    specialization: "Corporate Law",
    experience: 8,
    location: "Delhi, NCR",
    fees: 8000.0
  },
  {
    name: "Adv. Meena Patel",
    email: "meena.patel@legalplatform.com",
    username: "meena_patel",
    password: bcryptPassword,
    specialization: "Family Law",
    experience: 15,
    location: "Ahmedabad, Gujarat",
    fees: 4000.0
  },
  {
    name: "Adv. Arjun Nair",
    email: "arjun.nair@legalplatform.com",
    username: "arjun_nair",
    password: bcryptPassword,
    specialization: "Property Law",
    experience: 10,
    location: "Bangalore, Karnataka",
    fees: 6500.0
  },
  {
    name: "Adv. Sunita Reddy",
    email: "sunita.reddy@legalplatform.com",
    username: "sunita_reddy",
    password: bcryptPassword,
    specialization: "Civil Law",
    experience: 6,
    location: "Hyderabad, Telangana",
    fees: 3500.0
  }
]);

print("✅ 5 lawyers seeded into 'lawyers' collection.\n");

// ============================================================
// SEED CLIENTS
// ============================================================
print("🌱 Seeding sample clients...");

db.clients.insertMany([
  {
    name: "Rahul Verma",
    email: "rahul.verma@gmail.com",
    username: "rahul_verma",
    password: bcryptPassword
  },
  {
    name: "Anita Singh",
    email: "anita.singh@gmail.com",
    username: "anita_singh",
    password: bcryptPassword
  }
]);

print("✅ 2 clients seeded into 'clients' collection.\n");

// ============================================================
// VERIFY SETUP
// ============================================================
print("🔍 Verifying setup...\n");

const totalLawyers = db.lawyers.countDocuments();
const totalClients = db.clients.countDocuments();
const totalDeals   = db.deals.countDocuments();

print(`  ⚖️  Lawyers : ${totalLawyers}  (collection: 'lawyers')`);
print(`  👤 Clients : ${totalClients}  (collection: 'clients')`);
print(`  🤝 Deals   : ${totalDeals}  (collection: 'deals')`);

print("\n📋 Indexes on 'lawyers':");
db.lawyers.getIndexes().forEach(idx => print("  -", JSON.stringify(idx.key)));

print("\n📋 Indexes on 'clients':");
db.clients.getIndexes().forEach(idx => print("  -", JSON.stringify(idx.key)));

print("\n=============================================================");
print("  ✅ Database setup complete!");
print("  DB  : legalplatform");
print("  URI : mongodb://localhost:27017/legalplatform");
print("  Collections: lawyers | clients | deals");
print("=============================================================");
print("\n🔑 Login credentials for all sample users:");
print("   Password : Password@123");
print("   Lawyers  : priya_sharma / rajesh_kumar / meena_patel / arjun_nair / sunita_reddy");
print("   Clients  : rahul_verma / anita_singh");
