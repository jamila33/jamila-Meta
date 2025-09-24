import fs from "fs";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "5.189.183.23",
  port: 4567,
  user: "dm24-sthm-grupp11",
  password: "BHSKH48445",
  database: "dm24-sthm-grupp11",
  charset: "utf8mb4" // viktigt för att undvika konverteringsfel
};

// Ta bort eller ersätt ogiltiga tecken för latin1
function sanitizeText(str) {
  if (str === undefined || str === null || str === "-") return null;
  str = String(str); // gör om till string
  return str.replace(/[^\x00-\x7F]/g, ""); // ta bort alla icke-ASCII tecken
}


// Konvertera ISO 8601 till MySQL DATETIME
function parseDate(dateStr) {
  if (!dateStr || dateStr === "-") return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 19).replace("T", " "); // YYYY-MM-DD HH:MM:SS
}

// Konvertera ISO 8601 till MySQL DATETIME
function parseTimestamp(ts) {
  if (!ts || ts === "-") return 0; // fallback istället för null
  const num = Number(ts.replace(",", ".")); // ersätt komma med punkt
  return isNaN(num) ? 0 : Math.floor(num); // returnera alltid ett heltal
}


// Konvertera fält som ska vara INT
function parseIntField(value) {
  if (!value || value === "-") return null;
  return parseInt(value, 10);
}

async function importPowerpoints() {
  const json = fs.readFileSync("./powerpointMetadata.csv.json", "utf-8"); // Kontrollera filnamnet
  const data = JSON.parse(json);

  const connection = await mysql.createConnection(dbConfig);

  for (let powerpointMetadata of data) {
    const fileName = powerpointMetadata.digest + ".ppt";

    // Ta bort onödiga fält
    delete powerpointMetadata.digest;
    delete powerpointMetadata.sha256;
    delete powerpointMetadata.sha512;

    console.log("📂", fileName, powerpointMetadata);

    await connection.execute(
      `INSERT INTO powerpoints 
   (fileName, urlkey, timestamp, original, mimetype, title, company, creation_date, last_modified, revision_number, slide_count, word_count, file_size, metadata) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileName,
        sanitizeText(powerpointMetadata.urlkey),
        parseTimestamp(powerpointMetadata.timestamp),
        sanitizeText(powerpointMetadata.original),
        sanitizeText(powerpointMetadata.mimetype),
        sanitizeText(powerpointMetadata.title),
        sanitizeText(powerpointMetadata.company),
        parseDate(powerpointMetadata.creation_date),
        parseDate(powerpointMetadata.last_modified),
        parseIntField(powerpointMetadata.revision_number),
        parseIntField(powerpointMetadata.slide_count),
        parseIntField(powerpointMetadata.word_count),
        parseIntField(powerpointMetadata.file_size),
        JSON.stringify(powerpointMetadata)
      ]
    );

  }

  await connection.end();
  console.log("✅ Import klar!");
}

importPowerpoints();
