#!/usr/bin/env python3
"""
Script para generar imágenes PNG desde archivos PlantUML
Requiere: plantuml.jar
"""

import os
import subprocess
import sys
from pathlib import Path

# Colores para output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓{Colors.END} {msg}")

def print_error(msg):
    print(f"{Colors.RED}✗{Colors.END} {msg}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ{Colors.END} {msg}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠{Colors.END} {msg}")

def check_plantuml():
    """Verificar si PlantUML está disponible"""
    # Intentar con comando directo
    try:
        result = subprocess.run(['plantuml', '-version'], 
                              capture_output=True, 
                              text=True,
                              timeout=5)
        if result.returncode == 0:
            print_success("PlantUML encontrado en PATH")
            return 'plantuml'
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    # Buscar plantuml.jar local
    possible_paths = [
        'plantuml.jar',
        '../plantuml.jar',
        '../../plantuml.jar',
        os.path.expanduser('~/plantuml.jar'),
        '/usr/local/bin/plantuml.jar',
    ]
    
    for jar_path in possible_paths:
        if os.path.exists(jar_path):
            print_success(f"PlantUML JAR encontrado en: {jar_path}")
            return jar_path
    
    print_error("PlantUML no encontrado")
    print_info("Descarga desde: https://plantuml.com/download")
    print_info("O instala con: sudo apt-get install plantuml (Linux)")
    print_info("O instala con: brew install plantuml (Mac)")
    return None

def generate_png(puml_file, plantuml_cmd):
    """Generar PNG desde archivo .puml"""
    puml_path = Path(puml_file)
    output_dir = puml_path.parent
    png_file = puml_path.with_suffix('.png')
    
    print_info(f"Procesando: {puml_path.name}")
    
    try:
        if plantuml_cmd == 'plantuml':
            # Comando directo
            cmd = [
                'plantuml',
                '-tpng',
                '-o', str(output_dir),
                str(puml_path)
            ]
        else:
            # Usando JAR
            cmd = [
                'java',
                '-jar', plantuml_cmd,
                '-tpng',
                '-o', str(output_dir),
                str(puml_path)
            ]
        
        result = subprocess.run(cmd, 
                              capture_output=True, 
                              text=True,
                              timeout=30)
        
        if result.returncode == 0 and png_file.exists():
            print_success(f"Generado: {png_file.name}")
            return True
        else:
            print_error(f"Error generando {puml_path.name}")
            if result.stderr:
                print(f"  Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print_error(f"Timeout procesando {puml_path.name}")
        return False
    except Exception as e:
        print_error(f"Excepción: {str(e)}")
        return False

def main():
    print("\n" + "="*50)
    print("🎨 GENERADOR DE DIAGRAMAS PNG DESDE PLANTUML")
    print("="*50 + "\n")
    
    # Verificar PlantUML
    plantuml_cmd = check_plantuml()
    if not plantuml_cmd:
        sys.exit(1)
    
    # Buscar archivos .puml
    base_dir = Path(__file__).parent.parent
    diagrams_dir = base_dir / 'database' / 'diagrams'
    
    if not diagrams_dir.exists():
        diagrams_dir.mkdir(parents=True, exist_ok=True)
        print_warning(f"Directorio creado: {diagrams_dir}")
    
    puml_files = list(diagrams_dir.glob('*.puml'))
    
    if not puml_files:
        print_warning("No se encontraron archivos .puml")
        print_info(f"Buscando en: {diagrams_dir}")
        
        # Buscar en otros directorios posibles
        alt_dirs = [
            base_dir / 'Diagramas para la refactorización',
            base_dir / 'database'
        ]
        
        for alt_dir in alt_dirs:
            if alt_dir.exists():
                alt_puml = list(alt_dir.glob('*.puml'))
                if alt_puml:
                    puml_files.extend(alt_puml)
                    print_info(f"Encontrados {len(alt_puml)} en {alt_dir}")
    
    if not puml_files:
        print_error("No se encontraron archivos .puml en ningún directorio")
        sys.exit(1)
    
    print_info(f"Archivos .puml encontrados: {len(puml_files)}\n")
    
    # Generar PNGs
    success_count = 0
    fail_count = 0
    
    for puml_file in puml_files:
        if generate_png(puml_file, plantuml_cmd):
            success_count += 1
        else:
            fail_count += 1
    
    # Resumen
    print("\n" + "="*50)
    print_success(f"Exitosos: {success_count}")
    if fail_count > 0:
        print_error(f"Fallidos: {fail_count}")
    print("="*50 + "\n")
    
    return 0 if fail_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
