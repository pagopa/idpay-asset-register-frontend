import fs from 'fs';

function sanitizeJson() {
  const filePath = './src/pages/prodotti/mockdata.json';
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  function getRandomIndexes(length, percent) {
    const count = Math.floor(length * percent);
    const indexes = Array.from({ length }, (_, i) => i);
    for (let i = indexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }
    return indexes.slice(0, count);
  }

  const fields = ['categoria', 'classe_energetica', 'codice_eprel', 'codice_gtinean', 'lotto'];

  fields.forEach((field) => {
    const indexes = getRandomIndexes(data.length, 0.2);
    indexes.forEach((i) => {
      delete data[i][field];
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log('mockdata.json aggiornato con campi mancanti casuali!');
}

function createJson() {
  const filePath = 'src/pages/invitPanoramica/mockdata.json';
  const itemQty = 200;
  const maxRepetitions = 20;
  const manufacturers = [
    'Indesit',
    'Bosch',
    'Whirlpool',
    'Electrolux',
    'Samsung',
    'LG',
    'Candy',
    'Smeg',
    'Beko',
    'Miele',
    'Ariston',
    'Hotpoint',
    'Siemens',
    'Haier',
    'Gorenje',
    'Zanussi',
    'Panasonic',
    'Sharp',
    'Philips',
    'Hisense',
  ];

  const counts = {};
  manufacturers.forEach((m) => (counts[m] = 0));

  const arr = [];
  for (let i = 0; i < itemQty; i++) {
    let name;
    do {
      name = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    } while (counts[name] >= maxRepetitions);
    counts[name]++;
    arr.push({
      id: i,
      manufacturerName: name,
      dateCreation: `20${String(Math.floor(Math.random() * 25 + 1)).padStart(2, '0')}-${String(
        Math.floor(Math.random() * 12 + 1)
      ).padStart(2, '0')}-${String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0')}`,
      lastUpdate: `2025-${String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0')}-${String(
        Math.floor(Math.random() * 28 + 1)
      ).padStart(2, '0')}`,
      temporaryField: `<${100 + i}>`,
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(arr, null, 2));
}

// sanitizeJson()
createJson();
