import pandas as pd
import json
import os

df = pd.read_excel('../products.xlsx')
categories = ['laptops', 'desktops', 'workstations']

missing = []

for index, row in df.iterrows():
    asin = str(row.get('amazon_asin', '')).strip()
    if not asin or asin == 'nan': continue
    cat = str(row.get('category', '')).lower()
    
    # Only check laptops, desktops, workstations
    if not any(c in cat for c in categories): continue
    
    name = str(row.get('name', ''))[:40]
    specs_str = row.get('specs', '{}')
    try:
        specs = json.loads(specs_str) if isinstance(specs_str, str) else specs_str
        if not isinstance(specs, dict): specs = {}
    except:
        specs = {}
        
    keys_lower = [k.lower() for k in specs.keys()]
    
    # Define keywords for each category
    has_ram = any(x in keys_lower for x in ['ram memory installed', 'computer memory size', 'ram', 'system ram', 'memory'])
    has_storage = any(x in keys_lower for x in ['hard-drive size', 'hard disk size', 'storage', 'flash memory size', 'ssd', 'hdd'])
    has_cpu = any(x in keys_lower for x in ['cpu model', 'cpu model number', 'processor type', 'processor series', 'processor brand', 'processor'])
    
    missing_fields = []
    if not has_ram: missing_fields.append('RAM')
    if not has_storage: missing_fields.append('Storage')
    if not has_cpu: missing_fields.append('CPU')
    
    if missing_fields:
        missing.append({
            'asin': asin,
            'name': name,
            'missing': missing_fields
        })

print(f"Total de equipos completos analizados: {len([r for r in df['category'] if any(c in str(r).lower() for c in categories)])}")
print(f"Equipos con campos faltantes: {len(missing)}")
for m in missing:
    print(f"- ASIN: {m['asin']} | {m['name']} | Falta: {', '.join(m['missing'])}")
