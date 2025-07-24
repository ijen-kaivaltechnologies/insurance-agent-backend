const { query } = require("../config/db");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const scriptsDir = path.join(__dirname);
  const files = fs.readdirSync(scriptsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(scriptsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`Running migration: ${file}`);
    try {
      await query(sql);
      console.log(`Success: ${file}`);
    } catch (err) {
      console.error(`Failed: ${file}`);
      throw err;
    }
  }
}

console.log("Migration started");
migrate()
  .then(() => {
    console.log("Migration complete");
  })
  .catch((err) => {
    console.log("Migration failed");
    console.log(err);
  });
