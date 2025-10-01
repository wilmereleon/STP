# 📋 Documento de Pruebas Funcionales - Teleprompter Pro
## Pruebas de Caja Negra (Black Box Testing)

**Versión:** 1.0.0  
**Fecha:** Enero 2025  
**Tipo de Prueba:** Funcional / End-to-End  
**Objetivo:** Validar todas las funcionalidades del sistema desde la perspectiva del usuario final

---

## 🎯 Alcance de las Pruebas

Este documento cubre todas las funcionalidades del sistema de teleprompter, desde la carga de scripts hasta la ejecución completa con ventana flotante y controles por teclado.

---

## 📑 Tabla de Casos de Prueba

| ID | Módulo | Casos | Estado |
|----|--------|-------|--------|
| **CP-01** | Importación de Scripts | 3 | ⬜ |
| **CP-02** | Lista de Orden de Ejecución | 6 | ⬜ |
| **CP-03** | Editor de Scripts | 5 | ⬜ |
| **CP-04** | Panel de Vista Previa | 4 | ⬜ |
| **CP-05** | Controles del Teleprompter | 8 | ⬜ |
| **CP-06** | Ventana Flotante | 5 | ⬜ |
| **CP-07** | Macros de Teclado | 10 | ⬜ |
| **CP-08** | Marcadores de Señales | 3 | ⬜ |
| **CP-09** | Configuración | 4 | ⬜ |

---

## 🧪 CASOS DE PRUEBA DETALLADOS

### CP-01: Importación de Scripts (.txt)

#### **CP-01-01: Importar archivo .txt válido**
**Precondiciones:**
- Aplicación abierta en la vista principal
- Tener un archivo .txt con contenido de prueba

**Pasos:**
1. Hacer clic en el botón "Importar Scripts (.txt)"
2. Seleccionar un archivo .txt válido del sistema
3. Hacer clic en "Abrir"

**Resultado Esperado:**
- ✅ El archivo se carga en la lista "Run Order"
- ✅ El contenido aparece en el editor de scripts
- ✅ El nombre del archivo aparece en el item de la lista
- ✅ El status muestra "Not Started" (gris)

**Criterios de Aceptación:**
- El texto conserva saltos de línea originales
- No se pierden caracteres especiales (ñ, acentos, etc.)

---

#### **CP-01-02: Importar múltiples archivos .txt**
**Precondiciones:**
- Aplicación abierta
- Tener 3 o más archivos .txt diferentes

**Pasos:**
1. Hacer clic en "Importar Scripts (.txt)"
2. Seleccionar múltiples archivos usando Ctrl+Click
3. Hacer clic en "Abrir"

**Resultado Esperado:**
- ✅ Todos los archivos se agregan a la lista "Run Order"
- ✅ Cada archivo aparece como un item independiente
- ✅ Los items mantienen el orden de selección
- ✅ Al hacer clic en cada item, muestra su contenido correcto

---

#### **CP-01-03: Intentar importar archivo no .txt**
**Precondiciones:**
- Aplicación abierta

**Pasos:**
1. Hacer clic en "Importar Scripts (.txt)"
2. Intentar seleccionar un archivo .docx o .pdf
3. Observar comportamiento

**Resultado Esperado:**
- ✅ El selector de archivos solo muestra archivos .txt
- ✅ No permite seleccionar otros formatos
- ✅ No se produce ningún error

---

### CP-02: Lista de Orden de Ejecución (Run Order)

#### **CP-02-01: Reordenar items por drag & drop**
**Precondiciones:**
- Tener al menos 3 items en la lista

**Pasos:**
1. Arrastrar el tercer item hacia arriba
2. Soltarlo entre el primer y segundo item
3. Verificar el nuevo orden

**Resultado Esperado:**
- ✅ El item se mueve a la nueva posición
- ✅ Los demás items se reorganizan automáticamente
- ✅ El cursor muestra feedback visual durante el arrastre
- ✅ El orden se mantiene después de soltar

---

#### **CP-02-02: Seleccionar un script de la lista**
**Precondiciones:**
- Tener al menos 2 scripts cargados

**Pasos:**
1. Hacer clic en el primer script
2. Observar el contenido en el editor
3. Hacer clic en el segundo script
4. Observar el cambio de contenido

**Resultado Esperado:**
- ✅ El item seleccionado se resalta visualmente
- ✅ El editor muestra el contenido del script seleccionado
- ✅ La vista previa se actualiza al contenido seleccionado
- ✅ Solo un item puede estar seleccionado a la vez

---

#### **CP-02-03: Eliminar un script de la lista**
**Precondiciones:**
- Tener al menos 2 scripts cargados

**Pasos:**
1. Hacer clic en el ícono de papelera (🗑️) de un script
2. Confirmar la eliminación si se solicita

**Resultado Esperado:**
- ✅ El script se elimina de la lista inmediatamente
- ✅ Si era el script seleccionado, se selecciona otro automáticamente
- ✅ La lista se reordena sin espacios vacíos
- ✅ El contador de scripts se actualiza

---

#### **CP-02-04: Cambiar estado de un script**
**Precondiciones:**
- Tener scripts en la lista

**Pasos:**
1. Observar el estado inicial "Not Started" (gris)
2. Reproducir el script
3. Pausar la reproducción
4. Completar la reproducción

**Resultado Esperado:**
- ✅ Estado inicial: Badge gris "Not Started"
- ✅ Durante reproducción: Badge verde "Playing"
- ✅ Al pausar: Badge amarillo "Paused"
- ✅ Al completar: Badge azul "Completed"

---

#### **CP-02-05: Crear nuevo script vacío**
**Precondiciones:**
- Aplicación abierta

**Pasos:**
1. Hacer clic en el botón "+" (Nuevo Script)
2. Verificar la creación

**Resultado Esperado:**
- ✅ Se crea un nuevo item con nombre "Nuevo Script {n}"
- ✅ El editor se activa vacío
- ✅ El nuevo item aparece al final de la lista
- ✅ Se puede editar inmediatamente

---

#### **CP-02-06: Editar nombre del script**
**Precondiciones:**
- Tener al menos un script en la lista

**Pasos:**
1. Hacer doble clic en el nombre del script
2. Escribir un nuevo nombre
3. Presionar Enter o hacer clic fuera

**Resultado Esperado:**
- ✅ El campo de nombre se vuelve editable
- ✅ Se puede escribir un nuevo nombre
- ✅ El cambio se guarda al confirmar
- ✅ El nuevo nombre se muestra en la lista

---

### CP-03: Editor de Scripts

#### **CP-03-01: Editar contenido del script**
**Precondiciones:**
- Tener un script seleccionado

**Pasos:**
1. Hacer clic en el área del editor
2. Escribir texto nuevo
3. Modificar texto existente
4. Borrar texto

**Resultado Esperado:**
- ✅ El texto se puede escribir libremente
- ✅ Los cambios se reflejan en tiempo real
- ✅ Soporta copy/paste (Ctrl+C, Ctrl+V)
- ✅ Soporta deshacer/rehacer (Ctrl+Z, Ctrl+Y)

---

#### **CP-03-02: Aplicar formato de negrita**
**Precondiciones:**
- Tener texto en el editor

**Pasos:**
1. Seleccionar una palabra o frase
2. Hacer clic en el botón "B" (Bold) de la barra de herramientas
3. Verificar el resultado

**Resultado Esperado:**
- ✅ El texto seleccionado se muestra en negrita
- ✅ El formato se mantiene en la vista previa
- ✅ Se puede remover la negrita con el mismo botón
- ✅ El formato se conserva al guardar

---

#### **CP-03-03: Aplicar formato de cursiva**
**Precondiciones:**
- Tener texto en el editor

**Pasos:**
1. Seleccionar una palabra o frase
2. Hacer clic en el botón "I" (Italic)
3. Verificar el resultado

**Resultado Esperado:**
- ✅ El texto seleccionado se muestra en cursiva
- ✅ El formato se mantiene en la vista previa
- ✅ Se puede combinar con negrita
- ✅ El formato se conserva al guardar

---

#### **CP-03-04: Insertar marcador de señal (CUE)**
**Precondiciones:**
- Tener un script en el editor

**Pasos:**
1. Posicionar el cursor en una línea
2. Hacer clic en el botón "Insert Cue" (🔔)
3. Verificar la inserción

**Resultado Esperado:**
- ✅ Se inserta la marca `[CUE]` en la posición del cursor
- ✅ La marca se muestra con color distintivo
- ✅ Se puede navegar a este marcador con PageUp/PageDown
- ✅ La marca aparece en la vista previa

---

#### **CP-03-05: Limpiar formato del texto**
**Precondiciones:**
- Tener texto con formato (negrita/cursiva)

**Pasos:**
1. Seleccionar texto formateado
2. Hacer clic en el botón de limpiar formato (🧹)
3. Verificar el resultado

**Resultado Esperado:**
- ✅ Se elimina toda la negrita
- ✅ Se elimina toda la cursiva
- ✅ El texto vuelve al formato normal
- ✅ No se pierde el contenido del texto

---

### CP-04: Panel de Vista Previa

#### **CP-04-01: Visualizar script en vista previa**
**Precondiciones:**
- Tener un script con contenido

**Pasos:**
1. Editar el script en el editor
2. Observar el panel de vista previa a la derecha
3. Hacer cambios en el editor
4. Observar la actualización

**Resultado Esperado:**
- ✅ El texto del editor se muestra en la vista previa
- ✅ Los cambios se actualizan en tiempo real
- ✅ El formato (negrita/cursiva) se respeta
- ✅ Los marcadores [CUE] se muestran

---

#### **CP-04-02: Ajustar tamaño de fuente en vista previa**
**Precondiciones:**
- Tener un script visible en la vista previa

**Pasos:**
1. Localizar el slider de tamaño de fuente
2. Mover el slider hacia la derecha
3. Mover el slider hacia la izquierda
4. Verificar los cambios

**Resultado Esperado:**
- ✅ El tamaño de fuente aumenta al mover a la derecha
- ✅ El tamaño de fuente disminuye al mover a la izquierda
- ✅ El rango es de 16px a 72px
- ✅ El cambio es suave y gradual

---

#### **CP-04-03: Scroll manual en vista previa**
**Precondiciones:**
- Tener un script largo que requiera scroll

**Pasos:**
1. Usar la rueda del mouse sobre la vista previa
2. Usar la barra de scroll lateral
3. Verificar el desplazamiento

**Resultado Esperado:**
- ✅ La vista previa hace scroll suave
- ✅ Responde a la rueda del mouse
- ✅ Responde al arrastre de la barra de scroll
- ✅ El scroll no afecta otras áreas

---

#### **CP-04-04: Sincronización con reproducción**
**Precondiciones:**
- Tener un script reproduciendo

**Pasos:**
1. Iniciar la reproducción del script
2. Observar el scroll automático
3. Observar el indicador de posición

**Resultado Esperado:**
- ✅ El texto hace scroll automático
- ✅ La velocidad respeta la configuración
- ✅ Se muestra un indicador de posición actual
- ✅ El scroll se pausa al pausar la reproducción

---

### CP-05: Controles del Teleprompter

#### **CP-05-01: Reproducir script**
**Precondiciones:**
- Tener un script seleccionado con contenido

**Pasos:**
1. Hacer clic en el botón Play (▶️)
2. Observar el comportamiento

**Resultado Esperado:**
- ✅ El texto comienza a hacer scroll automático
- ✅ El botón Play cambia a Pause (⏸️)
- ✅ El estado del script cambia a "Playing"
- ✅ La velocidad de scroll es constante

---

#### **CP-05-02: Pausar reproducción**
**Precondiciones:**
- Script en reproducción activa

**Pasos:**
1. Hacer clic en el botón Pause (⏸️)
2. Observar el comportamiento

**Resultado Esperado:**
- ✅ El scroll se detiene inmediatamente
- ✅ El botón Pause cambia a Play (▶️)
- ✅ El estado cambia a "Paused"
- ✅ La posición actual se mantiene

---

#### **CP-05-03: Detener reproducción**
**Precondiciones:**
- Script en reproducción o pausado

**Pasos:**
1. Hacer clic en el botón Stop (⏹️)
2. Verificar el resultado

**Resultado Esperado:**
- ✅ La reproducción se detiene completamente
- ✅ El scroll vuelve al inicio (posición 0)
- ✅ El botón vuelve a Play (▶️)
- ✅ El estado vuelve a "Not Started" o "Completed"

---

#### **CP-05-04: Ajustar velocidad de scroll**
**Precondiciones:**
- Script en reproducción

**Pasos:**
1. Localizar el slider de velocidad
2. Aumentar la velocidad moviendo el slider a la derecha
3. Disminuir la velocidad moviendo el slider a la izquierda
4. Observar los cambios en tiempo real

**Resultado Esperado:**
- ✅ La velocidad cambia inmediatamente
- ✅ El rango es de 1 a 100
- ✅ A mayor valor, más rápido el scroll
- ✅ El cambio es fluido sin interrupciones

---

#### **CP-05-05: Usar botones de velocidad rápida**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Hacer clic en el botón de velocidad +
2. Observar el incremento
3. Hacer clic en el botón de velocidad -
4. Observar el decremento

**Resultado Esperado:**
- ✅ Botón "+" incrementa la velocidad en pasos fijos
- ✅ Botón "-" decrementa la velocidad en pasos fijos
- ✅ Se actualiza el valor del slider
- ✅ Si está reproduciendo, cambia inmediatamente

---

#### **CP-05-06: Ajustar tamaño de fuente durante reproducción**
**Precondiciones:**
- Script en reproducción

**Pasos:**
1. Mover el slider de tamaño de fuente
2. Observar los cambios
3. Verificar que la reproducción continúa

**Resultado Esperado:**
- ✅ El tamaño de fuente cambia inmediatamente
- ✅ La reproducción NO se interrumpe
- ✅ El cambio afecta la ventana principal y la flotante
- ✅ El scroll ajusta proporcionalmente

---

#### **CP-05-07: Cambiar color de fondo**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Abrir selector de color de fondo
2. Elegir un color diferente (ej: negro, verde, azul)
3. Verificar el cambio

**Resultado Esperado:**
- ✅ El fondo de la vista previa cambia inmediatamente
- ✅ El cambio también afecta la ventana flotante
- ✅ El contraste del texto se mantiene legible
- ✅ La configuración se guarda

---

#### **CP-05-08: Cambiar color del texto**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Abrir selector de color de texto
2. Elegir un color diferente (ej: blanco, amarillo, rojo)
3. Verificar el cambio

**Resultado Esperado:**
- ✅ El color del texto cambia inmediatamente
- ✅ El cambio también afecta la ventana flotante
- ✅ El contraste se mantiene con el fondo
- ✅ La configuración se guarda

---

### CP-06: Ventana Flotante (Popup)

#### **CP-06-01: Abrir ventana flotante**
**Precondiciones:**
- Tener un script seleccionado

**Pasos:**
1. Hacer clic en el botón "Open Popup Window" (🪟)
2. Observar la nueva ventana

**Resultado Esperado:**
- ✅ Se abre una nueva ventana independiente
- ✅ La ventana muestra el contenido del script actual
- ✅ La ventana es redimensionable
- ✅ La ventana puede moverse a otro monitor

---

#### **CP-06-02: Sincronización de contenido**
**Precondiciones:**
- Ventana flotante abierta

**Pasos:**
1. Editar el script en la ventana principal
2. Observar la ventana flotante
3. Cambiar de script en la ventana principal
4. Observar la ventana flotante

**Resultado Esperado:**
- ✅ Los cambios en el editor se reflejan en la ventana flotante
- ✅ Al cambiar de script, la ventana flotante muestra el nuevo contenido
- ✅ La sincronización es en tiempo real
- ✅ No hay retardo perceptible

---

#### **CP-06-03: Sincronización de reproducción**
**Precondiciones:**
- Ventana flotante abierta y script reproduciendo

**Pasos:**
1. Iniciar reproducción en la ventana principal
2. Observar la ventana flotante
3. Pausar en la ventana principal
4. Observar la ventana flotante

**Resultado Esperado:**
- ✅ Ambas ventanas hacen scroll simultáneamente
- ✅ La posición de scroll es idéntica
- ✅ La velocidad es la misma en ambas
- ✅ Pausar/reanudar afecta ambas ventanas

---

#### **CP-06-04: Sincronización de formato**
**Precondiciones:**
- Ventana flotante abierta

**Pasos:**
1. Cambiar tamaño de fuente en la ventana principal
2. Cambiar color de fondo
3. Cambiar color de texto
4. Observar la ventana flotante

**Resultado Esperado:**
- ✅ El tamaño de fuente cambia en ambas ventanas
- ✅ El color de fondo cambia en ambas ventanas
- ✅ El color de texto cambia en ambas ventanas
- ✅ Los cambios son instantáneos

---

#### **CP-06-05: Cerrar ventana flotante**
**Precondiciones:**
- Ventana flotante abierta

**Pasos:**
1. Cerrar la ventana flotante usando el botón X
2. Verificar el estado de la ventana principal

**Resultado Esperado:**
- ✅ La ventana flotante se cierra
- ✅ La ventana principal continúa funcionando normalmente
- ✅ La reproducción NO se detiene (si estaba activa)
- ✅ Se puede volver a abrir la ventana flotante

---

### CP-07: Macros de Teclado

#### **CP-07-01: Macro F10 - Play/Stop Toggle**
**Precondiciones:**
- Script seleccionado

**Pasos:**
1. Presionar F10
2. Observar el comportamiento
3. Presionar F10 nuevamente

**Resultado Esperado:**
- ✅ Primera pulsación: Inicia reproducción
- ✅ Segunda pulsación: Detiene reproducción
- ✅ Funciona igual que el botón Play/Stop
- ✅ Funciona en ventana principal y flotante

---

#### **CP-07-02: Macro F9 - Pause/Resume Toggle**
**Precondiciones:**
- Script en reproducción

**Pasos:**
1. Iniciar reproducción
2. Presionar F9
3. Presionar F9 nuevamente

**Resultado Esperado:**
- ✅ Primera pulsación: Pausa la reproducción
- ✅ Segunda pulsación: Reanuda la reproducción
- ✅ Mantiene la posición actual
- ✅ Funciona como el botón Pause

---

#### **CP-07-03: Macro F11 - Script Anterior**
**Precondiciones:**
- Tener 3+ scripts en la lista

**Pasos:**
1. Seleccionar el tercer script
2. Presionar F11
3. Observar el cambio

**Resultado Esperado:**
- ✅ Se selecciona el script anterior (segundo)
- ✅ El contenido cambia en el editor y vista previa
- ✅ Si está en el primer script, va al último (circular)
- ✅ Funciona durante la reproducción

---

#### **CP-07-04: Macro F12 - Script Siguiente**
**Precondiciones:**
- Tener 3+ scripts en la lista

**Pasos:**
1. Seleccionar el primer script
2. Presionar F12
3. Observar el cambio

**Resultado Esperado:**
- ✅ Se selecciona el script siguiente (segundo)
- ✅ El contenido cambia en el editor y vista previa
- ✅ Si está en el último script, va al primero (circular)
- ✅ Funciona durante la reproducción

---

#### **CP-07-05: Macro F1 - Disminuir Velocidad**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Verificar velocidad actual
2. Presionar F1
3. Observar el cambio
4. Presionar F1 múltiples veces

**Resultado Esperado:**
- ✅ La velocidad disminuye en incrementos fijos
- ✅ El slider de velocidad se actualiza
- ✅ Si está reproduciendo, el cambio es inmediato
- ✅ No baja de la velocidad mínima (1)

---

#### **CP-07-06: Macro F2 - Aumentar Velocidad**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Verificar velocidad actual
2. Presionar F2
3. Observar el cambio
4. Presionar F2 múltiples veces

**Resultado Esperado:**
- ✅ La velocidad aumenta en incrementos fijos
- ✅ El slider de velocidad se actualiza
- ✅ Si está reproduciendo, el cambio es inmediato
- ✅ No sube de la velocidad máxima (100)

---

#### **CP-07-07: Macro F3 - Disminuir Tamaño de Fuente**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Verificar tamaño actual
2. Presionar F3
3. Observar el cambio
4. Presionar F3 múltiples veces

**Resultado Esperado:**
- ✅ El tamaño de fuente disminuye
- ✅ El cambio es visible inmediatamente
- ✅ Afecta ventana principal y flotante
- ✅ No baja del tamaño mínimo (16px)

---

#### **CP-07-08: Macro F4 - Aumentar Tamaño de Fuente**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Verificar tamaño actual
2. Presionar F4
3. Observar el cambio
4. Presionar F4 múltiples veces

**Resultado Esperado:**
- ✅ El tamaño de fuente aumenta
- ✅ El cambio es visible inmediatamente
- ✅ Afecta ventana principal y flotante
- ✅ No sube del tamaño máximo (72px)

---

#### **CP-07-09: Macro PageUp - CUE Anterior**
**Precondiciones:**
- Script con múltiples marcadores [CUE]

**Pasos:**
1. Posicionar el scroll en medio del script
2. Presionar PageUp
3. Observar el salto

**Resultado Esperado:**
- ✅ El scroll salta al marcador [CUE] anterior
- ✅ El marcador queda visible en pantalla
- ✅ Si no hay marcador anterior, no hace nada
- ✅ Funciona durante reproducción y pausado

---

#### **CP-07-10: Macro PageDown - CUE Siguiente**
**Precondiciones:**
- Script con múltiples marcadores [CUE]

**Pasos:**
1. Posicionar el scroll al inicio del script
2. Presionar PageDown
3. Observar el salto

**Resultado Esperado:**
- ✅ El scroll salta al marcador [CUE] siguiente
- ✅ El marcador queda visible en pantalla
- ✅ Si no hay marcador siguiente, no hace nada
- ✅ Funciona durante reproducción y pausado

---

### CP-08: Marcadores de Señales (CUE)

#### **CP-08-01: Insertar marcador CUE**
**Precondiciones:**
- Script en el editor

**Pasos:**
1. Posicionar cursor en una línea específica
2. Hacer clic en el botón "Insert Cue" 🔔
3. Verificar la inserción

**Resultado Esperado:**
- ✅ Se inserta el texto `[CUE]` en la posición del cursor
- ✅ El marcador se muestra con estilo distintivo (color/fondo)
- ✅ Aparece en la vista previa y ventana flotante
- ✅ Se puede navegar con PageUp/PageDown

---

#### **CP-08-02: Múltiples marcadores CUE**
**Precondiciones:**
- Script en el editor

**Pasos:**
1. Insertar un marcador [CUE] en línea 5
2. Insertar otro marcador [CUE] en línea 15
3. Insertar otro marcador [CUE] en línea 25
4. Usar PageDown repetidamente

**Resultado Esperado:**
- ✅ Cada marcador se inserta correctamente
- ✅ Los marcadores se distinguen visualmente
- ✅ PageDown navega secuencialmente entre ellos
- ✅ PageUp navega en orden inverso

---

#### **CP-08-03: Eliminar marcador CUE**
**Precondiciones:**
- Script con marcadores [CUE] insertados

**Pasos:**
1. Localizar un marcador [CUE]
2. Seleccionar el texto `[CUE]`
3. Presionar Delete o Backspace

**Resultado Esperado:**
- ✅ El marcador se elimina como texto normal
- ✅ La navegación con PageUp/Down omite el marcador eliminado
- ✅ No afecta otros marcadores
- ✅ Se puede deshacer con Ctrl+Z

---

### CP-09: Panel de Configuración

#### **CP-09-01: Abrir panel de configuración**
**Precondiciones:**
- Aplicación funcionando

**Pasos:**
1. Hacer clic en el botón de configuración (⚙️)
2. Observar el panel que se abre

**Resultado Esperado:**
- ✅ Se abre un panel lateral o modal de configuración
- ✅ Muestra todas las opciones disponibles
- ✅ Se puede cerrar con botón X o fuera del panel
- ✅ Los cambios se mantienen al cerrar

---

#### **CP-09-02: Configurar atajos de teclado**
**Precondiciones:**
- Panel de configuración abierto

**Pasos:**
1. Navegar a la sección "Macros"
2. Hacer clic en un atajo (ej: F10)
3. Presionar una nueva tecla
4. Guardar cambios

**Resultado Esperado:**
- ✅ Se puede reasignar cada macro a una tecla diferente
- ✅ El sistema detecta la nueva tecla presionada
- ✅ No permite duplicar atajos
- ✅ Los cambios funcionan inmediatamente

---

#### **CP-09-03: Restablecer configuración por defecto**
**Precondiciones:**
- Haber modificado configuraciones

**Pasos:**
1. Abrir panel de configuración
2. Hacer clic en "Restore Defaults"
3. Confirmar la acción

**Resultado Esperado:**
- ✅ Todas las macros vuelven a valores por defecto
- ✅ Colores vuelven a los originales
- ✅ Velocidad y tamaño vuelven a valores iniciales
- ✅ Se muestra confirmación del restablecimiento

---

#### **CP-09-04: Exportar/Importar configuración**
**Precondiciones:**
- Haber personalizado la configuración

**Pasos:**
1. Abrir configuración
2. Hacer clic en "Export Settings"
3. Guardar archivo de configuración
4. Hacer clic en "Import Settings"
5. Cargar el archivo guardado

**Resultado Esperado:**
- ✅ Se exporta archivo JSON con toda la configuración
- ✅ El archivo se puede importar posteriormente
- ✅ Al importar, se restauran todos los ajustes
- ✅ Se muestra mensaje de éxito/error

---

## 📊 MATRIZ DE TRAZABILIDAD

| Requisito Funcional | Casos de Prueba | Prioridad |
|---------------------|-----------------|-----------|
| **RF-01: Importar Scripts** | CP-01-01, CP-01-02, CP-01-03 | 🔴 Alta |
| **RF-02: Gestión Run Order** | CP-02-01, CP-02-02, CP-02-03, CP-02-04, CP-02-05, CP-02-06 | 🔴 Alta |
| **RF-03: Editor de Scripts** | CP-03-01, CP-03-02, CP-03-03, CP-03-04, CP-03-05 | 🔴 Alta |
| **RF-04: Vista Previa** | CP-04-01, CP-04-02, CP-04-03, CP-04-04 | 🟡 Media |
| **RF-05: Reproducción** | CP-05-01, CP-05-02, CP-05-03, CP-05-04, CP-05-05 | 🔴 Alta |
| **RF-06: Ajustes Visuales** | CP-05-06, CP-05-07, CP-05-08 | 🟡 Media |
| **RF-07: Ventana Flotante** | CP-06-01, CP-06-02, CP-06-03, CP-06-04, CP-06-05 | 🔴 Alta |
| **RF-08: Macros de Teclado** | CP-07-01 a CP-07-10 | 🔴 Alta |
| **RF-09: Marcadores CUE** | CP-08-01, CP-08-02, CP-08-03 | 🟡 Media |
| **RF-10: Configuración** | CP-09-01, CP-09-02, CP-09-03, CP-09-04 | 🟢 Baja |

---

## 🎬 ESCENARIOS DE PRUEBA END-TO-END

### Escenario E2E-01: Flujo Completo de Producción

**Descripción:** Simula el uso real de un operador de teleprompter durante una producción.

**Pasos:**
1. Abrir la aplicación
2. Importar 3 archivos .txt con scripts del show
3. Reordenar los scripts en el orden correcto
4. Insertar marcadores [CUE] en puntos clave
5. Ajustar tamaño de fuente a 48px
6. Cambiar color de fondo a negro y texto a blanco
7. Abrir ventana flotante en monitor secundario
8. Iniciar reproducción del primer script
9. Usar F2 para ajustar velocidad según el presentador
10. Navegar entre CUEs con PageUp/PageDown
11. Usar F12 para pasar al siguiente script
12. Pausar con F9 durante comercial
13. Reanudar con F9 después del comercial
14. Completar todos los scripts
15. Cerrar ventana flotante
16. Cerrar aplicación

**Resultado Esperado:**
- ✅ Todas las funciones operan sin errores
- ✅ La sincronización entre ventanas es perfecta
- ✅ Los atajos de teclado responden inmediatamente
- ✅ La reproducción es fluida sin stuttering
- ✅ El operador puede trabajar sin usar el mouse

---

### Escenario E2E-02: Edición Durante Reproducción

**Descripción:** Validar que se pueden hacer cambios mientras el teleprompter está activo.

**Pasos:**
1. Iniciar reproducción de un script
2. Abrir ventana flotante
3. Mientras reproduce, editar texto en el script actual
4. Agregar formato de negrita a palabras clave
5. Insertar un marcador [CUE] nuevo
6. Cambiar tamaño de fuente con F3/F4
7. Ajustar velocidad con F1/F2
8. Cambiar colores de fondo y texto
9. Verificar que todos los cambios se reflejan en tiempo real

**Resultado Esperado:**
- ✅ Todos los cambios se aplican sin detener la reproducción
- ✅ La ventana flotante se actualiza simultáneamente
- ✅ No hay glitches visuales
- ✅ La posición de scroll se mantiene correcta

---

## 📈 MÉTRICAS DE CALIDAD

### Criterios de Aprobación
- ✅ **100%** de casos críticos (🔴 Alta) deben pasar
- ✅ **95%** de casos medios (🟡 Media) deben pasar
- ✅ **90%** de casos bajos (🟢 Baja) deben pasar
- ✅ **0** errores bloqueantes
- ✅ **Tiempo de respuesta** < 100ms para todas las interacciones

### Indicadores de Rendimiento
- **Latencia de sincronización:** < 50ms entre ventanas
- **Fluidez de scroll:** 60 FPS durante reproducción
- **Tiempo de carga:** < 2 segundos para archivos .txt de 100KB
- **Uso de memoria:** < 500MB durante operación normal

---

## 🐛 REGISTRO DE DEFECTOS

| ID | Severidad | Caso | Descripción | Estado |
|----|-----------|------|-------------|--------|
| DEF-001 | 🔴 Crítico | CP-XX-XX | Descripción del bug | ⬜ Abierto |
| DEF-002 | 🟡 Mayor | CP-XX-XX | Descripción del bug | ⬜ Abierto |
| DEF-003 | 🟢 Menor | CP-XX-XX | Descripción del bug | ⬜ Abierto |

**Clasificación de Severidad:**
- 🔴 **Crítico:** Bloquea funcionalidad principal, sin workaround
- 🟡 **Mayor:** Afecta funcionalidad importante, tiene workaround
- 🟢 **Menor:** Error cosmético o sin impacto en operación
- ⚪ **Trivial:** Sugerencia de mejora

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

### Funcionalidad
- [ ] Todos los botones responden correctamente
- [ ] Todos los atajos de teclado funcionan
- [ ] Importación de archivos .txt sin errores
- [ ] Drag & drop funciona en todos los navegadores
- [ ] Reproducción fluida sin interrupciones
- [ ] Sincronización perfecta entre ventanas

### Compatibilidad
- [ ] Funciona en Windows 10/11
- [ ] Soporta múltiples monitores
- [ ] Funciona con teclados estándar y multimedia
- [ ] Compatible con diferentes resoluciones de pantalla

### Usabilidad
- [ ] Interfaz intuitiva y clara
- [ ] Mensajes de error descriptivos
- [ ] Confirmaciones en acciones destructivas
- [ ] Tooltips en todos los controles

### Rendimiento
- [ ] Tiempo de carga < 2 segundos
- [ ] Sin lag durante reproducción
- [ ] Uso de CPU < 30%
- [ ] Uso de RAM < 500MB

### Seguridad y Estabilidad
- [ ] No hay crasheos durante pruebas extensivas
- [ ] Datos se guardan correctamente
- [ ] Recuperación de errores funciona
- [ ] No hay pérdida de datos al cerrar

---

## 📝 NOTAS PARA EL TESTER

1. **Ambiente de Pruebas:**
   - Sistema Operativo: Windows 10/11
   - Aplicación instalada vía `Teleprompter Pro-Setup-1.0.0.exe`
   - Preferible tener 2 monitores para probar ventana flotante

2. **Datos de Prueba:**
   - Preparar 5-10 archivos .txt con diferentes contenidos
   - Incluir textos con acentos, ñ, y caracteres especiales
   - Crear archivos de diferentes tamaños (1KB, 10KB, 50KB)

3. **Registro de Evidencias:**
   - Capturar screenshots de bugs encontrados
   - Grabar video de escenarios E2E
   - Documentar pasos exactos para reproducir errores

4. **Comunicación:**
   - Reportar bugs inmediatamente si son críticos
   - Completar matriz de trazabilidad al finalizar
   - Actualizar métricas de calidad con resultados reales

---

## 🎯 CONCLUSIÓN

Este documento de pruebas cubre **48 casos de prueba** individuales más **2 escenarios end-to-end** que validan todas las funcionalidades del sistema de teleprompter desde la perspectiva del usuario final.

**Fecha de Revisión:** ___________  
**Tester:** ___________  
**Aprobación:** ___________

---

**© 2025 Teleprompter Pro - Documento de Pruebas Funcionales v1.0**
