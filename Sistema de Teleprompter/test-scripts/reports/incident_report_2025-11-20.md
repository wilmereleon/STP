**INCIDENT REPORT**

**Project:** Teleprompter Pro (STP)
**Report Date:** 2025-11-20
**Test Iteration:** Iteración 1 (19-20/11/2025)

---

**Incidente 001 – Error en carga de Excel**
- **Caso:** TC-002
- **Descripción:** El sistema no reconoce hojas con formatos complejos. Al intentar importar un archivo Excel con múltiples hojas y formatos avanzados (celdas combinadas, estilos y fórmulas), el parser de importación falla y el proceso termina registrando un error en el log de importación.
- **Clasificación:** Funcional
- **Impacto:** El usuario no puede importar guiones en formatos de Excel complejos; afecta flujo de trabajo del productor y la disponibilidad de scripts.
- **Evidencia:** Log de error en importación (ver archivo de logs `backend` / entrada relacionada a TC-002). Captura de log adjunta en el sistema de pruebas.
- **Acción recomendada:** Ajustar el parser de Excel para soportar formatos avanzados. Recomendaciones técnicas:
  - Usar una librería robusta (ej. `xlsx`, `exceljs`) y activar opciones que normalicen hojas y celdas combinadas antes del parseo.
  - Implementar manejo explícito de múltiples hojas: permitir seleccionar hoja por defecto o importar concatenando hojas según configuración.
  - Añadir pruebas unitarias con archivos Excel de ejemplo que contengan celdas combinadas, estilos y fórmulas.
  - Añadir mejor manejo de errores con mensajes de usuario claros y registro detallado para facilitar depuración.

---

**Incidente 002 – Latencia en sincronización**
- **Caso:** TC-020
- **Descripción:** Latencia de 65ms observada en condiciones de red congestionada durante la sincronización Productor→Operador. El umbral establecido para la aplicación es de 50ms para mantener una experiencia en tiempo real fluida.
- **Clasificación:** Mejora
- **Impacto:** Retraso perceptible en actualizaciones en vivo del guion; podría degradar la coordinación en transmisiones en directo o entornos con redes congestionadas.
- **Evidencia:** Logs de Socket.IO con timestamps de emisión/recepción, mediciones de RTT y pruebas de red reproducibles (capturas de logs de TC-020).
- **Acción recomendada:** Optimizar WebSocket y la arquitectura de sincronización:
  - Revisar y optimizar la ruta y tamaño de mensajes: enviar deltas en lugar de payloads enteros cuando sea posible.
  - Usar compresión/control de tamaño para mensajes grandes.
  - Evaluar uso de un mecanismo de priorización/cola y balanceo de carga si hay múltiples instancias (usar Redis + socket.io-redis adapter para escala horizontal).
  - Ejecutar pruebas de carga y simulación de redes con JMeter o WebLoad y definir SLA específicos por tipo de red.

---

**Incidente 003 – Error visual menor**
- **Caso:** TC-010
- **Descripción:** Botón de cierre (close) aparece desalineado en modo pantalla completa. Visualmente no impide funcionalidad, pero afecta experiencia de usuario y estética.
- **Clasificación:** Visualización
- **Impacto:** Baja; afecta usabilidad en escenarios de producción donde la interfaz debe ser pulida.
- **Evidencia:** Captura de pantalla tomada durante ejecución de TC-010.
- **Acción recomendada:** Ajustar CSS y layout:
  - Revisar estilos responsivos y reglas CSS aplicadas en modo `fullscreen` (posiblemente variables de `top/right` o `transform` mal calculadas).
  - Añadir test visuales (visual regression) para el modo pantalla completa.
  - Validar en distintos navegadores y resoluciones.

---

**6. Resumen de pruebas**

| Iteración   | Fecha inicio-fin | Pruebas realizadas | No conformidades | Casos ejecutados | Casos diseñados | Casos pendientes | Casos aprobados |
|-------------|------------------|--------------------|------------------|------------------|-----------------|------------------|-----------------|
| Iteración 1 | 19-20/11/2025    | 10                 | 3                | 10               | 10              | 0                | 7               |

**Observaciones generales:**
- Las pruebas funcionales básicas (login, import TXT, persistencia en DB, ajuste de velocidad) funcionan en su mayoría.
- Los problemas críticos detectados están relacionados a importación de formatos complejos y a latencia en sincronización en condiciones adversas.
- Recomendado priorizar la corrección del parser de Excel (Incidente 001) y la optimización del mecanismo de sincronización (Incidente 002) antes de desplegar en entornos de producción con alta carga.

**Seguimiento y acciones pendientes:**
1. Registrar incidencias en el sistema de gestión (TestLink/Bugzilla Testopia) con prioridad y anexar evidencias.
2. Asignar responsables para las acciones recomendadas (Dev/Infra/QA) y definir plazo estimado.
3. Planificar nuevas pruebas de regresión tras la corrección (incluir casos con Excel complejos y escenarios de red con latencia).
4. Incluir tests automatizados para login y endpoints críticos en el pipeline CI.

5. Ejecución automatizada registrada (TC-040 - Login válido):
  - **Fecha / Hora (servidor):** 2025-11-20 19:11 (aprox.)
  - **Tester / Método:** Script automatizado `test-scripts/tc_040_login.ps1` (PowerShell)
  - **Entorno:** Entorno local con contenedores Docker (backend en `http://localhost:3000`), ver `docker-compose` activo.
  - **Comando ejecutado:**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "test-scripts\tc_040_login.ps1"
```

  - **Resultado obtenido:** PASS — Login exitoso. `accessToken` devuelto y objeto `user` válido.
  - **Usuario devuelto:**
    - id: `68fa9a183f6ad44451ce5f47`
    - email: `admin@teleprompter.com`
    - name: `Administrador`
    - role: `Admin`
  - **Evidencia:** Archivo de resultado JSON guardado en `test-scripts/results/tc_040_login_result.json` (contiene `accessToken`, `refreshToken` y `user`).
  - **Observaciones:** La prueba automatizada de login se ejecutó localmente y validó correctamente el endpoint `/api/auth/login`. Se recomienda integrar esta ejecución en el pipeline CI como test de humo para verificar disponibilidad básica del backend antes de despliegues.

---

**Creado por:** QA Team
**Contacto:** qa@teleprompter.local

