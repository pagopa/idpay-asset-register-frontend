import fs from 'fs';

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
