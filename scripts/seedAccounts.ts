import "dotenv/config";
import mongoose, { Types } from "mongoose";
import Account from "../src/models/account.model";

// -------------  EDIT HERE  -----------------
const dummyAccounts = [
  { name: "Alice Sales" },
  { name: "Bob SDR" },
  { name: "Charlie Founder" },
];
// -------------------------------------------

async function main() {
  await mongoose.connect(process.env.MONGO_URI!, {
    // optional: { dbName: 'linkout' }
  });
  console.log("✅ Connected to MongoDB");

  // wipe existing docs to stay idempotent (optional)
  await Account.deleteMany({});
  const docs = await Account.insertMany(dummyAccounts);

  console.log("\n🎉 Inserted accounts:");
  docs.forEach((d) => {
    const id = (d._id as Types.ObjectId).toHexString(); // or simply d.id
    console.log(`• ${d.name.padEnd(15)}  _id: ${id}`);
  });
  console.log(
    '\nCopy any of those _id values into "accountIDs" when you POST /campaigns'
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
