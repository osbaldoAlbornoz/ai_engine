const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('products.xlsx');
const sheet_name_list = workbook.SheetNames;
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

const extracted = data.map(row => {
  return {
    name: row.name || row.Name || row.NAME,
    specs: row.specs || row.Specs || row.SPECS || row.specifications || row.Specifications || row.SPECIFICATIONS
  };
});

fs.writeFileSync('scripts/extracted_data.json', JSON.stringify(extracted, null, 2), 'utf-8');
console.log("Done");
