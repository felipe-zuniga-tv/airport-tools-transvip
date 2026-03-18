# Transvip Airport Tools

Aplicación interna de **Transvip Chile** para operación aeroportuaria. Centraliza el monitoreo de la **Zona Iluminada**, la consulta de reservas, la revisión de conductores y vehículos, y herramientas QR para operación en terreno.

## Descripción

El proyecto está construido con **Next.js App Router** y consume servicios internos de Transvip para mostrar información operacional en tiempo real. La app protege sus módulos mediante sesión con cookie HTTP-only y expone route handlers locales para encapsular la integración con las APIs internas.

## Módulos principales

### Zona Iluminada
- Monitoreo de flota por aeropuerto.
- Refresco periódico del dashboard.
- Eliminación de vehículos desde la zona cuando la configuración del aeropuerto lo permite.
- Vista por sede y zona operativa.

### Reservas
- Búsqueda por ID de reserva.
- Detalle operacional y comercial del servicio.
- Información de pasajero, conductor, vehículo, pago y trazabilidad del viaje.

### Conductores y vehículos
- Perfil del conductor, rating y estado operacional.
- Información documental y técnica del vehículo asignado.

### Herramientas QR
- Generación de códigos QR.
- Escáner QR integrado para flujos operativos.

## Aeropuertos configurados

Actualmente existen configuraciones activas para:

- `SCL` - Santiago
- `ANF` - Antofagasta
- `CJC` - Calama
- `CJC2` - Calama (Los Olivos)

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `Radix UI`
- `shadcn/ui`
- `Lucide React`
- `Vitest`
- `ESLint`

## Rutas relevantes

- `/` - login
- `/aeropuerto` - acceso principal a herramientas de aeropuerto
- `/aeropuerto/zi/[airport]` - dashboard de Zona Iluminada por aeropuerto
- `/qr` - herramientas QR
- `/api/*` - route handlers para integración server-side

## Estructura del proyecto

```text
app/
├── (protected-apps)/        # Vistas protegidas por sesión
├── api/                     # Endpoints internos del App Router
├── layout.tsx               # Layout global
└── page.tsx                 # Login
components/
├── airport/                 # UI del dashboard aeroportuario
├── auth/                    # Login, logout y flujo de sesión
├── booking/                 # Búsqueda y detalle de reservas
├── qr/                      # Generación y escaneo QR
└── ui/                      # Componentes base
hooks/                       # Hooks cliente para polling y fetch
lib/
├── airport/                 # Lógica de dominio aeroportuario
├── auth/                    # Helpers de autenticación
├── config/                  # Configuración de zonas y negocio
├── main/                    # Integración con APIs internas
└── types.ts                 # Tipos compartidos
utils/                       # Rutas y utilidades generales
```

## Requisitos

- `Node.js 18+`
- `npm`
- Acceso a red interna o VPN de Transvip para consumir las APIs privadas

## Variables de entorno

Crear un archivo `.env.local` con los endpoints y configuración requeridos por la aplicación:

```bash
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_API_ADMIN_LOGIN_ROUTE=
NEXT_PUBLIC_API_ADMIN_IDENTITY=

GET_VEHICLE_STATUS=
GET_VEHICLE_DETAIL=
SEARCH_DRIVER=
GET_DRIVER_PROFILE=
GET_DRIVER_RATINGS=
GET_BOOKING_INFO_FULL=
GET_BOOKING_BY_ID=
GET_ZONA_ILUMINADA_CITY=
GET_ZONA_ILUMINADA_SERVICES=
GET_STATUS_AIRPORT_CITY=
DELETE_VEHICLE_FROM_ZONA_ILUMINADA=

MINUTES_TO_EXPIRE=60
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Autenticación

- El login usa credenciales de administración contra servicios internos.
- La sesión se guarda en una cookie HTTP-only.
- Las rutas bajo `app/(protected-apps)` requieren una sesión válida.
- Si el backend no es accesible, el flujo de login puede fallar, por ejemplo cuando no hay conexión a VPN.

## Notas de desarrollo

- La lógica de integración con APIs vive principalmente en `lib/main/functions.ts`.
- La configuración de aeropuertos y capacidades por zona vive en `lib/config/airport.ts`.
- Existe cobertura de pruebas con `Vitest` en al menos una parte del dominio aeroportuario.

---

© 2026 Transvip Chile - Operaciones Aeropuerto
