import pandas as pd
import json

df = pd.read_excel('../products.xlsx')
missing_vram = []
vram_keys = set()

for index, row in df.iterrows():
    asin = str(row.get('amazon_asin', '')).strip()
    if not asin or asin == 'nan': continue
    
    specs_str = row.get('specs', '{}')
    try:
        specs = json.loads(specs_str) if isinstance(specs_str, str) else specs_str
        if not isinstance(specs, dict): specs = {}
    except:
        specs = {}
        
    found_vram = False
    for k, v in specs.items():
        k_lower = k.lower()
        if 'graphics card ram' in k_lower or 'graphics ram' in k_lower or 'video memory' in k_lower or 'vram' in k_lower or 'gpu ram' in k_lower:
            found_vram = True
            vram_keys.add(k)
            
    if not found_vram:
        missing_vram.append({'asin': asin, 'name': str(row.get('name'))[:50]})

print('Possible VRAM keys found:', vram_keys)
print(f'\nTotal products missing VRAM: {len(missing_vram)}')
for item in missing_vram:
    print(f"ASIN: {item['asin']} | {item['name']}")
