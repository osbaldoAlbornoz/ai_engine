const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../products.xlsx');

console.log('Reading products.xlsx...');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// Find headers
const headers = data[0];
const specsIndex = headers.indexOf('specs');

if (specsIndex === -1) {
  console.error("Could not find 'specs' column in the Excel file.");
  process.exit(1);
}

let fixesApplied = 0;

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row && row[specsIndex]) {
    try {
      let specs = JSON.parse(row[specsIndex]);
      const asin = specs.ASIN;

      let modified = false;

      // Fix ASIN B0H31SV27Y (Razer Blade 16)
      if (asin === 'B0H31SV27Y') {
        specs['CPU Model Number'] = 'Ultra 9 386H';
        specs['Video Processor'] = 'NVIDIA';
        specs['Graphics Coprocessor'] = 'NVIDIA GeForce RTX 5090';
        specs['Graphics Description'] = 'Dedicated';
        modified = true;
      }

      // Fix ASIN B0CQPXJFND (ASUS 4070 Ti Super)
      if (asin === 'B0CQPXJFND') {
        if (specs['Graphics Coprocessor'] === 'NVIDIA GeForce RTX 40740 Ti Super') {
          specs['Graphics Coprocessor'] = 'NVIDIA GeForce RTX 4070 Ti Super';
          modified = true;
        }
      }

      // Fix ASIN B0FWCQ2B6J (Dell Alienware 16X)
      if (asin === 'B0FWCQ2B6J') {
        if (specs['CPU Model Speed Maximum'] === '5400 GHz') {
          specs['CPU Model Speed Maximum'] = '5.4 GHz';
          modified = true;
        }
      }

      // Fix ASIN B0FFDDFW47 (ASUS TUF F16)
      if (asin === 'B0FFDDFW47') {
        if (specs['Hard-Drive Size'] === '512 TB') {
          specs['Hard-Drive Size'] = '512 GB';
          modified = true;
        }
      }

      // Fix ASIN B0DW1WX8H2 (ASUS ROG Strix SCAR 18)
      if (asin === 'B0DW1WX8H2') {
        if (!specs['Graphics Coprocessor']) {
          specs['Graphics Coprocessor'] = 'NVIDIA GeForce RTX 5090';
          modified = true;
        }
      }

      // Fix ASIN B0FY77GFRN (Lenovo Legion LOQ)
      if (asin === 'B0FY77GFRN') {
        if (!specs['Graphics Coprocessor']) {
          specs['Graphics Coprocessor'] = 'NVIDIA GeForce RTX 5050';
          modified = true;
        }
      }

      // Fix ASIN B0G2NVG9YS (Adamant Custom 12-Core)
      if (asin === 'B0G2NVG9YS') {
        if (specs['CPU Model Number'] === '100-000001368') {
          specs['CPU Model Number'] = 'AMD Ryzen 9 9900X3D';
          modified = true;
        }
      }

      if (modified) {
        row[specsIndex] = JSON.stringify(specs);
        fixesApplied++;
        console.log(`Fixed ASIN: ${asin}`);
      }

    } catch (e) {
      // Ignore parse errors, just means it's not a valid JSON string
    }
  }
}

if (fixesApplied > 0) {
  // Write back to the exact same file
  const newWorksheet = xlsx.utils.aoa_to_sheet(data);
  workbook.Sheets[sheetName] = newWorksheet;
  xlsx.writeFile(workbook, filePath);
  console.log(`\nSuccessfully applied ${fixesApplied} fixes directly to products.xlsx!`);
} else {
  console.log('No fixes were necessary or applied.');
}
