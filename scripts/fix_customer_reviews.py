import pandas as pd
import json
import re

file_path = 'C:\\\\WEB AFFILIATES\\\\products.xlsx'
df = pd.read_excel(file_path)

modified_count = 0

for index, row in df.iterrows():
    specs_str = row.get('specs', '{}')
    
    if not isinstance(specs_str, str):
        continue
        
    try:
        specs = json.loads(specs_str)
        if not isinstance(specs, dict):
            continue
    except json.JSONDecodeError:
        continue
        
    # Buscar keys que contengan "Customer Reviews" (case insensitive)
    review_key = None
    for k in specs.keys():
        if 'customer reviews' in k.lower():
            review_key = k
            break
            
    if review_key:
        review_val = str(specs[review_key])
        
        # Extraer el puntaje (ejemplo: 4.5) de la cadena original
        match = re.search(r'(\d+(?:\.\d+)?)\s*out of 5 stars', review_val, re.IGNORECASE)
        if match:
            new_val = f"{match.group(1)} out of 5 stars"
            
            # Solo actualizar si el valor cambió realmente para no hacer escrituras innecesarias
            if new_val != review_val:
                print(f"ASIN: {row.get('amazon_asin')} | Original: {review_val} -> Nuevo: {new_val}")
                specs[review_key] = new_val
                df.at[index, 'specs'] = json.dumps(specs)
                modified_count += 1

if modified_count > 0:
    df.to_excel(file_path, index=False)
    print(f"\nArchivo guardado exitosamente. Se corrigieron {modified_count} registros.")
else:
    print("\nNo se encontraron registros que necesitaran corrección.")
