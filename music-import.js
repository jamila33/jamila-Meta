// Importerar nödvändiga bibliotek
import fs from "fs"; // För filsystemoperationer
import path from "path"; // För att hantera filvägar
import * as mm from "music-metadata"; // För att extrahera metadata från musikfiler
import mysql from "mysql2/promise"; // MySQL med stöd för Promise

// Databasens inställningar
const dbConfig = {
  host: '5.189.183.23', // Databasens värd
  port: 4567, // Portnummer
  user: 'dm24-sthm-grupp11', // Användarnamn för databasen
  password: 'BHSKH48445', // Lösenord för databasen
  database: 'dm24-sthm-grupp11' // Databasnamn
};

// Funktion för att extrahera musikmetadata
async function extractMusicMetadata() {
  const musicDir = path.join(process.cwd(), "musik"); // Mappen där MP3-filerna finns
  const files = fs.readdirSync(musicDir).filter(file => file.endsWith(".mp3")); // Hämtar alla MP3-filer i mappen

  const connection = await mysql.createConnection(dbConfig); // Skapar en anslutning till databasen

  for (const file of files) {
    const fullPath = path.join(musicDir, file); // Fullständig sökväg till filen

    try {
      const metadata = await mm.parseFile(fullPath); // Extraherar metadata från filen
      const { artist = "Ingen titel", title = "Ingen författare", album = "Inget ämne" } = metadata.common; // Hämtar metadata
      const length = metadata.format.duration ? new Date(metadata.format.duration * 1000).toISOString().substr(11, 8) : '00:00:00'; // Längd i HH:MM:SS

      console.log("🎵 Hittad metadata:", { artist, title, album, length }); // Loggar den hittade metadata

      // Lagrar metadata i databasen
      await connection.execute(
        "INSERT INTO musicMetadata (filnamn, artist, title, album, length, metaData) VALUES (?, ?, ?, ?, ?, ?)",
        [file, artist, title, album, length, JSON.stringify({ artist, title, album, length })]
      );

      console.log(`✅ Metadata infogat för ${file}`); // Bekräftelse på att metadata har sparats
    } catch (error) {
      console.error(`❌ Fel vid ${file}:`, error.message); // Felhantering
    }
  }

  await connection.end(); // Stänger anslutningen till databasen
}

// Kör funktionen för att extrahera musikmetadata
extractMusicMetadata();