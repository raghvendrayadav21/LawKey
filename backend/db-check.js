const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("legalplatform");
    const users = await db.collection("users").find({}).sort({_id: -1}).limit(5).toArray();
    console.log("LAST 5 DB USERS:");
    console.log(JSON.stringify(users, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
