# FisioHub — Tareas pendientes

## ✅ Completado
- [x] Scaffold React + Vite + TypeScript
- [x] Tailwind CSS v4 + sistema de diseño (azul profundo, inspirado en Eterna)
- [x] Supabase configurado y conectado
- [x] Schema de base de datos con sedes (clinics → branches → todo lo demás)
- [x] Auth con roles (admin, receptionist, therapist, patient)
- [x] AuthContext con `activeBranch` y `branches` — admin puede cambiar de sede
- [x] AppShell con sidebar responsive + selector de sede para admin
- [x] Login page (split screen, estilo premium)
- [x] Agenda diaria — filtrada por sede activa
- [x] Modal nueva cita (buscar paciente, seleccionar terapeuta de la sede, hora, duración)
- [x] Vista de pacientes (listado, búsqueda, modal de detalle con tabs)
- [x] Modal nuevo paciente
- [x] Modal detalle paciente (tabs: info, sesiones, paquetes)
- [x] Vista terapeutas — sesiones del día (stats + barra de progreso)
- [x] Modal nota de sesión (chips de tratamientos + zonas del cuerpo)
- [x] Vista admin — Equipo (crear terapeutas y recepcionistas con cuenta auth + perfil + tabla therapists)
- [x] Vista admin — Paquetes (crear, editar, activar/desactivar)
- [x] Vista admin — Reportes (métricas del mes)
- [x] Encuesta de satisfacción (aparece automáticamente al completar cita, rating 1-10 con labels)

### Design System (`src/styles/tokens.css` + `src/components/ui/`)
- [x] Design tokens en `@theme` — ink-*, blue-*, ok-*, warn-*, bad-*, radii, shadows, fonts
- [x] CSS recipes `fh-*` en `@layer components` aplicadas a todos los componentes existentes
- [x] `Button` — variantes primary/secondary/ghost/soft/danger · tamaños sm/md/lg · icon-only
- [x] `Badge` — variantes blue/green/amber/red/slate · con dot opcional
- [x] `Avatar` — tamaños xs/sm/md/lg/xl · gradiente opcional
- [x] `Card` — wrapper con `fh-card`
- [x] `Input` + `Textarea` — label, error, hint, prefix, suffix
- [x] `Select` — dropdown custom con grupos, label, error, outside-click
- [x] `Tabs` (segmentado) + `TabLine` (subrayado) + `TabPanel`
- [x] `Toast` + `useToast` hook — 4 variantes, auto-dismiss 4s

---

## 🔐 Auth — flujos pendientes

- [ ] **Recuperar contraseña** — "¿Olvidaste?" dispara email de reset via Supabase Auth; necesita `ForgotPasswordPage` (input email + submit) y `ResetPasswordPage` (nueva contraseña + confirmación, ruta `/auth/reset`)
- [ ] **Mantener sesión iniciada** — si el checkbox está desmarcado, usar `sessionStorage` en lugar de `localStorage` para que la sesión expire al cerrar el browser; configurar `persistSession` en el cliente Supabase según el estado del checkbox al hacer login
- [ ] **Solicitar demo** — modal desde el login con campos: nombre, clínica, email, teléfono, ciudad; guarda en tabla `demo_requests` en Supabase; opcional: notificación por email con Resend
- [ ] **Google SSO** — activar OAuth provider Google en Supabase, descomentar `handleGoogle` y el botón en `LoginPage`; definir flujo para usuarios invitados por admin vs. acceso directo con Google

---

## 🟡 Importante (parte del pitch)

- [ ] **Formulario de perfil inicial del paciente (intake)** — link público enviado al paciente nuevo, sin login
- [ ] **Dashboard admin con métricas reales** — tasa de retención, sesiones por terapeuta, calificación promedio, paquetes próximos a vencer
- [ ] **Venta de paquetes** — desde el perfil del paciente el admin asigna paquete; sesiones se descuentan automáticamente
- [ ] **Portal del paciente** — vista autenticada: historial de sesiones y paquetes activos
- [ ] **Recordatorios automáticos email** — email al paciente 24h antes de su cita (Supabase Edge Functions + Resend)
- [ ] **Recordatorios automáticos WhatsApp** — mensaje WhatsApp 1h antes de la cita (Twilio WhatsApp API + Supabase Edge Functions)

---

## 💳 Monetización y pagos (Fase 2 — alto impacto)

> Stack: Culqi (tarjetas) + Yape Business API (Yape) + Supabase Edge Functions

- [ ] **Suscripciones mensuales** — planes Básico (2 ses/S/130), Regular (4 ses/S/240), Intensivo (8 ses/S/440); sesiones se resetean cada mes; cron mensual en Edge Function
- [ ] **Cobro automático con Culqi** — paciente registra tarjeta una vez, la suscripción se cobra sola cada mes sin intervención humana
- [ ] **Link de pago por WhatsApp** — recepcionista genera link de cobro para paquete o suscripción; paciente paga desde el celular antes de llegar
- [ ] **Yape Business API** — cobros por Yape con confirmación automática (requiere RUC y aprobación de BCP)
- [ ] **Historial de pagos** — vista admin con todos los cobros, estado (pagado/pendiente/fallido), método de pago
- [ ] **Facturas automáticas** — generar y enviar comprobante por email al confirmar pago

---

## 🟢 Valor agregado (Fase 2 — SaaS)

- [ ] **Onboarding de nueva clínica** — formulario para crear clinic + branch + primer admin sin tocar Supabase
- [ ] **Reportes consolidados multi-sede** — vista total clínica vs. desglose por sede
- [ ] **Gestión de horarios por terapeuta** — disponibilidad, bloqueo de días
- [ ] **Historial cronológico por paciente** — todo lo que se le ha hecho en orden
- [ ] **Exportar reportes a PDF/Excel**
- [ ] **WhatsApp recordatorios avanzados** — mensajes post-sesión, seguimiento de progreso, reactivación de pacientes inactivos
- [ ] **App móvil** — PWA o React Native para terapeutas

---

## 🤖 Inteligencia Artificial (Fase 3 — diferenciador SaaS)

> Stack: Claude API (`claude-sonnet-4-6`) + Supabase Edge Functions

- [ ] **Voz → nota de sesión estructurada** — terapeuta graba 30seg, IA transcribe y rellena los chips de tratamientos/zonas automáticamente. Resuelve el dolor más grande del flujo diario.
- [ ] **Análisis de intake → recomendación de paquete** — al completar el formulario inicial, IA lee motivo/historial y sugiere a la doctora qué paquete ofrecer con justificación clínica.
- [ ] **Alertas de churn** — detecta pacientes con paquete activo sin agendar en X días y alerta a recepción con un botón de contacto directo. Dinero recuperable con un click.
- [ ] **Resumen de progreso del paciente** — analiza todas las notas de sesión y genera narrativa: evolución del dolor, qué tratamientos funcionaron mejor, hitos alcanzados. Útil para la doctora y wow factor para el paciente.
- [ ] **Predicción de no-shows** — basado en historial del paciente (cancelaciones previas, día/hora), predice riesgo y dispara recordatorio proactivo.
- [ ] **BI en lenguaje natural** — la dueña pregunta "¿qué terapeuta tiene mejor calificación este mes?" o "¿cuánto generó cada sede en abril?" y el sistema responde sin dashboards complejos.

---

## 🎨 Design system — pendiente

### Estados faltantes en componentes existentes
- [x] `Button` — agregar `:focus-visible` (accesibilidad teclado) y `:active` (feedback de press)
- [x] `Input` — agregar estado `:disabled` (fondo gris, cursor not-allowed)
- [x] `Select` — mover lógica de colores de focus/error de inline styles a clases CSS en tokens.css

### Componentes pendientes
- [x] `Checkbox` — con label, error, indeterminate state
- [x] `Radio` / `RadioGroup` — opciones mutuamente exclusivas con label
- [x] `Toggle` / `Switch` — encendido/apagado con label
- [x] `DatePicker` — selector de fecha (calendar dropdown)
- [x] `TimePicker` — selector de hora (scroll o dropdown de slots)

---

## 🔧 Técnico pendiente

- [ ] **Code splitting** — bundle en 535kb, dividir con lazy imports por ruta
- [ ] **Toast notifications** — reemplazar strings de error por notificaciones globales
- [ ] **Nombre de clínica dinámico** — "Fisiomass Perú" hardcodeado en sidebar, leer de DB
