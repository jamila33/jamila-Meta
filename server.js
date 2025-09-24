const http = require('http');
const mysql = require('mysql');
const url = require('url');

const dbConfig = {
  host: '5.189.183.23',
  port: 4567,
  user: 'dm24-sthm-grupp11',
  password: 'BHSKH48445',
  database: 'dm24-sthm-grupp11',
};

// Skapa en MySQL-anslutning
const connection = mysql.createConnection(dbConfig);

// Anslut till databasen
connection.connect(err => {
  if (err) {
    console.error('Databasanslutning misslyckades:', err);
    return;
  }
  console.log('Ansluten till databasen');
});

// Skapa HTTP-server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const queryParams = parsedUrl.query;

  // Hantera CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (pathname === '/api/search') {
    // API-endpoint för sökning
    const searchQuery = queryParams.query || '';
    const fileType = queryParams.fileType || '';

    let query = '';

    if (fileType === 'music') {
      query = `
        SELECT id, filnamn, artist, title, album, length, metaData 
        FROM musicMetadata 
        WHERE title LIKE '%${searchQuery}%' 
           OR artist LIKE '%${searchQuery}%' 
           OR album LIKE '%${searchQuery}%'
           OR filnamn LIKE '%${searchQuery}%'
      `;
    } else if (fileType === 'powerpoint') {
      query = `
        SELECT id, fileName, title, company, creation_date, metaData 
        FROM powerpoints 
        WHERE fileName LIKE '%${searchQuery}%' 
           OR title LIKE '%${searchQuery}%' 
           OR company LIKE '%${searchQuery}%'
      `;
    } else if (fileType === 'pdf') {
      query = `
        SELECT id, fileName, metaData 
        FROM pdfMeta 
        WHERE fileName LIKE '%${searchQuery}%'
      `;
    } else if (fileType === 'image') {
      query = `
        SELECT id, fileName, metaData 
        FROM imageMetadata 
        WHERE fileName LIKE '%${searchQuery}%'
      `;
    } else {
      // Sök i alla tabeller om ingen specifik filtyp angavs
      query = `
        SELECT id, title AS name, album, length AS duration, metaData AS metadata, 'music' AS type FROM musicMetadata
        WHERE title LIKE '%${searchQuery}%' OR artist LIKE '%${searchQuery}%' OR album LIKE '%${searchQuery}%'
        UNION
        SELECT id, fileName AS name, NULL AS album, NULL AS duration, metaData AS metadata, 'powerpoint' AS type FROM powerpoints
        WHERE fileName LIKE '%${searchQuery}%' OR title LIKE '%${searchQuery}%'
        UNION
        SELECT id, fileName AS name, NULL AS album, NULL AS duration, metaData AS metadata, 'pdf' AS type FROM pdfMeta
        WHERE fileName LIKE '%${searchQuery}%'
        UNION
        SELECT id, fileName AS name, NULL AS album, NULL AS duration, metaData AS metadata, 'image' AS type FROM imageMetadata
        WHERE fileName LIKE '%${searchQuery}%'
      `;
    }

    connection.query(query, (error, results) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    });
  } else {
    // Standardrespons för andra endpoints
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write('<h1>Metadata Sökmotor API</h1>');
    res.write('<p>Använd /api/search?query=[sökterm]&fileType=[filtyp] för att söka</p>');
    res.end();
  }
});

// Starta servern
server.listen(3001, () => {
  console.log('Server running on port 3001');
});

// Stäng anslutningen när servern stängs
process.on('SIGINT', () => {
  connection.end(err => {
    if (err) {
      console.error('Fel vid stängning av anslutning:', err);
    }
    console.log('Anslutning stängd, servern stängs.');
    process.exit();
  });
});