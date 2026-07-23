import pandas as pd
import json
import re

file_path = 'C:\\\\WEB AFFILIATES\\\\products.xlsx'
df = pd.read_excel(file_path)

modified = False
for idx in df.index:
    val = df.loc[idx, 'features']
    if isinstance(val, str):
        try:
            json.loads(val)
        except json.JSONDecodeError:
            # Reemplazar las comillas dobles que están después de un número y antes de una letra (por ejemplo 15.9"L)
            # o que están después de un número y antes de Th (por ejemplo 1.02"Th)
            
            # Un regex más seguro: reemplazar cualquier comilla doble que NO esté 
            # al principio de la cadena `["`, al final `"]`, después de un coma `,"` o antes de dos puntos `":`
            
            # Sin embargo, como el problema específico es dimensiones como 15.9"L
            fixed_val = re.sub(r'(\d+(?:\.\d+)?)\"([a-zA-Z]+)', r'\1\"\2', val)
            
            # En Python, para meter un literal backslash en un JSON parseable debe estar doblemente escapado.
            # En la cadena JSON debe decir \". En Python `\\"`
            fixed_val = re.sub(r'(\d+(?:\.\d+)?)\"([a-zA-Z]+)', r'\1\\"\2', val)
            
            try:
                json.loads(fixed_val)
                df.loc[idx, 'features'] = fixed_val
                modified = True
                print(f"JSON corregido en la fila {idx}")
            except Exception as e:
                print(f"Fallo corregir fila {idx}: {e}")

if modified:
    df.to_excel(file_path, index=False)
    print("Archivo guardado con los JSON corregidos.")
