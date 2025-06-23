const fs = require('fs');
const pdf = require('pdf-parse');

// const fileName = '_data/2425_Genap_Fawwaz.pdf';
// const fileName = '_data/2425_Genap_Ara.pdf';
// const fileName = '_data/2425_Gasal_Ara.pdf';
const fileName = '_data/2425_Gasal_Fawwaz.pdf';

// let dataBuffer = fs.readFileSync(fileName);

async function extractTextFromPDF(fileName) {
  const dataBuffer = fs.readFileSync(fileName)
  const data = await pdf(dataBuffer);

  return data.text;
  // console.log(data.text);
}

function parseRows(texts) {
  // const patternRows = /(\d{1,2}[A-Z]{2,7}\d{0,6}\s*\d{1,2}\s*.*?(?:Senin|Selasa|Rabu|Kamis|Jumat){1},.*?Ruang\s*(?:Ruang [A-Za-z-0-9\/]+)?(?:\s+Belum ada ruang \d{1,2})?(?:\s*\d{1,2}[A-Z]{1,2}\d{1,2}))/g;
  // const patternRows = /(\d{1,2}\s*[A-Z]{2,7}\s*\d{0,6}\s*\d{1,2}\s*.*?\s*Kelas:.*?\s*Ruang.*?\s*[A-Za-z0-9\-]*.*?)/g;
  const patternRows = /(\d{1,2}[A-Z]{2,7}\d{4,6}.*?)(?=\d{1,2}[A-Z]{2,7}\d{4,6}|$)/g;

  try {
    const rows = texts.match(patternRows);
    return rows;
  }
  catch (error) {
    console.log(`Error while parsing rows: ${error}`);
    return null;
  }
}

function parseMataKuliah(texts) {
  const patternMataKuliah = /\d{1,2}\s*[A-Z]{2,7}\d{0,6}\s*\d{1,2}\s*(.*?)\s*Kelas/;

  try {
    const match = texts.match(patternMataKuliah);
    return match[1];
  }
  catch (error) {
    console.log(`Error while parsing mata_kuliah: ${error}`);
    return null;
  }
}

function parseKelas(texts) {
  const patternKelas = /Kelas:\s*(.*?)\s/;

  try {
    const match = texts.match(patternKelas);
    return match[1];
  }
  catch (error) {
    console.log(`Error while parsing kelas: ${error}`);
    return null;
  }
}

function parseHari(texts) {
  const patternHari = /(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu)/;

  try {
    const match = texts.match(patternHari);
    return match[1];
  }
  catch (error) {
    console.log(`Error while parsing hari: ${error}`);
    return null;
  }
}

function parseJam(texts) {
  const patternJam = /(\d{2}:\d{2}-\d{2}:\d{2})/;
  
  try {
    const match = texts.match(patternJam);
    return match[1];
  }
  catch (error) {
    console.log(`Error while parsing jam: ${error}`);
    return null;
  }
}

function parseRuangan(texts) {
  // const patternRuangan = /Ruang\s(.*?\s(?:[A-Za-z0-9\/])*$)/;
  const patternRuangan = /Ruang\s(.*?\s(?:[A-Za-z0-9\/])*)$/;
  
  try {
    const match = texts.match(patternRuangan);
    return match[1];
  }
  catch (error) {
    console.log(`Error while parsing ruangan: ${error}`);
    return null;
  }
}

// function removeUnwanted(texts) {
  // texts 
// }

async function main() {
  let texts = await extractTextFromPDF(fileName);
  texts = texts.replace(/\n/g, " ");
  console.log(texts);

  const rows = parseRows(texts);
  rows[rows.length - 1] = rows[rows.length - 1].replace('[FO.JADWAL KULIAH]', '');

  // rows.map(row => console.log(row));
  const mataKuliahArr = rows.map(row => parseMataKuliah(row));
  const kelasArr = rows.map(row => parseKelas(row));
  const hariArr = rows.map(row => parseHari(row));
  const jamArr = rows.map(row => parseJam(row));
  const ruanganArr = rows.map(row => parseRuangan(row));
  console.log(rows, `length: ${rows.length}`);
  console.log(mataKuliahArr, `length: ${mataKuliahArr.length}`);
  console.log(kelasArr, `length: ${kelasArr.length}`);
  console.log(hariArr, `length: ${hariArr.length}`);
  console.log(jamArr, `length: ${jamArr.length}`);
  console.log(ruanganArr, `length: ${ruanganArr.length}`);
}



main();