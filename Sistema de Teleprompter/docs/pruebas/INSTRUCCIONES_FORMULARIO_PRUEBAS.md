# 🧪 Guía del Formulario de Pruebas Funcionales

Este documento explica cómo utilizar el formulario interactivo de pruebas (`test-form.html`) para realizar el control de calidad del Sistema de Teleprompter.

## 📋 Descripción General

El formulario de pruebas es una herramienta HTML standalone que permite:

- ✅ Ejecutar 68 casos de prueba organizados en 13 categorías
- 📝 Documentar resultados y observaciones
- 💾 Guardar progreso automáticamente
- 📊 Visualizar estadísticas en tiempo real
- 📄 Generar reportes profesionales en HTML
- 📚 Mantener historial de sesiones anteriores

## 🚀 Cómo Empezar

### 1. Abrir el Formulario

```
1. Localizar el archivo: test-form.html
2. Hacer doble clic o abrir con cualquier navegador moderno
3. El formulario se abrirá completamente funcional (no requiere servidor)
```

### 2. Completar Información de la Sesión

En la parte superior del formulario, complete los siguientes campos:

- **Nombre del Tester**: Su nombre completo
- **Fecha**: Fecha de la sesión de pruebas (se completa automáticamente)
- **Versión de la App**: Versión del teleprompter que está probando (ej: 1.0.0)
- **Navegador**: Se detecta automáticamente, pero puede editarse
- **Notas Generales**: Observaciones generales sobre la sesión

> ⚠️ **Importante**: El nombre del tester es obligatorio para guardar y exportar resultados.

## 📊 Resumen de Estadísticas

En la parte superior verá 4 contadores que se actualizan automáticamente:

- ✅ **Aprobadas**: Pruebas que pasaron exitosamente
- ❌ **Fallidas**: Pruebas que no pasaron
- ➖ **N/A**: Pruebas que no aplican en esta sesión
- ⏳ **Pendientes**: Pruebas aún no evaluadas

La **barra de progreso** muestra visualmente el porcentaje de pruebas completadas.

## 🗂️ Categorías de Pruebas

El formulario está organizado en 13 categorías:

1. 🎨 **Interfaz de Usuario** (4 pruebas)
2. 📜 **Funcionalidad del Teleprompter** (6 pruebas)
3. 🪟 **Ventana Flotante del Teleprompter** (6 pruebas)
4. ⛶ **Modo Pantalla Completa** (4 pruebas)
5. ✍️ **Editor de Scripts** (5 pruebas)
6. 📋 **Run Order (Lista de Scripts)** (6 pruebas)
7. ⌨️ **Atajos de Teclado (Macros)** (7 pruebas)
8. 🖱️ **Control con Rueda del Ratón** (4 pruebas)
9. 📏 **Línea Guía de Lectura** (3 pruebas)
10. 💾 **Persistencia de Datos** (3 pruebas)
11. ⚡ **Rendimiento** (3 pruebas)
12. 🌐 **Compatibilidad** (4 pruebas)
13. 📦 **Instalación y Despliegue (Electron)** (20 pruebas)

### Expandir/Contraer Categorías

- Haga clic en el **encabezado de la categoría** para expandir/contraer
- El ícono ▼ indica que puede expandirse
- El ícono ▲ indica que está expandida

## ✅ Marcar Resultados de Pruebas

Para cada prueba, tiene 3 opciones:

### ✅ Pass (Aprobada)
- La prueba funcionó correctamente
- No se encontraron problemas
- Marca el caso como exitoso

### ❌ Fail (Fallida)
- La prueba NO funcionó correctamente
- Se encontró un bug o problema
- **IMPORTANTE**: Agregue observaciones detalladas

### ➖ N/A (No Aplica)
- La prueba no es relevante en este contexto
- La funcionalidad no está disponible
- Se omitió por alguna razón válida

## 📝 Agregar Observaciones

Cada prueba tiene un campo de texto para **observaciones**:

```
Casos donde DEBE agregar observaciones:
- ❌ Todas las pruebas fallidas (obligatorio)
- ✅ Pruebas aprobadas con comportamiento inesperado
- ➖ Pruebas N/A para justificar por qué no aplican
```

### Ejemplo de Observaciones Útiles:

**❌ Para pruebas fallidas:**
```
"El botón Play no responde al primer clic. 
Funciona solo después del segundo intento.
Reproducible en Chrome 118."
```

**✅ Para pruebas aprobadas con notas:**
```
"Funciona correctamente, pero la velocidad 
podría ser un poco más rápida por defecto."
```

**➖ Para pruebas N/A:**
```
"No se probó en Firefox porque solo se 
requiere validación en Chrome para este sprint."
```

## 💾 Guardar Progreso

### Auto-guardado
- El formulario se **auto-guarda cada 30 segundos** automáticamente
- También guarda cuando marca un resultado o escribe observaciones
- Los datos se almacenan en el navegador (localStorage)

### Guardado Manual
1. Click en el botón **"💾 Guardar Progreso"**
2. Se guardará la sesión actual en el historial
3. Recibirá confirmación: "✅ Progreso guardado exitosamente!"

> 💡 **Tip**: Guarde periódicamente para no perder datos

## 📄 Exportar Resultados

Cuando complete las pruebas (o quiera un reporte parcial):

1. Click en **"📄 Exportar Resultados"**
2. Se descargará un archivo HTML con el reporte completo
3. Nombre del archivo: `Reporte_Pruebas_[Nombre]_[Fecha].html`

### Contenido del Reporte:
- ✅ Información de la sesión completa
- ✅ Resumen de estadísticas
- ✅ Todos los resultados organizados por categoría
- ✅ Observaciones de cada prueba
- ✅ Formato profesional y listo para imprimir

**Usos del reporte exportado:**
- Enviar por email al equipo de desarrollo
- Adjuntar a tickets de bugs
- Documentación de QA
- Archivo histórico de pruebas

## 📚 Ver Historial

El botón **"📚 Ver Historial"** abre un modal con todas las sesiones guardadas:

### Funciones del Historial:
- **Ver sesiones anteriores**: Lista de todas las pruebas realizadas
- **Cargar sesión**: Click en cualquier sesión para cargar sus datos
- **Información visible**: Nombre, fecha, versión, navegador
- **Orden**: Más recientes primero

### Casos de Uso:
- Comparar resultados entre versiones
- Retomar una sesión incompleta
- Revisar pruebas anteriores
- Validar regresiones

## 🖨️ Imprimir Resultados

El botón **"🖨️ Imprimir"** abre el diálogo de impresión del navegador:

- Se auto-expanden todas las categorías
- Se ocultan controles interactivos
- Formato optimizado para papel
- Lista solo los resultados marcados

**Ideal para:**
- Documentación física
- Reuniones de equipo
- Archivo en papel
- Presentaciones

## 🔄 Reiniciar Formulario

El botón **"🔄 Reiniciar Formulario"** borra todos los datos:

⚠️ **ADVERTENCIA**: Esta acción:
- Elimina el progreso actual
- NO elimina el historial guardado
- Requiere confirmación
- No se puede deshacer

**Cuándo usar:**
- Iniciar una nueva sesión desde cero
- Después de exportar resultados
- Para probar una versión completamente nueva

## 🎯 Flujo de Trabajo Recomendado

### Para una Sesión de Pruebas Completa:

```
1. ✅ Abrir test-form.html en el navegador
2. ✅ Completar información de la sesión
3. ✅ Abrir la aplicación del teleprompter en otra pestaña
4. ✅ Ir expandiendo categorías una por una
5. ✅ Probar cada funcionalidad según descripción
6. ✅ Marcar resultado (Pass/Fail/N/A)
7. ✅ Agregar observaciones si es necesario
8. ✅ Guardar progreso cada 10-15 minutos
9. ✅ Al terminar, exportar reporte
10. ✅ Enviar reporte al equipo de desarrollo
```

### Para Pruebas Parciales:

```
1. ✅ Cargar sesión anterior desde historial
2. ✅ Continuar donde se quedó
3. ✅ Completar pruebas pendientes
4. ✅ Actualizar observaciones si es necesario
5. ✅ Guardar y exportar
```

## 🔍 Tips y Mejores Prácticas

### ✅ Hacer:
- Ser específico en las observaciones
- Incluir pasos para reproducir bugs
- Mencionar el navegador y versión
- Guardar progreso frecuentemente
- Probar en diferentes navegadores
- Documentar comportamientos inesperados

### ❌ Evitar:
- Dejar pruebas fallidas sin observaciones
- Observaciones vagas como "no funciona"
- Cerrar el navegador sin guardar
- Marcar N/A sin justificación
- Apresurarse en las pruebas

## 🐛 Reportar Bugs Efectivamente

Cuando encuentre un bug (prueba fallida), incluya:

1. **Qué esperaba que pasara**: Comportamiento esperado
2. **Qué pasó en realidad**: Comportamiento actual
3. **Pasos para reproducir**: Lista numerada
4. **Frecuencia**: ¿Siempre? ¿A veces?
5. **Navegador y versión**: Información del entorno
6. **Screenshots**: Si es posible (pegar en email)

### Ejemplo de Reporte de Bug Completo:

```
PRUEBA: Inicio del desplazamiento (Play)
RESULTADO: ❌ FAIL

OBSERVACIONES:
Esperaba: Al hacer clic en Play, el texto debe 
comenzar a desplazarse inmediatamente.

Actual: El texto no se desplaza. El botón cambia 
a "Pausar" pero no hay movimiento visible.

Pasos para reproducir:
1. Abrir el teleprompter
2. Cargar cualquier script con texto
3. Click en botón "Reproducir"
4. Observar que no hay desplazamiento

Frecuencia: 100% reproducible
Navegador: Chrome 118.0.5993.70
SO: Windows 11

Notas adicionales: El problema persiste incluso 
después de recargar la página.
```

## 📞 Soporte

Si tiene problemas con el formulario de pruebas:

1. Verificar que JavaScript está habilitado
2. Probar en otro navegador
3. Limpiar caché y cookies
4. Verificar consola del navegador (F12)

## 📊 Métricas de Calidad

Para considerar que el software está listo para producción:

- ✅ **Mínimo 95% de pruebas aprobadas**
- ✅ **0 bugs críticos** (categorías: Teleprompter, Ventana Flotante)
- ✅ **Máximo 2 bugs menores** (categorías: UI, Rendimiento)
- ✅ **100% de pruebas de compatibilidad** aprobadas

## 🎓 Glosario

- **Pass**: Prueba exitosa, funcionalidad trabajando correctamente
- **Fail**: Prueba fallida, bug encontrado
- **N/A**: No aplica, prueba no relevante en este contexto
- **Observaciones**: Notas detalladas sobre el resultado de la prueba
- **Sesión**: Un conjunto completo de pruebas realizadas en un momento específico
- **Historial**: Registro de todas las sesiones guardadas
- **Reporte**: Documento HTML exportado con los resultados

---

**Última actualización**: Octubre 2025
**Versión del formulario**: 1.0
**Autor**: Sistema de Teleprompter - QA Team
