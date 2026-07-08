const fs = require('fs');

const formatStr = "toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })";

const files = [
  'src/components/product/ROICalculator.tsx',
  'src/components/product/AIAnalysis.tsx',
  'src/components/matcher/HardwareMatcher.tsx',
  'src/components/compare/CompareTool.tsx',
  'src/components/catalog/ProductCard.tsx',
  'src/app/product/[id]/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace product.price.toLocaleString()
    content = content.replace(/\.price\.toLocaleString\(\)/g, '.price.' + formatStr);
    
    // Replace originalPrice.toLocaleString()
    content = content.replace(/originalPrice\.toLocaleString\(\)/g, 'originalPrice.' + formatStr);
    
    // Replace localPrice.toLocaleString()
    content = content.replace(/localPrice\.toLocaleString\(\)/g, 'localPrice.' + formatStr);

    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  } else {
    console.log('Not found: ' + file);
  }
});
