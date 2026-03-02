# Plan de Desarrollo - Mango's Grill PWA

> **Restaurante de comida venezolana en Texas, EE. UU.**
> Plataforma bilingue (Espanol/Ingles) | PWA con Next.js App Router

---

## Analisis del Kit de Interfaces (Referencia Visual)

### Paleta de Colores Extraida
| Token               | Hex Aproximado | Uso                                          |
|----------------------|---------------|----------------------------------------------|
| `cream`              | `#F5F0E8`     | Fondo principal de paginas                   |
| `cream-dark`         | `#EDE5D8`     | Fondo de secciones alternas                  |
| `brown-900`          | `#2C1810`     | Navbar, footer, textos principales (oscuro)  |
| `brown-800`          | `#3B2314`     | Sidebar admin, secciones hero oscuras        |
| `brown-700`          | `#5C3D2E`     | Textos secundarios oscuros                   |
| `brown-600`          | `#8B6F47`     | Textos de body, labels                       |
| `terracotta`         | `#C4956A`     | Botones primarios, acentos, links activos    |
| `terracotta-light`   | `#D4A574`     | Hover de botones primarios, gradientes       |
| `gold`               | `#C9A94E`     | CTAs principales (Add to cart, Checkout)      |
| `gold-light`         | `#D4B85A`     | Hover de CTAs dorados                        |
| `olive`              | `#6B7F3A`     | Tags de estado (Active), badges "Popular"    |
| `success`            | `#5B8C5A`     | Confirmaciones, estado Delivered             |
| `warning`            | `#D4A043`     | Alertas, estado Preparing                    |
| `error`              | `#C75C3A`     | Errores, estado Cancelled, Delete            |
| `info`               | `#5A7FB5`     | Estado In Transit, links informativos        |
| `white`              | `#FFFFFF`     | Superficies de cards, modales                |
| `surface`            | `#FAF8F4`     | Fondo interno de secciones dentro de cards   |

### Tipografia
| Nivel         | Tamano | Peso      |
|---------------|--------|-----------|
| Display       | 48px   | Semibold  |
| Heading 1     | 36px   | Semibold  |
| Heading 2     | 28px   | Semibold  |
| Heading 3     | 22px   | Semibold  |
| Heading 4     | 18px   | Semibold  |
| Body          | 16px   | Regular   |
| Body small    | 14px   | Regular   |
| Caption       | 12px   | Regular   |

**Familia tipografica:** Inter (o equivalente sans-serif geometrico, compatible con Google Fonts).

### Componentes UI Clave
- **Botones:** Primarios (terracotta con gradiente sutil, bordes redondeados ~8px), Secundarios (outline brown), CTAs (gold), Pill/Tags, Icon buttons circulares
- **Cards:** Fondo blanco, border-radius ~12px, sombra sutil `shadow-sm`, hover con elevacion
- **Inputs:** Bordes sutiles `#E0D8CC`, border-radius ~8px, labels encima, focus con borde terracotta
- **Tags/Chips:** Pill shape con borde, seleccion con fondo terracotta y texto blanco
- **Toasts (Sonner):** Icono a la izquierda + titulo + descripcion, 4 variantes (success, error, warning, info)
- **Modales (Radix UI):** Fondo blanco, overlay gris, X para cerrar, border-radius ~16px
- **Toggles:** Switch con estado on (terracotta) / off (gris)
- **Glassmorphism:** Efecto de fondo semi-transparente con backdrop-blur en hero sections y algunos overlays

---

## FASE 0: Inicializacion del Proyecto y Configuracion Base
> Scaffold del proyecto, dependencias, configuracion de Tailwind con tokens del Kit, estructura de carpetas.

- [x] **0.1** Inicializar proyecto Next.js 14+ con App Router, TypeScript estricto (`strict: true`)
- [x] **0.2** Instalar y configurar dependencias core:
  - Tailwind CSS + PostCSS + archivo `tailwind.config.ts` con todos los tokens de color, tipografia, sombras y border-radius del Kit
  - Framer Motion
  - Radix UI (Dialog, Dropdown Menu, Popover, Toggle, Toast provider)
  - Sonner (toast notifications)
  - Lucide React (iconos)
  - React Hook Form + Zod
  - next-intl (internacionalizacion ES/EN)
- [x] **0.3** Configurar estructura de carpetas:
  ```
  src/
    app/
      [locale]/
        (public)/          # Rutas publicas (home, menu, locations, etc.)
        (auth)/            # Login, Register, Forgot Password
        (customer)/        # Panel del cliente (dashboard, profile, orders...)
        (admin)/           # Panel de administracion
        api/               # Route handlers
      layout.tsx
    components/
      ui/                  # Componentes base (Button, Input, Card, Modal, Toast...)
      layout/              # Navbar, Footer, Sidebar
      shared/              # Componentes reutilizables complejos
    lib/
      db/                  # Conexion MongoDB, modelos Mongoose
      auth/                # Configuracion NextAuth
      validators/          # Schemas Zod compartidos
      utils/               # Helpers (formatPrice, taxCalculation, etc.)
      constants/           # Constantes (roles, estados de pedido, tax rate TX)
    hooks/                 # Custom React hooks
    types/                 # Tipos TypeScript globales
    i18n/                  # Archivos de traduccion ES/EN
  ```
- [x] **0.4** Crear archivo `.env.example` documentado con todas las variables:
  ```
  # Base de Datos
  MONGODB_URI=
  # Auth
  NEXTAUTH_URL=
  NEXTAUTH_SECRET=
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  APPLE_CLIENT_ID=
  APPLE_CLIENT_SECRET=
  # Pagos
  STRIPE_SECRET_KEY=
  STRIPE_PUBLISHABLE_KEY=
  STRIPE_WEBHOOK_SECRET=
  # Correos
  RESEND_API_KEY=
  RESEND_FROM_EMAIL=
  # App
  NEXT_PUBLIC_APP_URL=
  NEXT_PUBLIC_TX_TAX_RATE=0.0825
  ```
- [x] **0.5** Configurar ESLint + Prettier con reglas estrictas de TypeScript
- [x] **0.6** Configurar PWA: `next-pwa` o `@ducanh2912/next-pwa`, crear `manifest.json` (nombre, iconos, colores del tema, display standalone), meta tags para PWA en layout raiz

---

## FASE 1: Sistema de Diseno - Componentes UI Base
> Transcribir el Kit Interface a componentes React reutilizables con Tailwind. Es el cimiento visual de toda la app.

- [x] **1.1** Componente `Button` con variantes: `primary` (terracotta), `secondary` (outline), `cta` (gold), `ghost`, `destructive` (error), `icon`. Tamanos: `sm`, `md`, `lg`. Estados: hover, active, disabled, loading (spinner)
- [x] **1.2** Componente `Input` con variantes: text, email, password (toggle visibility), phone, number, textarea. Integracion con React Hook Form + mensajes de error Zod
- [x] **1.3** Componente `Select` (Radix UI Select) estilizado segun el Kit
- [x] **1.4** Componente `Card` con variantes: default, elevated, interactive (hover). Soporte para Glassmorphism via prop
- [x] **1.5** Componente `Modal` (Radix UI Dialog) con variantes: default, confirmation (Cancel reservation), destructive (Delete item), success (Reservation confirmed)
- [x] **1.6** Componente `Badge` / `Tag` / `Chip`: variantes para estados (New, Preparing, Ready, Delivered, Cancelled, Active, Disabled, Pending, Completed, Confirmed, Seated, Refunded, Failed), seleccionables (occasion tags)
- [x] **1.7** Componente `Toggle` / Switch estilizado (on=terracotta, off=gris)
- [x] **1.8** Configurar Sonner con estilos del Kit: 4 variantes de toast (success con icono check verde, error con icono X rojo, warning con icono alerta naranja, info con icono calendario/campana azul)
- [x] **1.9** Componente `Avatar` con iniciales (fondo terracotta, texto blanco) como se ve en el navbar logged in y sidebar admin
- [x] **1.10** Componentes auxiliares: `Skeleton` (loading), `Spinner`, `EmptyState`, `Pagination` (segun las tablas del admin), `Breadcrumb`
- [x] **1.11** Componente `Stepper` para el flujo de checkout (3 pasos: Shipping, Payment, Review - circulos numerados con lineas conectoras)

---

## FASE 2: Layout Global - Navbar, Footer, Sidebar Admin
> Estructuras de navegacion que envuelven todas las paginas.

- [x] **2.1** Componente `Navbar` publico (no logueado): Logo Mango's Grill + llama, enlaces (Home, Menu, Locations, Reservations, Jobs, Contact), boton Cart con contador. Fondo `brown-900`, links en terracotta. Responsive con hamburger menu mobile
- [x] **2.2** Componente `Navbar` logueado: Anadir icono campana (notificaciones) con badge contador, boton Cart, avatar con nombre + dropdown menu (Dashboard, My Profile, My Orders, Favorites, Reservations, Addresses, Settings, Log Out)
- [x] **2.3** Dropdown de notificaciones: Lista de notificaciones con icono, titulo, descripcion, timestamp, indicador de no leida (punto), enlace "View All Notifications". Overlay tipo popover
- [x] **2.4** Componente `Footer`: Logo + descripcion, columnas Explore y Company con links, seccion "Stay Connected" con input email + boton Subscribe (terracotta), iconos sociales (Instagram, Facebook, Twitter, YouTube), linea divisora, copyright + links Privacy/Terms
- [x] **2.5** Componente `AdminSidebar`: Fondo `brown-900`, logo + "Admin Panel", items de navegacion (Dashboard, Users, Menu, Categories, Payments, Orders, Reservations, Jobs) con iconos Lucide, separador, Settings + Log out, avatar del admin con rol en la parte inferior. Item activo con fondo semi-transparente terracotta
- [x] **2.6** Layout responsivo admin: Sidebar fija en desktop, colapsable en mobile con hamburger

---

## FASE 3: Base de Datos - Modelos Mongoose
> Definir todos los modelos de datos con tipado estricto, indices y validaciones.

- [x] **3.1** Conexion a MongoDB: singleton con cache de conexion para serverless (patron recomendado Next.js)
- [x] **3.2** Modelo `User`: firstName, lastName, email (unique, index), phone, password (hashed), dateOfBirth, gender, role (enum: SuperAdmin/Staff/Client), status (Active/Disabled), avatar, provider (credentials/google/apple), addresses (subdocument array), notificationPreferences, loyaltyPoints, favorites (ref Product[]), createdAt, updatedAt
- [x] **3.3** Modelo `Category`: name (ES/EN), description (ES/EN), image, status (Active/Inactive), sortOrder, productsCount (virtual), timestamps
- [x] **3.4** Modelo `Product` (MenuItem): name (ES/EN), description (ES/EN), price, category (ref), image, status (Available/Unavailable), tags (Popular, Gluten-Free, etc.), nutritionalInfo (calories, protein, carbs, fat), ingredients (ES/EN array), modifiers (array: name, options[]), extras (array: name, price), featured, sortOrder, timestamps
- [x] **3.5** Modelo `Order`: orderNumber (auto-generado secuencial #ORD-XXXX), customer (ref User), items (subdoc array: product ref, quantity, price, modifiers, extras, subtotal), deliveryType (Dine-in/Delivery/Pickup), deliveryAddress, tableNumber, status (enum: New/Preparing/Ready/InTransit/Delivered/Cancelled), paymentMethod, paymentStatus (Pending/Completed/Failed/Refunded), subtotal, taxAmount, taxRate, shippingCost, tip, total, promoCode, notes, timestamps
- [x] **3.6** Modelo `Payment` (Transaction): transactionId (auto-generado TXN-XXXXXX), order (ref), customer (ref User), amount, status (Completed/Pending/Failed/Refunded), method (Visa/Mastercard/Amex/Zelle/Binance/Cash), cardLast4, zelleReference, binanceReference, receiptImage, approvedBy (ref User, para Zelle/Binance), timestamps
- [x] **3.7** Modelo `Reservation`: customer (ref User o guest info: name, phone, email), date, time, partySize, table (ref Table), occasion (enum con todas las opciones del formulario), specialRequests, status (Confirmed/Pending/Cancelled/Completed/Seated/No-show), location, timestamps
- [x] **3.8** Modelo `Table`: number, name, capacity, location (ref Location o string), status (Available/Occupied/Reserved), position (x, y para mapa interactivo SVG), shape (round/square/rectangle), timestamps
- [x] **3.9** Modelo `Job`: title, department (enum), employmentType (Full-time/Part-time/Contract), location, description (ES/EN), requirements (ES/EN), salaryMin, salaryMax, status (Active/Draft/Closed), applications (subdoc array: name, email, phone, experience, status enum, appliedAt), postedAt, timestamps
- [x] **3.10** Modelo `Notification`: user (ref), type (enum: order_confirmed, promo, reservation_reminder, order_delivered, rate_order), title, message, read (boolean), data (object flexible para links/acciones), timestamps
- [x] **3.11** Modelo `Location`: name, city, address, phone, email, hours (subdoc: day, open, close), isFlagship (boolean), mapCoordinates, timestamps
- [x] **3.12** Crear indices MongoDB necesarios y middleware de sanitizacion anti-NoSQL injection en todos los modelos

---

## FASE 4: Autenticacion y Autorizacion (NextAuth.js)
> Login, Registro, Recuperacion, OAuth, RBAC con 3 roles.

- [x] **4.1** Configurar NextAuth.js con App Router: Credentials Provider (email + password con bcrypt), Google Provider, Apple Provider
- [x] **4.2** Pagina de Login: formulario email + password, links "Forgot password?" y "Create account", botones OAuth (Google, Apple), validacion Zod frontend + backend
- [x] **4.3** Pagina de Registro: firstName, lastName, email, phone, password, confirmPassword. Sin verificacion de correo (registro directo). Validacion Zod estricta
- [x] **4.4** Flujo de Recuperacion de Contrasena: Pagina "Forgot Password" (input email), envio de link/OTP via Resend, pagina de Reset Password (nueva contrasena + confirmacion)
- [x] **4.5** Middleware de autorizacion RBAC: proteger rutas `/admin` (solo SuperAdmin y Staff), rutas `/customer` (solo Client autenticado), rutas `/api/admin/*` con verificacion de rol en cada request
- [x] **4.6** Rate limiting en endpoints sensibles: Login (5 intentos/15min), Register (3/hora), Forgot Password (3/hora), usando un middleware ligero con Map en memoria o upstash/ratelimit
- [x] **4.7** Proteccion CSRF habilitada por defecto en NextAuth. Validacion de tokens en todas las mutaciones

---

## FASE 5: Paginas Publicas del Cliente
> Home, Menu, Product Details, Locations, Reservations, Jobs, Contact, About Us.

- [x] **5.1** **Home Page:**
  - Hero section con imagen de fondo, titulo "Authentic Venezuelan Cuisine in the Heart of Texas", botones CTA (View Our Menu, Reserve a Table), efecto Glassmorphism en overlay
  - Banner de descuento "Get Discount Voucher Up To 20%"
  - Seccion "Taste of Venezuela" con grid de 6 imagenes de platos
  - Seccion "A Glimpse Inside Mango's Grill" con galeria de fotos del restaurante
  - Seccion "A Taste of Home" con grid de platos destacados (cards del Kit)
  - Seccion "Reserve Your Table Tonight" con CTA
  - Seccion FAQ "Got Questions? We've Got Answers" con acordeon
  - Animaciones Framer Motion en scroll (fade-in, slide-up)

- [x] **5.2** **Menu Page (SSG para SEO):**
  - Header con titulo "Our Menu" y subtitulo
  - Sidebar de categorias con filtro (All Items, Arepas, Main Courses, Appetizers, Sides, Drinks, Desserts) con iconos
  - Grid de ProductCards: imagen, tag de categoria, nombre, descripcion, precio, boton "+ Add"
  - Generacion estatica con `generateStaticParams` para cada categoria
  - Metadatos dinamicos por categoria

- [x] **5.3** **Product Details Page:**
  - Imagen grande del plato a la izquierda
  - Info: categoria tag, nombre, precio, descripcion completa
  - Tags (Popular, Gluten-Free, etc.)
  - Selector de cantidad (+/-)
  - Boton "Add to cart" (gold CTA)
  - Acordeon "Nutritional Information" (calories, protein, carbs, fat)
  - Seccion "Ingredients" (lista con bullets)
  - Seccion "You may also like" con 3 ProductCards relacionados

- [x] **5.4** **Locations Page:**
  - Header "Our Locations"
  - Imagen aerea/mapa grande
  - 3 cards de ubicaciones (Houston Flagship, East Austin, Deep Ellum Dallas): badge ciudad, nombre, direccion, horario, telefono, boton "Get Directions"

- [x] **5.5** **Reservations Page (MEJORA: Mapa interactivo de mesas):**
  - Formulario de reservacion: Date picker, Time slots (chips seleccionables), Party size (chips 1-7+), Full name, Email, Phone, Occasion (chips seleccionables multiples), Special requests (textarea), boton "Confirm reservation"
  - Panel lateral: Opening hours (tabla dia/hora), Contact us (telefono, email, direccion)
  - **MEJORA SOLICITADA:** Mapa visual interactivo de mesas (SVG/flex-grid): Renderizar las mesas del restaurante con formas (redonda/cuadrada), colores por estado (verde=libre, rojo=ocupada, amarillo=reservada), click en mesa libre para seleccionarla, tooltip con info de la mesa (numero, capacidad)

- [x] **5.6** **Jobs Page:**
  - Header "Join our familia" con badge "We're hiring"
  - Filtros (All locations, Full-time, Part-time)
  - Lista de posiciones: titulo, ubicacion, tipo badge, rango salarial, descripcion, boton "Apply now"
  - Seccion "Why work with us": 3 cards (Health benefits, Free meals, Growth opportunities) con iconos

- [x] **5.7** **Contact Page:**
  - Header oscuro "Get in touch"
  - Formulario: Email, Phone, Subject (select), Message (textarea), boton "Send message"
  - Cards info: Email, Phone, Hours
  - Seccion "Visit us" con mapa placeholder
  - Banner newsletter "Subscribe to our newsletter"

- [x] **5.8** **About Us Page:**
  - Header oscuro "Our Passion for Authentic Venezuelan Cuisine"
  - Seccion historia "A Journey from Caracas to Your Table" con foto
  - Seccion "Our Purpose & Values" (3 cards: Mission, Vision, Values)
  - Contador estadisticas (2018, 50K+, 35+, 100%)
  - Seccion equipo "The People Behind the Flavor" con cards de chef/staff
  - CTA final "Come Experience the Taste of Venezuela"

- [x] **5.9** Implementar internacionalizacion (i18n) con `next-intl`: archivos de traduccion ES/EN para todas las paginas publicas, switcher de idioma, `<html lang="">` dinamico, meta tags hreflang

---

## FASE 6: Carrito de Compras y Flujo de Checkout
> Cart sidebar, flujo de 3 pasos (Shipping, Payment, Review), pagina de exito.

- [x] **6.1** **Estado global del carrito:** Context o Zustand, persistencia en localStorage. Acciones: addItem (con modifiers/extras), removeItem, updateQuantity, clearCart, applyPromoCode
- [x] **6.2** **Cart Sidebar (Sheet/Drawer):** Slide-in desde la derecha, lista de items (imagen, nombre, precio, controles +/-, icono eliminar), Subtotal, Tax (8.25%), Total, input promo code + Apply, boton "Proceed to checkout", link "Continue shopping"
- [x] **6.3** **Checkout Step 1 - Shipping:** Stepper visual (3 circulos), formulario direccion (Full Name, Street Address, City, State, ZIP, Country), seleccion Delivery Option (Standard Free / Express $12.99), boton "Continue to Payment". Auto-rellenar si el usuario tiene direcciones guardadas
- [x] **6.4** **Checkout Step 2 - Payment:** Seleccion metodo (Credit Card, Digital Wallet/Zelle/Binance), formulario tarjeta (Cardholder, Number, Expiry, CVC, checkbox Billing = Shipping), **Para Zelle/Binance:** mostrar datos de pago + upload de comprobante, Order Summary lateral (items, subtotal, tax 8.25%, shipping, total), boton "Continue to Review"
- [x] **6.5** **Checkout Step 3 - Review:** Resumen de items (con Edit), Shipping Address (con Edit), Payment Method (con Edit), desglose total (Subtotal, Tax 8.25%, Shipping, Total destacado en terracotta), boton "Place Order" (gold CTA con icono candado)
- [x] **6.6** **Order Success Page:** Banner oscuro con icono check verde, "Gracias! Your order is confirmed", numero de orden, Order Summary, seccion "What's next?" (3 pasos: Confirmation sent, Order preparation, Ready for pickup), botones "Track your order" y "Continue shopping"
- [x] **6.7** Integracion con Stripe (Payment Intent) para tarjetas. Flujo manual para Zelle/Binance (estado Pending hasta aprobacion admin)

---

## FASE 7: Panel del Cliente (Dashboard Autenticado)
> Todas las subpaginas del area de cuenta del cliente.

- [x] **7.1** **Layout del Cliente:** Sidebar izquierda con avatar (iniciales), nombre, email, badge "Gold Member", navegacion (Dashboard, My Profile, Order History, Addresses, Favorites, Reservations, Settings, Log Out). Responsive: en mobile, navegacion horizontal o menu desplegable
- [x] **7.2** **Dashboard (Account Page):** Cards resumen (Total Orders, Favorites, Reservations, Loyalty Points con iconos), tabla "Recent Orders" (order#, date, items, total, status badge, link), seccion "Upcoming Reservation" (card con fecha, hora, ubicacion, guests, botones Modify/Cancel), seccion "Favorite Dishes" (cards con imagen, nombre, precio, boton Reorder)
- [x] **7.3** **My Profile Page:** Seccion "Personal Information" (FirstName, LastName, Email, Phone, DOB, Gender) con boton Edit, seccion "Change Password" (current, new, confirm), seccion "Notification Preferences" (toggles: Order Updates, Promotions, Reservation Reminders, Newsletter), seccion "Delete Account" destructiva con confirmacion
- [x] **7.4** **Order History Page:** Filtro "All Orders", lista de pedidos agrupados por tarjeta: order#, fecha, status badge, total, items con imagen/nombre/cantidad/precio, botones "Reorder" o "Track Order" segun estado, link "View Details"
- [x] **7.5** **Addresses Page:** Grid de cards de direccion (tipo Home/Office, badge Default, nombre, direccion completa, telefono, iconos edit/delete), boton "+ Add Address", modal para crear/editar
- [x] **7.6** **Favorites Page:** Grid de cards (imagen, nombre, descripcion corta, precio, icono corazon rojo, boton "Add to Cart"), contador "X dishes saved"
- [x] **7.7** **Reservations Page (cliente):** Seccion "Upcoming" con card detallada (fecha grande con mes/dia, titulo, hora, guests, ubicacion, status badge, botones Modify/Cancel), seccion "Past Reservations" con lista, boton "+ New Reservation"
- [x] **7.8** **Settings Page:** Seccion "Language & Region" (selects: Language, Timezone, Currency), seccion "App Preferences" (toggles: Dark Mode, Push Notifications, Email Notifications, SMS Notifications)

---

## FASE 8: Panel de Administracion
> Dashboard, CRUD de todas las entidades, gestion de pedidos y pagos.

- [x] **8.1** **Admin Dashboard:** Cards KPI (Total Orders, Revenue $, Active Users, Pending Reservations con porcentajes vs mes anterior), grafico "Revenue Overview" (barras por dia de la semana, toggle This Month/Last Month), panel "Quick Actions" (4 botones: New Order, Add Menu Item, New Reservation, Export Report), tabla "Recent Orders" (order#, customer, items, total, status badge, actions)
- [x] **8.2** **User Management:** Barra busqueda + filtros (Role dropdown, Status dropdown), tabla (Name con avatar, Email, Role, Status badge, Last Login, Actions: edit/disable/delete), paginacion, boton "+ Add User". Modal Create/Edit User (FirstName, LastName, Email, Phone, Role select, Status select, Password)
- [x] **8.3** **Menu Management:** Filtro por categorias (chips), grid de cards de plato (icono utensilio, nombre, descripcion, precio, toggle disponibilidad on/off), boton "+ Add Dish". Modal Create/Edit Item (Item Name, Category select, Description textarea, Price, Status select, Item Image upload con drag&drop)
- [x] **8.4** **Categories Management:** Grid de cards (imagen, nombre, contador "X products", botones Edit/Delete), boton "+ Add Category". Modal Create/Edit Category (Name, Description, Image upload, Status select)
- [x] **8.5** **Orders Management:** Filtro por status (tabs: All con contador, New, Preparing, Ready, Delivered, Cancelled), tabla expandible (order#, customer, items, total, status badge, date, actions: view/cambiar estado). Fila expandida muestra: Order details (items con precios), Delivery info (tipo, mesa/direccion, notas), Payment (metodo, referencia, subtotal), boton "+ New Order"
- [x] **8.6** **Payment Processing:** Filtros (rango de fechas, status dropdown), tabla "Transactions" (TXN ID, Customer, Amount, Status badge, Date, Payment Method), paginacion, boton Export. **Para Zelle/Binance:** boton para ver comprobante subido y aprobar/rechazar manualmente
- [x] **8.7** **Reservations Management:** Cards KPI (Today's reservations, Guests expected, Capacity %, Cancellations + No-shows), barra busqueda + filtros (Today/date, Status), tabla (Guest Name, Party Size, Date, Time, Status badge, Table, Actions: edit/cancel), boton "+ New Reservation", badge "X/Y seats booked". Modal Create/Edit Reservation (Customer Name, Phone, Email, Date, Time, Party Size, Table select, Status, Occasion chips, Special Requests)
- [x] **8.8** **Jobs Management:** Cards KPI (Active Jobs, Applications, Interviews, Hired), tabs (All Jobs, Active, Draft, Closed), tabla de jobs (Title, Department, Type, Applications count, Posted date, Status badge, Actions), seccion "Recent Applications" (tabla: Applicant con avatar, Position, Applied date, Experience, Status badge, Actions), boton "+ Post New Job". Modal Post Job (Title, Department select, Employment Type select, Location select, Description textarea, Requirements textarea, Min/Max Salary, botones Save as Draft / Publish Job)

---

## FASE 9: API Routes y Logica de Negocio
> Todos los endpoints REST protegidos con validacion doble capa.

- [x] **9.1** API Auth: `POST /api/auth/register`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`. Todas con validacion Zod server-side, sanitizacion de inputs, rate limiting
- [x] **9.2** API Users (Admin): CRUD `/api/admin/users` con proteccion de rol SuperAdmin/Staff
- [x] **9.3** API Categories: `GET /api/categories` (publico, SSG), CRUD `/api/admin/categories` (protegido)
- [x] **9.4** API Products: `GET /api/products` y `GET /api/products/[slug]` (publico, SSG), CRUD `/api/admin/products` (protegido)
- [x] **9.5** API Orders: `POST /api/orders` (cliente crea pedido), `GET /api/orders/my-orders` (cliente), `GET/PATCH /api/admin/orders` (admin: listar, cambiar estado)
- [x] **9.6** API Payments: `POST /api/payments/create-intent` (Stripe), `POST /api/payments/upload-receipt` (Zelle/Binance), `PATCH /api/admin/payments/[id]/approve` (admin aprueba manual)
- [x] **9.7** API Reservations: `POST /api/reservations` (cliente/guest), `GET /api/reservations/my-reservations` (cliente), CRUD `/api/admin/reservations` (admin)
- [x] **9.8** API Tables: `GET /api/tables` (publico, para mapa interactivo), CRUD `/api/admin/tables` (admin)
- [x] **9.9** API Jobs: `GET /api/jobs` (publico), `POST /api/jobs/[id]/apply` (publico), CRUD `/api/admin/jobs` (admin)
- [x] **9.10** API Notifications: `GET /api/notifications` (cliente), `PATCH /api/notifications/mark-read`
- [x] **9.11** API Contact: `POST /api/contact` (envio email via Resend)
- [x] **9.12** API Newsletter: `POST /api/newsletter/subscribe`
- [x] **9.13** Middleware global de seguridad: sanitizacion anti-NoSQL injection en todos los body/query params, validacion Zod en cada endpoint, headers de seguridad (X-Content-Type-Options, X-Frame-Options, etc.)

---

## FASE 10: Integraciones Externas
> Stripe, Resend, Logica de impuestos Texas.

- [x] **10.1** **Stripe:** Crear PaymentIntent desde el backend, confirmar en frontend con Stripe Elements, webhook para confirmar pago completado (`payment_intent.succeeded`), actualizar estado de Order/Payment
- [x] **10.2** **Resend:** Templates de correo transaccional: Bienvenida, Confirmacion de pedido, Estado de pedido actualizado, Reset de contrasena (OTP/Link), Confirmacion de reservacion
- [x] **10.3** **Impuestos Texas:** Constante `TX_TAX_RATE = 0.0825` (8.25%), calculo aplicado en carrito y checkout, mostrado como linea separada "Tax (8.25%)" en todos los resumenes de orden
- [x] **10.4** **Flujo Zelle/Binance:** Mostrar datos de pago del restaurante, subida de comprobante (imagen) via upload a storage, admin ve el comprobante y aprueba/rechaza manualmente, notificacion al cliente del resultado

---

## FASE 11: SEO Tecnico y Rendimiento
> Metadatos, Schema.org, sitemap, robots, optimizacion de imagenes.

- [x] **11.1** Metadatos dinamicos en cada pagina con `generateMetadata`: titulos, descripciones, OpenGraph, Twitter Cards. Orientados a keywords ("best arepas in Texas", "authentic Venezuelan food near me", "Venezuelan restaurant Houston")
- [x] **11.2** Marcado Schema.org JSON-LD: `Restaurant`, `LocalBusiness` (nombre, direccion, horarios, telefono, coordenadas), `MenuItem` en cada producto, `FAQPage` en home
- [x] **11.3** Sitemap automatico con `app/sitemap.ts`: URLs de todas las paginas publicas, productos, categorias, trabajos. Soporte multilingue (es/en)
- [x] **11.4** `robots.txt` con `app/robots.ts`: permitir crawlers en paginas publicas, bloquear `/admin`, `/api`, `/customer`
- [x] **11.5** Optimizacion de imagenes: Todas con componente `<Image />` de Next.js, formato WebP, `loading="lazy"` para below-the-fold, `priority` para hero/LCP, tamanos responsivos con `sizes`
- [x] **11.6** Tags `<link rel="alternate" hreflang="es">` y `hreflang="en"` en cada pagina para SEO multilingue
- [x] **11.7** Auditar Core Web Vitals > 90/100: reducir CLS, optimizar LCP (hero image priority), minimizar FID/INP

---

## FASE 12: PWA, Seguridad Final y Despliegue
> Service workers, seguridad reforzada, configuracion Vercel.

- [x] **12.1** Configuracion PWA completa: `manifest.json` con iconos en multiples resoluciones, colores del tema (brown-900 + terracotta), service worker para cache offline de assets estaticos, prompt de instalacion
- [x] **12.2** Revision de seguridad: Verificar prevencion NoSQL injection en todos los modelos, XSS sanitizado en todos los inputs renderizados, CSRF activo en NextAuth, rate limiting en todos los endpoints sensibles, headers de seguridad en `next.config.js`
- [x] **12.3** Archivo `vercel.json` optimizado si es necesario, configuracion de variables de entorno en Vercel, dominio personalizado
- [x] **12.4** Seed script para base de datos: crear SuperAdmin inicial, categorias base, productos de ejemplo, mesas del restaurante para el mapa interactivo
- [x] **12.5** Testing final end-to-end: flujo completo de compra (registro > menu > carrito > checkout > pago > confirmacion), flujo de reservacion con mapa de mesas, flujo admin (gestionar pedidos, aprobar pagos, CRUD entidades)
- [x] **12.6** Actualizar este archivo `plan_desarrollo.md` marcando todas las fases como completadas

---

## Resumen de Fases

| Fase | Descripcion                                   | Dependencias |
|------|-----------------------------------------------|-------------|
| 0    | Inicializacion y Configuracion Base           | Ninguna      |
| 1    | Sistema de Diseno - Componentes UI            | Fase 0       |
| 2    | Layout Global (Navbar, Footer, Sidebar)       | Fase 1       |
| 3    | Base de Datos - Modelos Mongoose              | Fase 0       |
| 4    | Autenticacion y Autorizacion                  | Fase 3       |
| 5    | Paginas Publicas del Cliente                  | Fase 2       |
| 6    | Carrito y Checkout                            | Fase 5, 3    |
| 7    | Panel del Cliente                             | Fase 4, 5    |
| 8    | Panel de Administracion                       | Fase 4, 3    |
| 9    | API Routes y Logica de Negocio                | Fase 3, 4    |
| 10   | Integraciones Externas (Stripe, Resend, Tax)  | Fase 9       |
| 11   | SEO Tecnico y Rendimiento                     | Fase 5       |
| 12   | PWA, Seguridad Final y Despliegue             | Todas        |

> **Nota:** Las fases 3 y 0 pueden ejecutarse en paralelo. Las fases 9 y 10 se integran iterativamente con las fases 5-8 a medida que se construyen las paginas. La fase 12 es la consolidacion final.
