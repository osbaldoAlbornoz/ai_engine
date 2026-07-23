const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./scripts/extracted_data.json', 'utf-8'));

const inconsistencies = [];

data.forEach((product, index) => {
    let specObj = {};
    try {
        specObj = JSON.parse(product.specs);
    } catch (e) {
        return;
    }
    
    const name = product.name.toLowerCase();
    const issues = [];
    
    // 1. Check GPU matches
    const gpuMatch = name.match(/(rtx\s*\d{4}(\s*ti|\s*super)?|rx\s*\d{4}(\s*xt)?)/i);
    if (gpuMatch) {
        const gpuName = gpuMatch[0].replace(/\s+/g, '').toLowerCase(); // e.g. rtx5090
        
        let specGpuStr = (specObj['Graphics Coprocessor'] || '') + ' ' + (specObj['Graphics Description'] || '') + ' ' + (specObj['GPU Series'] || '');
        specGpuStr = specGpuStr.toLowerCase().replace(/\s+/g, '');
        
        if (specGpuStr && !specGpuStr.includes(gpuName)) {
            // Might be a mismatch
            if (gpuName === 'rtx4070tisuper' && specGpuStr.includes('40740')) {
                issues.push(`GPU name typo in specs: Name has ${gpuMatch[0]}, specs has: ${specObj['Graphics Coprocessor']}`);
            } else if (!specGpuStr.includes(gpuName.replace('super', 's'))) {
                issues.push(`GPU Mismatch: Name has ${gpuMatch[0]}, but specs say: ${specObj['Graphics Coprocessor']}`);
            }
        }
    }

    // 2. Check CPU matches
    const cpuMatch = name.match(/(i\d-\d{4,5}[H|K|F|X]*|ultra\s*\d\s*\d{3}[H|K|F|X]*|ryzen\s*\d\s*\d{4}[X|H|U|S]*3d?)/i);
    if (cpuMatch) {
        const cpuName = cpuMatch[0].replace(/\s+/g, '').toLowerCase();
        let specCpuStr = (specObj['CPU Model Number'] || '') + ' ' + (specObj['Processor Series'] || '');
        specCpuStr = specCpuStr.toLowerCase().replace(/\s+/g, '');
        
        if (specObj['CPU Model Number'] && !specCpuStr.includes(cpuName)) {
            // e.g. name has ultra 9 386h, specs has 5090
            issues.push(`CPU Mismatch: Name has ${cpuMatch[0]}, but specs say: ${specObj['CPU Model Number']}`);
        }
    }
    
    // 3. Check bizarre values
    if (specObj['Hard-Drive Size'] && specObj['Hard-Drive Size'].toLowerCase().includes('tb')) {
        const val = parseInt(specObj['Hard-Drive Size']);
        if (val > 10 && !name.toLowerCase().includes('server')) { // 512 TB
            issues.push(`Suspicious Hard-Drive Size: ${specObj['Hard-Drive Size']}`);
        }
    }
    
    if (specObj['CPU Model Speed Maximum'] && specObj['CPU Model Speed Maximum'].toLowerCase().includes('ghz')) {
        const val = parseFloat(specObj['CPU Model Speed Maximum']);
        if (val > 10) { // e.g. 5400 GHz
            issues.push(`Suspicious CPU Speed: ${specObj['CPU Model Speed Maximum']}`);
        }
    }
    
    if (specObj['Graphics Card Ram'] && specObj['Graphics Card Ram'].toLowerCase().includes('gb')) {
        const val = parseInt(specObj['Graphics Card Ram']);
        if (val > 48 && !name.toLowerCase().includes('pro 6000')) {
            issues.push(`Suspicious VRAM Size: ${specObj['Graphics Card Ram']}`);
        }
    }

    if (issues.length > 0) {
        inconsistencies.push({
            name: product.name,
            issues
        });
    }
});

fs.writeFileSync('./scripts/analysis_results.json', JSON.stringify(inconsistencies, null, 2));
console.log(`Found ${inconsistencies.length} products with potential inconsistencies.`);
