import pandas as pd
import json

def audit_and_clean_data(file_path):
    print("--- INICIANDO AUDITORÍA DE CALIDAD DE DATOS ---")
    df = pd.read_excel(file_path)
    
    issues = {
        'trailing_spaces': 0,
        'empty_values': {},
        'invalid_json': 0
    }
    
    # Columnas que deberían ser obligatorias
    mandatory_cols = ['amazon_asin', 'name', 'category', 'price', 'rating', 'reviews_count', 'image_url']
    json_cols = ['features', 'pros', 'cons', 'specs', 'gallery', 'affiliateLinks', 'benchmarks']
    
    # 1. Limpiar espacios en blanco en todos los campos string
    for col in df.columns:
        if df[col].dtype == 'object':
            # Contar celdas que tienen espacios adicionales al inicio/fin
            spaces_mask = df[col].dropna().apply(lambda x: isinstance(x, str) and (x != x.strip() or '  ' in x))
            if spaces_mask.any():
                count = spaces_mask.sum()
                issues['trailing_spaces'] += count
                # Limpiar la data: eliminar espacios inicio/fin y espacios dobles
                df[col] = df[col].apply(lambda x: " ".join(x.split()) if isinstance(x, str) else x)
                print(f"Limpidados espacios extra en {count} filas de la columna '{col}'")
                
    # 2. Encontrar valores vacíos/nulos
    for col in df.columns:
        # Contar NaN
        nan_count = df[col].isna().sum()
        # Contar strings vacíos
        empty_str_count = 0
        if df[col].dtype == 'object':
            empty_str_count = df[col].dropna().apply(lambda x: str(x).strip() == '').sum()
            
        total_empty = nan_count + empty_str_count
        if total_empty > 0:
            issues['empty_values'][col] = total_empty

    # 3. Validar los campos JSON
    for col in json_cols:
        if col in df.columns:
            for index, val in df[col].dropna().items():
                if isinstance(val, str) and val.strip() != "":
                    try:
                        parsed = json.loads(val)
                        # También verificar si está vacío (lista o dict)
                        if not parsed:
                            issues['empty_values'][col] = issues['empty_values'].get(col, 0) + 1
                    except json.JSONDecodeError:
                        issues['invalid_json'] += 1
                        print(f"JSON inválido en fila {index}, columna '{col}'")

    print("\n--- RESUMEN DE LA AUDITORÍA ---")
    print(f"- Espacios extra limpiados: {issues['trailing_spaces']} incidencias en total.")
    print(f"- JSONs inválidos encontrados: {issues['invalid_json']}")
    
    print("\n- Campos con valores vacíos o nulos:")
    for col, count in issues['empty_values'].items():
        if col in mandatory_cols:
            print(f"  - {col}: {count} vacíos (¡Campo importante!)")
        else:
            print(f"  - {col}: {count} vacíos")
            
    if issues['trailing_spaces'] > 0:
        df.to_excel(file_path, index=False)
        print("\nArchivo guardado con las limpiezas de espacios aplicadas.")
    else:
        print("\nEl archivo no tenía espacios en blanco irregulares, no se guardó sobreescritura.")

if __name__ == "__main__":
    audit_and_clean_data('C:\\\\WEB AFFILIATES\\\\products.xlsx')
