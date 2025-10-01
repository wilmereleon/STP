# 📝 Scripts de Prueba para Teleprompter

Esta carpeta contiene scripts de ejemplo para probar las funcionalidades del sistema de teleprompter.

## 📋 Archivos Incluidos

1. **Script_01_Noticias_Matutinas.txt** - Formato noticiero tradicional
2. **Script_02_Programa_Especial_Tecnologia.txt** - Programa temático con entrevistas
3. **Script_03_Deportes_En_Vivo.txt** - Cobertura deportiva con estadísticas

## 🔤 Notación y Formato

### Marcadores de Salto [N]

Los marcadores numéricos entre corchetes `[N]` se usan para crear puntos de navegación rápida en el script:

```
[1] TÍTULO DE LA SECCIÓN
[2] OTRA SECCIÓN
[3] SIGUIENTE SECCIÓN
```

**Funcionalidad:**
- Permiten saltar rápidamente entre secciones con atajos de teclado
- Se usan para marcar cambios de tema o segmentos
- Aparecen como puntos de navegación en el teleprompter

### Formato de Texto con Markdown

#### Negritas
```
**TEXTO EN NEGRITAS**
```
Se usa para:
- Títulos de secciones importantes
- Palabras clave que deben enfatizarse
- Nombres de personas o lugares destacados

#### Cursivas
```
*Texto en cursivas*
```
Se usa para:
- Énfasis suave
- Citas textuales
- Comentarios adicionales

#### Combinación
```
**TÍTULO PRINCIPAL**
[1] SECCIÓN INICIAL
*Subtítulo o comentario en cursiva*
```

## 📊 Estructura Recomendada de Scripts

### Esquema Básico:
```
[1] APERTURA/INTRODUCCIÓN
    - Saludo inicial
    - Presentación del tema
    
[2] DESARROLLO PARTE 1
    **SUBTEMA A**
    - Contenido
    - Detalles
    
[3] DESARROLLO PARTE 2
    **SUBTEMA B**
    - Más contenido
    
[4] CIERRE/DESPEDIDA
    - Resumen
    - Agradecimientos
    - Llamado a la acción
```

## 🎯 Casos de Uso para Pruebas

### Script 01 - Noticias Matutinas
**Propósito:** Probar navegación básica y formato simple
- 5 marcadores [1] a [5]
- Mezcla de negritas y cursivas
- Contenido corto a medio

**Ideal para probar:**
- ✅ Carga de scripts
- ✅ Navegación entre marcadores
- ✅ Formato de texto básico
- ✅ Auto-avance al finalizar

### Script 02 - Programa Especial Tecnología
**Propósito:** Probar navegación compleja y contenido extenso
- 7 marcadores [1] a [7]
- Listas numeradas
- Secciones con múltiples subsecciones
- Contenido largo

**Ideal para probar:**
- ✅ Desplazamiento fluido en textos largos
- ✅ Saltos precisos entre muchos marcadores
- ✅ Formato complejo (listas, negritas, cursivas)
- ✅ Rendimiento con contenido extenso

### Script 03 - Deportes En Vivo
**Propósito:** Probar máxima complejidad de navegación
- 10 marcadores [1] a [10]
- Tablas de datos (simuladas con formato)
- Múltiples subsecciones
- Contenido muy estructurado

**Ideal para probar:**
- ✅ Navegación con muchos puntos de salto
- ✅ Lectura de datos tabulares
- ✅ Cambios rápidos de velocidad
- ✅ Uso intensivo de atajos de teclado

## 🚀 Cómo Usar estos Scripts

### En Modo Web (npm run dev):

1. Abrir el teleprompter en `http://localhost:5173/`
2. En el panel "Run Order", hacer clic en "Importar Scripts (.txt)"
3. Seleccionar uno o varios de estos archivos
4. Los scripts se cargarán automáticamente

### En Versión Electron Instalada:

1. Abrir la aplicación instalada
2. Usar el botón "Importar" o arrastrar los archivos
3. Seleccionar desde la carpeta `test-scripts/`

### Carga Múltiple:

Puedes seleccionar los 3 archivos a la vez:
- Ctrl+Click para selección múltiple en Windows
- Los scripts se ordenarán alfabéticamente
- Aparecerán en el Run Order listos para usar

## 🔍 Verificaciones Sugeridas

Cuando uses estos scripts para probar, verifica:

### ✅ Navegación
- [ ] Los marcadores [N] aparecen correctamente
- [ ] Los saltos entre marcadores son precisos
- [ ] Los atajos de teclado funcionan (siguiente/anterior cue)

### ✅ Formato
- [ ] **Negritas** se visualizan correctamente
- [ ] *Cursivas* se visualizan correctamente
- [ ] El espaciado entre líneas es adecuado

### ✅ Desplazamiento
- [ ] El scroll es suave y sin saltos
- [ ] La velocidad se puede ajustar fluidamente
- [ ] La posición de la línea guía es correcta

### ✅ Funcionalidad
- [ ] Play/Pause funciona correctamente
- [ ] Reset vuelve al inicio
- [ ] Auto-avance al siguiente script funciona
- [ ] La ventana flotante sincroniza correctamente

## 📝 Crear tus Propios Scripts

Para crear scripts personalizados:

1. **Usa cualquier editor de texto** (Notepad, VS Code, etc.)
2. **Guarda con codificación UTF-8** (para acentos y ñ)
3. **Usa la extensión .txt**
4. **Sigue el formato:**
   ```
   [1] PRIMERA SECCIÓN
   Contenido de texto normal.
   
   **SUBTÍTULO EN NEGRITAS**
   Más contenido con *énfasis en cursiva*.
   
   [2] SEGUNDA SECCIÓN
   Continúa el contenido...
   ```

## 🎨 Tips de Formato

### Para Mejor Legibilidad:
- Usa MAYÚSCULAS en títulos principales
- Deja líneas en blanco entre secciones
- No abuses de las negritas (solo para destacar)
- Usa marcadores cada 2-3 minutos de lectura

### Longitud Recomendada:
- **Script Corto:** 200-500 palabras (1-2 minutos)
- **Script Medio:** 500-1000 palabras (3-5 minutos)
- **Script Largo:** 1000+ palabras (5+ minutos)

## 🐛 Solución de Problemas

### Los marcadores [N] no funcionan:
- Asegúrate de usar corchetes `[]` no paréntesis `()`
- Deben estar al inicio de una línea
- Deben tener un espacio después: `[1] TÍTULO`

### El formato no se ve:
- Verifica que usaste `**` para negritas (doble asterisco)
- Verifica que usaste `*` para cursivas (un asterisco)
- No dejes espacios: `**texto**` ✅ | `** texto **` ❌

### Acentos o ñ se ven mal:
- Guarda el archivo con codificación UTF-8
- En Notepad: "Guardar como" → Codificación: UTF-8

## 📚 Recursos Adicionales

- Ver `PRUEBAS_FUNCIONALES.md` para casos de prueba completos
- Ver `test-form.html` para formulario de pruebas interactivo
- Ver `README.md` para documentación general del sistema

---

**© 2025 Sistema de Teleprompter - Scripts de Prueba**
