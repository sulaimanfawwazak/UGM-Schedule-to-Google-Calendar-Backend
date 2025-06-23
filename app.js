const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const {
  parseRows,
  parseMataKuliah,
  parseKelas,
  parseHari,
  parseJam,
  parseRuangan,
  makeScheduleDict
} = require('./parse_data');

// Initialize Express app
const app = express();

// Cors configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    }
    else {
      cb(new Error("File must be a PDF"), false);
    }
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ status: welcome });
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Upload endpoint
app.post('/schedule-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file is uploaded" });
    }

    // Extract texts from PDF using pdf-parse
    const pdfBuffer = req.file.buffer;
    const data = await pdf(pdfBuffer);
    const texts = data.text.replace(/\n/g, " "); // Replace new lines with space

    console.log(texts);

    // Parse the rows
    const rows = parseRows(texts);

    const mataKuliahArr = rows.map(row => parseMataKuliah(row)); // Parse the Mata Kuliah
    const kelasArr = rows.map(row => parseKelas(row)); // Parse the Kelas
    const hariArr = rows.map(row => parseHari(row)); // Parse the Hari
    const jamArr = rows.map(row => parseJam(row)); // Parse the Jam
    const ruanganArr = rows.map(row => parseRuangan(row)); // Parse the Ruangan
    
    // Debug
    console.log(rows, `length: ${rows.length}`);
    console.log(mataKuliahArr, `length: ${mataKuliahArr.length}`);
    console.log(kelasArr, `length: ${kelasArr.length}`);
    console.log(hariArr, `length: ${hariArr.length}`);
    console.log(jamArr, `length: ${jamArr.length}`);
    console.log(ruanganArr, `length: ${ruanganArr.length}`);

    // Make the Schedule Array
    const scheduleArr = makeScheduleDict(
      mataKuliahArr,
      kelasArr,
      hariArr,
      jamArr,
      ruanganArr
    );

    console.log(scheduleArr);

    res.json({ schedule: scheduleArr });
  }
  catch (error) {
    console.error("Parsing error", error);
    res.status(500).json({ error: `Parsing failed: ${error.message}`});
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File is too large" });
    }
  }

  if (error.message === "File must be a PDF") {
    return res.status(400).json({ error: "File must be a PDF" });
  }

  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;