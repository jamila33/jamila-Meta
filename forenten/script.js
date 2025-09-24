document.addEventListener('DOMContentLoaded', function () {
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsCount = document.getElementById('resultsCount');
  const searchForm = document.getElementById('searchForm');
  const testConnectionBtn = document.getElementById('testConnection');
  const connectionStatus = document.getElementById('connectionStatus');

  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    performSearch();
  });

  testConnectionBtn.addEventListener('click', function () {
    testDatabaseConnection();
  });

  function performSearch() {
    const fileType = document.getElementById('fileType').value;
    const searchQuery = document.getElementById('searchQuery').value.trim();

    resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Söker...</p></div>';

    fetch(`http://localhost:3001/api/search?query=${encodeURIComponent(searchQuery)}&fileType=${fileType}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Nätverkssvar var inte ok');
        }
        return response.json();
      })
      .then(results => {
        displayResults(results);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        resultsContainer.innerHTML = '<p class="error">Ett fel uppstod under sökningen. Kontrollera att servern är igång.</p>';
      });
  }

  function displayResults(results) {
    resultsCount.textContent = `${results.length} resultat`;

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>Inga resultat hittades.</p>';
      return;
    }

    let resultsHTML = '';

    results.forEach(item => {
      if (item.artist || item.album) {
        // Musikresultat
        resultsHTML += `
          <div class="result-item" data-id="${item.id}">
            <div class="file-name">${item.filnamn}</div>
            <div><strong>Artist:</strong> ${item.artist}</div>
            <div><strong>Titel:</strong> ${item.title}</div>
            <div><strong>Album:</strong> ${item.album}</div>
            <div><strong>Längd:</strong> ${item.length}</div>
            <div><strong>År:</strong> ${item.metaData.year}</div>
            <div class="result-actions">
              <button class="view-button">Visa</button>
              <button class="download-button">Ladda ner</button>
              <button class="metadata-button">Metadata</button>
            </div>
          </div>
        `;
      } else if (item.company) {
        // PowerPoint-resultat
        resultsHTML += `
          <div class="result-item" data-id="${item.id}">
            <div class="file-name">${item.title}</div>
            <div><strong>Företag:</strong> ${item.company || 'Ingen information'}</div>
            <div><strong>Titel:</strong> ${item.title}</div>
            <div><strong>Filtyp:</strong> ${item.mimetype}</div>
            <div><strong>Original URL:</strong> <a href="${item.original}" target="_blank">${item.original}</a></div>
            <div><strong>Filstorlek:</strong> ${item.file_size} bytes</div>
            <div><strong>Skapad:</strong> ${new Date(item.creation_date).toLocaleDateString()}</div>
            <div><strong>Senast ändrad:</strong> ${new Date(item.last_modified).toLocaleDateString()}</div>
            <div class="result-actions">
              <button class="view-button">Visa</button>
              <button class="download-button">Ladda ner</button>
              <button class="metadata-button">Metadata</button>
            </div>
          </div>
        `;
      } else {
        // PDF eller bildresultat
        try {
          const itemMetadata = JSON.parse(item.metaData);
          resultsHTML += `
            <div class="result-item" data-id="${item.id}">
              <div class="file-name">${itemMetadata.title || itemMetadata.fileName}</div>
              <div><strong>Författare:</strong> ${itemMetadata.author || 'Ingen information'}</div>
              <div><strong>Skapad av:</strong> ${itemMetadata.creator || 'Ingen information'}</div>
              <div><strong>Senast ändrad:</strong> ${itemMetadata.modDate || 'Ingen information'}</div>
              <div><strong>Ämne:</strong> ${itemMetadata.subject || 'Ingen information'}</div>
              <div><strong>Nyckelord:</strong> ${itemMetadata.keywords || 'Ingen information'}</div>
              <div><strong>Antal sidor:</strong> ${itemMetadata.numPages || 'Ingen information'}</div>
              <div><strong>Producent:</strong> ${itemMetadata.producer || 'Ingen information'}</div>
              <div><strong>Skapat datum:</strong> ${itemMetadata.creationDate || 'Ingen information'}</div>
              <div class="result-actions">
                <button class="view-button">Visa</button>
                <button class="download-button">Ladda ner</button>
                <button class="metadata-button">Metadata</button>
              </div>
            </div>
          `;
        } catch (e) {
          console.error('Error parsing metaData:', e);
          resultsHTML += `
            <div class="result-item" data-id="${item.id}">
              <div class="file-name">Metadata kunde inte läsas</div>
            </div>
          `;
        }
      }
    });

    resultsContainer.innerHTML = resultsHTML;
    addEventListeners();
  }

  function addEventListeners() {
    document.querySelectorAll('.view-button').forEach(button => {
      button.addEventListener('click', function () {
        const item = this.closest('.result-item');
        const id = item.dataset.id;
        alert(`Visa objekt med ID: ${id}`);
      });
    });

    document.querySelectorAll('.download-button').forEach(button => {
      button.addEventListener('click', function () {
        const item = this.closest('.result-item');
        const id = item.dataset.id;
        alert(`Ladda ner objekt med ID: ${id}`);
      });
    });

    document.querySelectorAll('.metadata-button').forEach(button => {
      button.addEventListener('click', function () {
        const item = this.closest('.result-item');
        const id = item.dataset.id;
        alert(`Visa metadata för objekt med ID: ${id}`);
      });
    });
  }

  function testDatabaseConnection() {
    connectionStatus.innerHTML = '<div class="loading"><div class="spinner"></div><p>Testar anslutning...</p></div>';

    fetch('http://localhost:3001')
      .then(response => {
        if (!response.ok) {
          throw new Error('Kunde inte ansluta till servern');
        }
        return response.text();
      })
      .then(data => {
        connectionStatus.innerHTML = '<div class="success">Anslutning till servern lyckades!</div>';
        console.log('Server response:', data);
      })
      .catch(error => {
        console.error('Connection test failed:', error);
        connectionStatus.innerHTML = '<div class="error">Kunde inte ansluta till servern. Kontrollera att servern är igång.</div>';
      });
  }
}); 