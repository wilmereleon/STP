# 📋 PLANTILLA EXCEL PARA TELEPROMPTER

## Estructura del Archivo Excel

Este documento describe la estructura del archivo `Excel/prompter_intro.xlsx` para importar scripts al teleprompter.

---

## 📊 Columnas Requeridas

### Hoja: "Scripts de Teleprompter"

| Columna | Nombre | Tipo | Obligatorio | Descripción |
|---------|--------|------|-------------|-------------|
| **A** | Número de Guion | Texto | ✅ Sí | Identificador único (ej: 001, 002, 003) |
| **B** | Título | Texto | ✅ Sí | Nombre descriptivo del script |
| **C** | Texto/Contenido | Texto largo | ✅ Sí | Script completo para el teleprompter |
| **D** | Duración (HH:MM:SS) | Tiempo | ❌ No | Tiempo estimado (ej: 00:01:30) |
| **E** | Notas | Texto | ❌ No | Anotaciones técnicas o recordatorios |

---

## 📝 Formato del Texto

El contenido puede incluir:

### Texto Normal
```
Este es el texto que leerá el locutor directamente.
Puede tener múltiples líneas.
```

### Formatos Especiales

#### **Negrita**
Para palabras importantes o nombres propios:
```
**María González** es la directora del proyecto.
El evento será el **15 de octubre**.
```

#### *Cursiva*
Para acotaciones del director o indicaciones:
```
*[Locutor en vivo]*
*[Cambio de tono - más serio]*
```

#### [MARCADORES]
Para saltos rápidos con macros:
```
[PAUSA]
[CORTE A VIDEO]
[REGRESO A ESTUDIO]
[CAM 1]
[CAM 2]
```

#### Emojis
Soportados para pronósticos y redes sociales:
```
🌤️ ☀️ ⛈️ 🌡️  → Para clima
📱 📘 📷 💻  → Para redes sociales
🎬 🎤 🎥 📹  → Para producción
```

---

## 🎯 Ejemplos de Scripts

### Ejemplo 1: Apertura de Noticiero

| Número | Título | Texto/Contenido | Duración | Notas |
|--------|--------|-----------------|----------|-------|
| 001 | Apertura del Noticiero | Buenas noches, les saluda **María González**.<br><br>Bienvenidos a Noticias 8 PM.<br><br>Estas son las principales noticias de hoy:<br>- El gobierno anuncia nuevas medidas económicas<br>- Se registra récord de vacunación en el país<br>- Mañana habrá lluvia en la región norte<br><br>Comenzamos con la información. | 00:00:45 | Usar tono entusiasta. Cámara 1. |

### Ejemplo 2: Noticia con Énfasis

| Número | Título | Texto/Contenido | Duración | Notas |
|--------|--------|-----------------|----------|-------|
| 002 | Noticia Economía | El Ministerio de Economía anunció hoy un paquete de medidas para incentivar el empleo.<br><br>Entre las principales acciones se encuentran:<br><br>**Reducción de impuestos** para pequeñas empresas.<br>*Subsidios directos* para sectores afectados.<br>Programas de capacitación gratuita.<br><br>[PAUSA]<br><br>Ahora pasamos con el reporte desde el terreno. | 00:01:30 | Insertar gráfico en segundo 20. |

### Ejemplo 3: Reportaje con Indicaciones Técnicas

| Número | Título | Texto/Contenido | Duración | Notas |
|--------|--------|-----------------|----------|-------|
| 003 | Reportaje Salud | **REPORTAJE: CAMPAÑA DE VACUNACIÓN**<br><br>*[Locutor en vivo]*<br><br>Hoy se alcanzó un hito histórico en la campaña de vacunación.<br><br>[CORTE A VIDEO]<br><br>Entrevista con la directora de salud pública:<br>"Estamos muy satisfechos con la respuesta de la ciudadanía."<br><br>[REGRESO A ESTUDIO]<br><br>Una excelente noticia para todos. | 00:02:15 | Video externo 45 seg. |

### Ejemplo 4: Pronóstico del Tiempo

| Número | Título | Texto/Contenido | Duración | Notas |
|--------|--------|-----------------|----------|-------|
| 004 | Pronóstico del Tiempo | Y ahora el clima con **Roberto Martínez**.<br><br>*[Cambio a set del clima]*<br><br>El pronóstico para mañana indica:<br><br>🌤️ Norte: lluvias moderadas<br>☀️ Centro: despejado 25°C<br>⛈️ Sur: tormentas eléctricas<br><br>Recomendamos llevar paraguas si salen temprano. | 00:01:00 | Animaciones del mapa. Chroma key. |

### Ejemplo 5: Cierre y Despedida

| Número | Título | Texto/Contenido | Duración | Notas |
|--------|--------|-----------------|----------|-------|
| 005 | Cierre y Despedida | Estas fueron las principales noticias de este martes.<br><br>Recuerden seguirnos en nuestras redes sociales:<br>📱 Twitter: @Noticias8PM<br>📘 Facebook: Noticias 8 PM Oficial<br><br>[PAUSA LARGA]<br><br>Gracias por su sintonía.<br>Les esperamos mañana a la misma hora.<br><br>**Buenas noches.**<br><br>[MÚSICA DE CIERRE] | 00:00:40 | Fade out progresivo. Créditos. |

---

## 💡 Consejos para Escribir Scripts

### ✅ Buenas Prácticas

1. **Usar saltos de línea** para facilitar la lectura del locutor
2. **Incluir pausas** con `[PAUSA]` o líneas vacías
3. **Marcar cambios de cámara** con `[CAM 1]`, `[CAM 2]`
4. **Indicar transiciones** con `[CORTE]`, `[FADE]`, `[DISOLVENCIA]`
5. **Resaltar nombres propios** con `**negrita**`
6. **Acotaciones en cursiva** como `*[voz seria]*`, `*[tono emotivo]*`

### ❌ Evitar

1. Párrafos muy largos sin espacios
2. Frases complicadas difíciles de leer
3. Abreviaturas confusas
4. Números sin contexto (mejor escribir "quince" que "15")
5. Palabras difíciles de pronunciar

---

## 🔄 Cómo Importar

### En el Teleprompter:

1. Ir al **Panel de Run Order** (panel izquierdo)
2. Click en botón **"Importar Excel"** (ícono 📥)
3. Seleccionar el archivo `.xlsx`
4. **Vista previa** de los datos
5. Confirmar importación
6. Todos los scripts se cargarán automáticamente en orden

### Validaciones Automáticas:

El sistema verificará:
- ✅ Que existan las columnas requeridas ("Título" y "Texto/Contenido")
- ✅ Que no haya filas vacías
- ✅ Formato de duración correcto (HH:MM:SS)
- ❌ Rechazará archivos mal formateados

---

## 🛠️ Crear el Archivo Excel

### Opción 1: Microsoft Excel

1. Abrir Excel
2. Crear nueva hoja llamada "Scripts de Teleprompter"
3. Primera fila (headers):
   - A1: `Número de Guion`
   - B1: `Título`
   - C1: `Texto/Contenido`
   - D1: `Duración (HH:MM:SS)`
   - E1: `Notas`
4. Agregar datos desde fila 2 en adelante
5. Guardar como `.xlsx`

### Opción 2: Google Sheets

1. Crear nueva hoja de cálculo
2. Configurar headers iguales
3. Agregar datos
4. Descargar como **Microsoft Excel (.xlsx)**

### Opción 3: LibreOffice Calc

1. Abrir Calc
2. Configurar headers
3. Agregar datos
4. Guardar como **Microsoft Excel 2007-365 (.xlsx)**

---

## 📐 Configuración Recomendada

### Anchos de Columna:

- **A (Número)**: 15 caracteres
- **B (Título)**: 30 caracteres
- **C (Texto)**: 80 caracteres (ajustar automáticamente)
- **D (Duración)**: 18 caracteres
- **E (Notas)**: 35 caracteres

### Formato de Celdas:

- **Headers**: Negrita, fondo azul (#366092), texto blanco
- **Texto**: Ajustar texto automáticamente (wrap text)
- **Alineación**: Superior izquierda
- **Bordes**: Líneas delgadas para todas las celdas

---

## 🎨 Plantilla Visual

```
╔═══════════════╦══════════════════════════════╦═══════════════════════════════════════════════╦═══════════════════╦═══════════════════════════╗
║ Número        ║ Título                       ║ Texto/Contenido                               ║ Duración          ║ Notas                     ║
║ de Guion      ║                              ║                                               ║ (HH:MM:SS)        ║                           ║
╠═══════════════╬══════════════════════════════╬═══════════════════════════════════════════════╬═══════════════════╬═══════════════════════════╣
║ 001           ║ Apertura del Noticiero       ║ Buenas noches, les saluda **María**...        ║ 00:00:45          ║ Tono entusiasta. Cámara 1 ║
╠═══════════════╬══════════════════════════════╬═══════════════════════════════════════════════╬═══════════════════╬═══════════════════════════╣
║ 002           ║ Noticia Economía             ║ El Ministerio de Economía anunció...          ║ 00:01:30          ║ Gráfico en segundo 20     ║
╠═══════════════╬══════════════════════════════╬═══════════════════════════════════════════════╬═══════════════════╬═══════════════════════════╣
║ 003           ║ Reportaje Salud              ║ **REPORTAJE:** Hoy se alcanzó...              ║ 00:02:15          ║ Video externo 45 seg      ║
╚═══════════════╩══════════════════════════════╩═══════════════════════════════════════════════╩═══════════════════╩═══════════════════════════╝
```

---

## 🔗 Integración con el Sistema

### Proceso de Importación (Backend):

```typescript
// 1. Usuario selecciona archivo
const file = inputElement.files[0];

// 2. ExcelImportService lee el archivo
const items = await excelImportService.importFromFile(file);

// 3. Se validan los datos
if (!items || items.length === 0) {
  throw new Error('No se encontraron datos válidos');
}

// 4. Se cargan al RunOrderStore
runOrderStore.setItems(items);

// 5. Se guarda en persistencia
await persistenceService.saveScripts(items);

// 6. Notificación al usuario
toast.success(`${items.length} scripts importados exitosamente`);
```

### Mapeo de Columnas:

| Excel                    | Sistema (RunOrderItem) |
|--------------------------|------------------------|
| Número de Guion          | id                     |
| Título                   | title                  |
| Texto/Contenido          | text                   |
| Duración (HH:MM:SS)      | duration               |
| Notas                    | notes                  |
| (auto)                   | status = 'ready'       |
| (auto)                   | createdAt = new Date() |
| (auto)                   | updatedAt = new Date() |

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar otros nombres de columnas?

Sí, el sistema detecta automáticamente variaciones como:
- "Número" / "Numero" / "ID"
- "Título" / "Titulo" / "Name" / "Nombre"
- "Texto" / "Contenido" / "Script" / "Text"
- "Duración" / "Duracion" / "Duration" / "Tiempo"

### ¿Cuántos scripts puedo importar?

No hay límite técnico. Se han probado archivos con más de 1000 scripts sin problemas.

### ¿Se pueden importar múltiples veces?

Sí. Cada importación **reemplaza** los scripts actuales. Se recomienda exportar antes de importar.

### ¿Se guardan automáticamente?

Sí, después de importar, los datos se guardan en IndexedDB automáticamente.

---

## 📦 Archivo de Ejemplo

Ubicación: `Excel/prompter_intro.xlsx`

Este archivo ya contiene:
- ✅ 5 scripts de ejemplo completos
- ✅ Formato profesional
- ✅ Hoja de instrucciones
- ✅ Estilos y colores configurados
- ✅ Listo para usar o modificar

**Puede descargarlo y usarlo como plantilla base.**

---

**Última actualización**: 2025-10-15  
**Versión del documento**: 1.0  
**Compatible con**: Teleprompter Pro v2.0+
