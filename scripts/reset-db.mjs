// Deletes the local SQLite database. The next request re-creates and re-seeds it,
// with every date relative to that moment.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data");
let removed = 0;
for (const name of ["oneraise.db", "oneraise.db-wal", "oneraise.db-shm"]) {
  const file = path.join(dir, name);
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    removed++;
  }
}
console.log(removed ? "Database removed. It is re-seeded on the next request." : "No database to remove.");
