# FisioHub

SaaS de gestión para clínicas de fisioterapia. Multi-tenant, con soporte para múltiples sedes, roles diferenciados y flujo clínico completo — desde agendar una cita hasta registrar la nota de sesión.

Primer cliente: **Fisiomass Perú**.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript 6 + Vite 8 |
| Estilos | Tailwind CSS v4 + design system propio (`fh-*`) |
| Backend / DB | Supabase (Postgres + Auth) |
| Routing | React Router 7 |
| Íconos | Lucide React |
| Fechas | date-fns (locale `es`) |

---

## Arquitectura

La jerarquía de datos es: **Clinic → Branch → Staff / Patients**.

Cada clínica puede tener múltiples sedes. Los admin pueden cambiar de sede en tiempo real; terapeutas y recepcionistas están fijos a su sede asignada.

### Roles

| Rol | Acceso |
|---|---|
| `admin` | Dashboard, equipo, paquetes, reportes, cambio de sede |
| `receptionist` | Agenda, pacientes, nueva cita |
| `therapist` | Sus sesiones del día, nota de sesión |
| `patient` | Portal del paciente *(próximamente)* |

### Módulos implementados

- **Agenda diaria** — vista por sede, filtro de estado, modal nueva cita
- **Pacientes** — listado con búsqueda, ficha de detalle (info, sesiones, paquetes)
- **Sesiones** — vista del terapeuta con stats, modal de nota clínica (chips de tratamientos y zonas)
- **Encuesta de satisfacción** — se dispara automáticamente al completar una cita
- **Admin — Equipo** — crear terapeutas y recepcionistas (cuenta auth + perfil)
- **Admin — Paquetes** — crear, editar, activar/desactivar
- **Admin — Reportes** — métricas del mes

---

## Design System

Los tokens viven en `src/styles/tokens.css` como variables `@theme` de Tailwind v4. Las clases `fh-*` son recetas semánticas definidas en `@layer components`.

Paleta: neutrales slate (`ink-*`), acento azul profundo (`#1e3a8a → #3b82f6`), colores semánticos (ok / warn / bad).

Los componentes primitivos están en `src/components/ui/` y se exportan desde el barrel `index.ts`:

`Button` · `Badge` · `Avatar` · `Card` · `Input` · `Textarea` · `Select` · `Tabs` · `TabLine` · `TabPanel` · `Toast` · `useToast`

---

## Desarrollo

```bash
# Requiere pnpm
cp .env.example .env   # agregar credenciales Supabase

pnpm install
pnpm dev               # http://localhost:5173
pnpm build             # type-check + build → ./dist/
pnpm lint
pnpm preview           # http://localhost:4173
```

### Variables de entorno

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Sin estas variables la app muestra una pantalla de configuración en lugar de cargar.

---

## Roadmap

**Fase 2 — Producto**
- Formulario de intake del paciente (link público, sin auth)
- Venta de paquetes con descuento automático de sesiones
- Recordatorios por email y WhatsApp (Resend + Twilio)
- Suscripciones y cobro automático (Culqi + Yape Business)
- Portal del paciente

**Fase 3 — IA** *(Claude API)*
- Voz → nota de sesión estructurada
- Análisis de intake → recomendación de paquete
- Alertas de churn y predicción de no-shows
- BI en lenguaje natural para la dueña de la clínica
