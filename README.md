# duki

Nota: La raíz de GitHub Pages (`/duki/`) usa `index.html` como pantalla de bienvenida. En este repo es un **login unificado**: dependiendo del usuario/PIN, redirige a demo de socio, staff o director.

## Demo (sin backend)

Este repo incluye demos estáticas en HTML/JS para presentar el flujo del sistema.

### Páginas

- **`demo.html` (Demo interna / staff)**
  - Simula al personal (mesero/caja) atendiendo a un socio.
  - Se ingresa un UID (simulando lectura NFC del socio) y luego el PIN del socio.
  - Permite simular recargas y visualizar menú/precios por categoría.

- **`demo2.html` (Demo socio)**
  - Simula el portal informativo del socio.
  - El socio no recarga aquí: solo consulta saldo y ve menú aplicable.
  - Por diseño, se espera que el socio llegue aquí tras “tocar” (NFC) la etiqueta del staff.

## Contexto por NFC (qué es y para qué sirve)

En las demos, el “NFC” no autentica a la persona: solo **aporta contexto** para que la app sepa desde dónde se está accediendo.

Ese contexto puede incluir:

- **Ubicación** (Lapetro / Atasta / Entretenimiento)
- **Staff** (identificador del mesero o caja)
- **Estación** (ej. `s1`, `barra`, `caja`)

La autenticación real (para ver datos sensibles) se mantiene como:

- **PIN del socio** (y en un futuro: credenciales por rol para el staff).

## ¿Qué pasa al escanear cada demo?

### Escanear / abrir `demo.html` (staff)

- **Se abre la vista interna**.
- La sucursal se elige en un selector (Lapetro / Atasta).
- El staff captura el UID del socio (simulando NFC del socio) y el socio ingresa su PIN.

Uso típico en demo/presentación:

- El staff abre `demo.html` manualmente en su dispositivo, o bien se puede abrir desde un NFC propio “de staff” (ver recomendaciones abajo).

### Escanear / abrir `demo2.html` (socio)

- El portal del socio tiene una protección de demo: **si no llega con un “token” de acceso**, muestra “No disponible”.
- Ese token simula que el socio llegó desde el NFC del mesero (contexto válido y temporal).

En otras palabras:

- **Abrir `demo2.html` directo** (copiar/pegar URL) → puede mostrar **No disponible**.
- **Abrir `demo2.html` con token** (simulando “tap NFC del staff”) → muestra el login del socio.

## Recomendación: ¿uno o más NFCs?

Depende del objetivo. Para una demo, lo ideal es separar por rol.

### Opción A (mínima, demo rápida)

- **1 NFC “Staff”**: abre `demo.html`.
- **1 NFC “Mesero”**: abre `demo2.html` con contexto/token.

Ventajas:

- Fácil de explicar.
- Menos etiquetas.

### Opción B (realista / multi-sucursal)

Usar **1 NFC por estación/rol/sucursal**, por ejemplo:

- `NFC Staff Lapetro / Caja` → abre `demo.html` con `location=lapetro`.
- `NFC Staff Atasta / Caja` → abre `demo.html` con `location=atasta`.
- `NFC Mesero 01 / Lapetro / s1` → abre `demo2.html` con `staff=mesero_01&station=s1&location=lapetro`.

Ventajas:

- El contexto queda “amarrado” al punto físico.
- Permite auditoría (quién cobró, dónde, en qué estación).
- Escala mejor cuando hay muchas estaciones.

### Opción C (extremo, para operación con muchos empleados)

- **NFC por empleado + NFC por estación**.

No es necesario para la demo inicial; se usa cuando quieres rastrear con precisión el flujo operativo.

