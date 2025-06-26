import fs from 'fs';

const filePath = './src/pages/prodotti/test.json';
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

const fields = ['energyClass', 'eprelCode', 'gtinCode', 'branchName'];

fields.forEach((field) => {
  const indexes = getRandomIndexes(data.length, 0.1);
  indexes.forEach((i) => {
    delete data[i][field];
  });
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log('test.json aggiornato con campi mancanti casuali.');

// const categories = [
//   'WASHINGMACHINES',
//   'WASHERDRIERS',
//   'OVENS',
//   'RANGEHOODS',
//   'DISHWASHERS',
//   'TUMBLEDRIERS',
//   'REFRIGERATINGAPPL',
//   'COOKINGHOBS',
// ];
// const energyClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// const arr = [
//   {
//     id: 0,
//     category: 'WASHINGMACHINES',
//     energyClass: 'A',
//     eprelCode: '1234567890',
//     gtinCode: '3001234567892',
//     branchName: '32675198_lavatrici_1.csv',
//   },
// ];

// const csvId = () => {
//   const numbers = '123456789';
//   let result = '';

//   for (let index = 0; index < 9; index++) {
//     const n = numbers[Math.floor(Math.random() * 8)];
//     result += n;
//   }

//   return result;
// };

// for (let i = 1; i < 190; i++) {
//   const cat = categories[Math.floor(Math.random() * categories.length)];
//   const energy = energyClasses[Math.floor(Math.random() * energyClasses.length)];
//   const eprel = (Math.floor(Math.random() * 9000000000) + 1000000000).toString();
//   const gtin = (3000000000000 + Math.floor(Math.random() * 1000000000000)).toString();
//   const branch = `${csvId()}_${cat.toLowerCase()}_${i + 1}.csv`;
//   arr.push({
//     id: i,
//     category: cat,
//     energyClass: energy,
//     eprelCode: eprel,
//     gtinCode: gtin,
//     branchName: branch,
//   });
// }

// fs.writeFileSync('src/pages/prodotti/test.json', JSON.stringify(arr, null, 2));
