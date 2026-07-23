import pandas as pd
import json
import re

filePath = 'C:\\\\WEB AFFILIATES\\\\products.xlsx'
df = pd.read_excel(filePath)
categories = ['laptops', 'desktops', 'workstations']

fixed_asins = []

for index, row in df.iterrows():
    asin = str(row.get('amazon_asin', '')).strip()
    if not asin or asin == 'nan': continue
    cat = str(row.get('category', '')).lower()
    
    # Only process specific categories
    if not any(c in cat for c in categories): continue
    
    # Barebones don't have RAM or SSD
    if asin in ['B0G6CW4L71', 'B0DHVMZLSP']: continue
    
    name = str(row.get('name', ''))
    specs_str = row.get('specs', '{}')
    
    try:
        specs = json.loads(specs_str) if isinstance(specs_str, str) else specs_str
        if not isinstance(specs, dict): specs = {}
    except:
        specs = {}
        
    keys_lower = [k.lower() for k in specs.keys()]
    
    has_ram = any(x in keys_lower for x in ['ram memory installed', 'computer memory size', 'ram', 'system ram', 'memory'])
    has_storage = any(x in keys_lower for x in ['hard-drive size', 'hard disk size', 'storage', 'flash memory size', 'ssd', 'hdd'])
    
    modified = False
    
    # Attempt to extract RAM from title if missing
    if not has_ram:
        # Looking for patterns like "32GB RAM", "64 GB DDR5", "128GB Memory"
        ram_match = re.search(r'(\d+)\s*GB\s*(?:DDR\d|RAM|Memory|LPDDR\d)', name, re.IGNORECASE)
        if ram_match:
            ram_val = ram_match.group(1) + " GB"
            specs['RAM Memory Installed'] = ram_val
            modified = True
            print(f"Extracted RAM for {asin}: {ram_val}")
            
    # Attempt to extract Storage from title if missing
    if not has_storage:
        # Looking for patterns like "1TB SSD", "2 TB NVMe", "512GB PCIe"
        storage_match = re.search(r'(\d+)\s*(TB|GB)\s*(?:SSD|NVMe|PCIe|Hard Drive)', name, re.IGNORECASE)
        if storage_match:
            storage_val = storage_match.group(1) + " " + storage_match.group(2)
            specs['Hard-Drive Size'] = storage_val
            modified = True
            print(f"Extracted Storage for {asin}: {storage_val}")

    if modified:
        df.at[index, 'specs'] = json.dumps(specs)
        fixed_asins.append(asin)

if fixed_asins:
    df.to_excel(filePath, index=False)
    print(f"\n✅ Excel file updated successfully with {len(fixed_asins)} products fixed!")
else:
    print("\nNo fixes were applied.")
    
# --- RE-CHECK COMPLETENESS ---
print("\n--- RE-CHECKING COMPLETENESS ---")
missing_after = []
for index, row in df.iterrows():
    asin = str(row.get('amazon_asin', '')).strip()
    if not asin or asin == 'nan': continue
    cat = str(row.get('category', '')).lower()
    if not any(c in cat for c in categories): continue
    
    if asin in ['B0G6CW4L71', 'B0DHVMZLSP']: continue # Ignore barebones
    
    name = str(row.get('name', ''))[:40]
    specs_str = row.get('specs', '{}')
    try:
        specs = json.loads(specs_str) if isinstance(specs_str, str) else specs_str
        if not isinstance(specs, dict): specs = {}
    except:
        specs = {}
        
    keys_lower = [k.lower() for k in specs.keys()]
    has_ram = any(x in keys_lower for x in ['ram memory installed', 'computer memory size', 'ram', 'system ram', 'memory'])
    has_storage = any(x in keys_lower for x in ['hard-drive size', 'hard disk size', 'storage', 'flash memory size', 'ssd', 'hdd'])
    
    missing_fields = []
    if not has_ram: missing_fields.append('RAM')
    if not has_storage: missing_fields.append('Storage')
    
    if missing_fields:
        missing_after.append(f"- ASIN: {asin} | {name} | Sigue faltando: {', '.join(missing_fields)}")

if not missing_after:
    print("✨ EXCELENTE: Todos los equipos tienen ahora RAM y Almacenamiento.")
else:
    print(f"Aún quedan {len(missing_after)} equipos con faltantes:")
    for m in missing_after:
        print(m)
