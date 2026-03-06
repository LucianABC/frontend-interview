

## Características Principales

### 1. Arquitectura de Estado Optimista
Implementamos un sistema donde la UI reacciona instantáneamente a las acciones del usuario, sin esperar la respuesta del servidor.

Creación/Borrado Instantáneo: Las listas y tareas aparecen y desaparecen al momento.

Reordenamiento Drag & Drop: Movimiento de ítems fluido con persistencia de orden inmediata.

Eye-Animation System: Sistema visual que alterna entre Eye-0 (estado en reposo/sincronizado) y Eye-1 (estado de parpadeo/sincronizando) para dar feedback sutil al usuario mientras la API responde.

### 2. Persistencia y Sincronización

Estrategia de LocalStorage: Guardamos el orden de los IDs localmente para mantener la personalización del usuario incluso tras recargar la página.

Auto-Rollback: En caso de error en la API (ej. caída de red), el sistema restaura automáticamente tanto la UI como el LocalStorage al último estado válido conocido.

Caché Inteligente: Las listas ya visitadas se cargan instantáneamente desde la memoria mientras se actualizan en segundo plano.


## Stack Tecnológico

### Frontend: 
React 19 (Hooks: useOptimistic, useTransition, useContext).

### Estilos: 
SCSS Modules (Arquitectura BEM).

### Testing: 
Vitest + React Testing Library.

### Herramientas: 
TypeScript para un tipado estricto y seguro.

### Drag and drop: 
DnDKit

## Estructura del Contexto de Datos
El ListContext es el cerebro de la aplicación. Maneja el flujo de datos de la siguiente manera:

Captura de Snapshot: Antes de cualquier cambio, guardamos el estado actual.

Dispatch Optimista: Actualizamos la UI inmediatamente mediante startTransition.

Llamada Asíncrona: Se intenta persistir en la API.

Resolución/Reversión: Si hay éxito, el estado se consolida. Si hay error, se aplica el rollback del snapshot.

## Notas de Implementación

- Input Components: Se desarrollaron componentes reutilizables como InputWithButton, optimizados para interacciones de teclado (Enter) y clicks táctiles, con soporte para forwardRef.
- Se tuvieron en cuenta conceptos de accesibilidad web.
- Admite theme light y dark y responsive.


Como IA de ayuda utilicé principalmente Gemini IA.
### Prompts:
https://gemini.google.com/share/f08690451f3a