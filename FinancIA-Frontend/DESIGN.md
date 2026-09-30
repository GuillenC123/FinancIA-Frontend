---
name: FinancIA
description: Finanzas personales con asistente de IA para Perú; un libro contable moderno y tranquilo.
colors:
  ground: "#f4f6f5"
  surface: "#ffffff"
  surface-sunk: "#eef2f0"
  ink: "#14201e"
  ink-muted: "#4a5955"
  ink-subtle: "#5f6c68"
  line: "#dde3e1"
  line-strong: "#c5cfcb"
  petrol: "#0f5f59"
  petrol-deep: "#0b4a45"
  petrol-soft: "#e4f0ee"
  petrol-ring: "rgba(15, 95, 89, 0.22)"
  income: "#1e7a3a"
  income-soft: "#e6f3ea"
  expense: "#b42318"
  expense-soft: "#fbebe9"
  chart-ochre: "#b8802a"
  chart-stone: "#aeb8b4"
  chart-muted: "#c9dedb"
typography:
  display:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-compact:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  figure-lg:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.015em"
    fontFeature: "tnum"
  page-title:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  figure-md:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  page-title-compact:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  figure-sm:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 650
    lineHeight: 1.15
    fontFeature: "tnum"
  dialog-title:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.3
  lead:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  title:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  figure:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    fontFeature: "tnum"
  label:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.35
  meta:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
  caption:
    fontFamily: "Public Sans, Segoe UI, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  item: "6px"
  control: "8px"
  popover: "10px"
  card: "12px"
  bubble: "14px"
  dialog: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  4xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.surface}"
    typography: "{typography.figure}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.petrol-deep}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-sunk}"
    textColor: "{colors.ink-subtle}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-sunk}"
  button-new-consultation:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    height: "44px"
  select-control:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  menu:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.popover}"
    padding: "4px"
  menu-item:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.item}"
    padding: "0 10px"
    height: "36px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  card-accent:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px"
  assistant-surface:
    backgroundColor: "{colors.petrol-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  question-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.popover}"
    padding: "12px 14px"
  question-card-selected:
    backgroundColor: "{colors.petrol-soft}"
  nav-item:
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  nav-item-active:
    backgroundColor: "{colors.petrol-soft}"
    textColor: "{colors.petrol}"
    rounded: "{rounded.control}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "36px"
  chip-active:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  brand-mark:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    size: "32px"
  assistant-avatar:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    size: "36px"
  user-bubble:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.bubble}"
    padding: "10px 14px"
  assistant-bubble:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.bubble}"
    padding: "14px 16px"
  dialog:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.dialog}"
    padding: "24px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.popover}"
    padding: "12px 16px"
---

# Design System: FinancIA

## Overview

**Creative North Star: "El libro contable tranquilo"**

FinancIA maneja el dinero de personas que no son expertas y que desconfían de lo que parece un juguete. La interfaz se comporta como un buen libro contable: ordenada, predecible y sin adornos, para que las cifras se lean primero y se crean. Todo lo que no ayuda a leer un monto o a tomar una decisión se retira.

La densidad es media: aire suficiente para una persona que revisa su plata en el bus, pero sin tarjetas decorativas ni gráficos de relleno. El color no decora; marca acción, estado, el signo del dinero y, una sola vez por vista, la cifra que importa. La marca es un monograma "F" sobre petróleo que también es la voz del asistente: donde habla FinancIA, aparece la F.

Se rechaza expresamente la estética de plantilla SaaS violeta: degradados, brillos de color bajo los botones, halos radiales y emojis como iconos.

**Key Characteristics:**
- Un solo acento, verde petróleo, usado con moderación y en tres intensidades (sólido, profundo, suave).
- Cifras tabulares alineadas en todas partes, y una sola cifra acentuada por vista.
- Monograma "F" en petróleo como marca y como voz del asistente.
- Iconos de línea lucide de un mismo grosor, nunca emojis.
- Profundidad por sombras finas del tono de la tinta, no por bordes duros ni brillos.
- Movimiento corto y de salida suave; con movimiento reducido, solo fundidos.

## Colors

Neutros fríos con un leve matiz verde, blanco para las superficies, un único acento petróleo en tres intensidades y dos colores semánticos reservados al dinero.

### Primary
- **Verde Petróleo** (petrol): acción principal, filtro activo, foco, progreso de metas, marca y la tarjeta acentuada de cada vista ("Queda para ahorrar" en Inicio, "Total ahorrado" en Metas), que va en petróleo sólido con texto blanco.
- **Petróleo Profundo** (petrol-deep): hover y presionado de la acción principal, texto de avisos informativos y el panel de bienvenida de la pantalla de acceso.
- **Petróleo Suave** (petrol-soft): ítem de navegación activo, superficies del asistente y de recomendaciones (análisis de Inicio, plan rápido de Metas, destacado de detalle, avisos), selección de texto, fondo del avatar del usuario y de los iconos de meta y de modal.
- **Anillo Petróleo** (petrol-ring): halo de foco de 3px alrededor de los campos de texto.

### Neutral
- **Fondo Niebla** (ground): fondo de la aplicación y de la burbuja del asistente.
- **Blanco Superficie** (surface): tarjetas, sidebar, barra inferior, menús, modales e inputs.
- **Superficie Hundida** (surface-sunk): pistas de progreso, carriles de pestañas, hover suave, sugerencias y botones deshabilitados.
- **Tinta** (ink): texto principal, montos, burbuja del usuario y notificaciones.
- **Tinta Apagada** (ink-muted): texto secundario, subtítulos y chips en reposo.
- **Tinta Sutil** (ink-subtle): metadatos, etiquetas pequeñas, placeholders e iconos secundarios (contraste AA sobre blanco y sobre el fondo).
- **Línea** (line) y **Línea Marcada** (line-strong): divisores, bordes de campos y del botón secundario, y la línea base de los gráficos.

### Semantic
- **Ingreso** (income) con su fondo (income-soft): solo montos y marcas de dinero que entra.
- **Gasto** (expense) con su fondo (expense-soft): solo montos y marcas de dinero que sale, errores y la acción de cerrar sesión.
- **Ocre** (chart-ochre) y **Piedra** (chart-stone): categorías secundarias de la dona, junto al petróleo.
- **Petróleo Apagado** (chart-muted): barras de meses anteriores; el mes actual va en petróleo.

### Named Rules
**The One Voice Rule.** El petróleo es el único color de acción. Si algo no es acción, estado activo, foco, progreso, la marca o la voz del asistente, no es petróleo.

**The One Figure Rule.** Cada vista acentúa una sola cifra con petróleo sólido y texto blanco. Las demás tarjetas de cifras quedan en blanco.

**The Money Colors Rule.** Verde y rojo significan dinero que entra y dinero que sale. Nunca decoran, y nunca van solos: siempre los acompaña un signo (+/−) o un icono.

**The No-Gradient Rule.** Ningún fondo, botón ni icono usa degradados. Los colores son planos. La dona de gastos se dibuja con cortes duros de color; es un gráfico de datos, no un degradado.

## Typography

**Display Font:** Public Sans (con Segoe UI, system-ui, -apple-system)
**Body Font:** Public Sans
**Label/Mono Font:** Public Sans con cifras tabulares (`font-variant-numeric: tabular-nums`)

**Character:** Una sola familia institucional, sobria y muy legible, que se lee como un documento serio y no como publicidad. La jerarquía sale del peso (400, 500, 600, 650, 700) y del tamaño, no de cambiar de fuente.

### Hierarchy
- **Display** (700, clamp de 2rem a 2.75rem, 1.1): solo el titular del panel de bienvenida del acceso, máximo 14ch. En móvil baja a **Display compact** (1.625rem).
- **Figure large** (650, 1.75rem, 1.1, tabular): las tres cifras del resumen de Inicio y de Metas. En móvil bajan a Figure small (Inicio) o a Page title (Metas).
- **Page title** (650, 1.5rem, 1.25): título de cada vista. En móvil baja a **Page title compact** (1.3125rem). Nunca más grande que las cifras clave. El campo del código de verificación reutiliza este tamaño (600, tracking 0.32em).
- **Figure medium** (650, 1.375rem, tabular): monto ahorrado de cada meta; el título de la tarjeta de acceso comparte este paso.
- **Figure small** (650, 1.25rem, tabular): total en el centro de la dona y cifras del resumen en filas en móvil.
- **Dialog title** (650, 1.125rem, 1.3): título de los modales.
- **Lead** (400, 1.0625rem, 1.55): párrafo de bienvenida del acceso, máximo 42ch. El nombre de la marca junto al monograma usa el mismo tamaño en 700.
- **Title** (600, 1rem): títulos de tarjeta, de sección y del análisis del asistente. Los campos de texto suben a este tamaño en pantallas táctiles.
- **Body** (400, 0.9375rem, 1.55): texto corriente, ítems de navegación y botones (en 600), máximo ~68ch.
- **Figure** (600, 0.9375rem, tabular): montos en filas y listas, alineados a la derecha.
- **Label** (500, 0.875rem): etiquetas de formulario, chips, ítems de menú, pestañas, rótulos de tarjetas de resumen y notificaciones.
- **Meta** (400, 0.8125rem): metadatos, fechas, meses del gráfico, pistas de contraseña y encabezados de grupo (en 600).
- **Caption** (400, 0.75rem): rótulo superior de los selectores y etiqueta de la navegación inferior en móvil. Es el mínimo; nada baja de aquí.

### Named Rules
**The Figures Win Rule.** En cualquier pantalla, la cifra clave pesa más que el título que la rodea.

**The Ledger Rule.** Todo monto usa cifras tabulares y `white-space: nowrap`; un monto jamás se parte en dos líneas.

**The Quiet Label Rule.** Etiquetas y metadatos van en minúscula normal, sin mayúsculas forzadas ni tracking amplio. El único tracking amplio es el del campo de código, donde separa dígitos.

## Layout

Sidebar fija de 248px en escritorio y columna de contenido con ancho máximo de 1120px, 36px de margen superior, margen lateral fluido de 20px a 48px y 24px entre bloques. Ritmo de espaciado en base 4 con un paso de 20px para el relleno de tarjetas; más espacio encima de un título que debajo. Rejillas de tarjetas con 16px de separación.

Por debajo de 1080px, la fila de análisis (dona y barras) y la rejilla de preguntas rápidas pasan a una columna.

Por debajo de 860px, la sidebar se convierte en una barra superior compacta (monograma, "Nueva consulta" y avatar, con `safe-area-inset-top`) y la navegación pasa a una barra inferior fija de cuatro pestañas de 52px, al alcance del pulgar, con `safe-area-inset-bottom`; el contenido reserva 88px abajo para no quedar debajo. El resumen de Inicio deja de ser tres tarjetas y se vuelve un libro de tres filas dentro de una sola tarjeta, separadas por líneas. El resumen de Metas pasa a dos columnas con la cifra acentuada a lo ancho. Los chips de filtro se desplazan en horizontal a sangre, los selectores quedan en dos columnas y los modales se abren como hoja inferior con las acciones apiladas a 44px. Relleno de tarjetas a 16px.

Por debajo de 440px los selectores se apilan en una columna para que "Todas las cuentas" no se corte. Por debajo de 380px, "Nueva consulta" queda como botón de icono de 36px y conserva su nombre para lectores de pantalla.

En cualquier pantalla táctil (o bajo 860px) los campos de texto usan 16px para evitar el zoom de iOS.

Los gráficos comparten una línea base común: las barras crecen desde abajo sobre una línea de línea marcada y sus etiquetas quedan en una sola fila.

## Elevation & Depth

Sistema casi plano. Las superficies blancas se separan del fondo con un contorno de sombra fina en vez de un borde duro, y solo lo que flota sobre la página (menús, notificaciones, modales) recibe una sombra de verdad. Las superficies de color (tarjeta acentuada, superficies del asistente) no llevan sombra: su tono ya las separa.

### Shadow Vocabulary
- **Contorno** (`box-shadow: 0 0 0 1px rgba(20,32,30,0.07), 0 1px 2px rgba(20,32,30,0.04)`): tarjetas, chips, selectores, tarjetas de pregunta y la tarjeta de acceso en reposo.
- **Flotante** (`box-shadow: 0 0 0 1px rgba(20,32,30,0.06), 0 12px 32px -8px rgba(20,32,30,0.18)`): menús desplegables y notificaciones.
- **Diálogo** (`box-shadow: 0 24px 64px -16px rgba(20,32,30,0.35)`): modales, sobre un velo de tinta al 45 %.

### Named Rules
**The No-Glow Rule.** Ninguna sombra lleva color. Las sombras son siempre del tono de la tinta, nunca petróleo ni violeta. El contorno petróleo de una tarjeta de pregunta seleccionada es un borde de estado, no un brillo.

## Shapes

Esquinas suavemente redondeadas y concéntricas por tamaño de objeto:

- **Ítem** (6px): ítems dentro de un menú, enlaces de texto en tarjetas y la parte superior de las barras del gráfico.
- **Control** (8px): botones, campos, selectores, ítems de navegación, avisos y el monograma.
- **Popover** (10px): menús desplegables, notificaciones, tarjetas de pregunta, carril de pestañas, destacados dentro de un modal e iconos cuadrados de meta y de modal.
- **Tarjeta** (12px): tarjetas y superficies del asistente.
- **Burbuja** (14px): mensajes del chat.
- **Diálogo** (16px): modales y tarjeta de acceso; en móvil la hoja inferior solo redondea arriba.
- **Píldora** (999px): chips de filtro, sugerencias, barras de progreso y la marca de la pestaña activa en móvil. Los avatares e iconos de movimiento son círculos.

Tres radios son de detalle y no forman escala: el cuadrado de leyenda de la dona (3px), la esquina de la burbuja que apunta a quien habla (4px: abajo a la derecha en el usuario, arriba a la izquierda en el asistente) y la pestaña deslizante del acceso (7px), que es el radio interior concéntrico del carril de 10px.

## Components

### Buttons
Firmes y callados: el color dice qué es acción, el tamaño no.
- **Shape:** 8px de radio, 40px de alto (44px en el envío de acceso y en las acciones de hoja en móvil).
- **Primary:** fondo petróleo, texto blanco en 600; hover en petróleo profundo; deshabilitado en superficie hundida con tinta sutil.
- **Secondary:** fondo blanco con borde de 1px en línea marcada y texto tinta; hover sobre superficie hundida.
- **Nueva consulta:** botón secundario contorneado con icono "+" en petróleo, no primario; en hover el borde pasa a tinta sutil. Bajo 380px queda solo el icono.
- **Presionado:** escala 0.98 en 120ms; con movimiento reducido no escala.
- **Focus:** anillo de 2px en petróleo con 2px de separación, siempre visible con teclado.
- **Enlace de tarjeta:** texto petróleo en 600 con chevron, 32px de alto, hover en superficie hundida.

### Chips
- **Style:** píldora de 36px, fondo blanco con sombra de contorno y texto tinta apagada en Label.
- **State:** activo en petróleo sólido con texto blanco y sin sombra; hover en superficie hundida. Las sugerencias de los modales son píldoras más pequeñas (32px) sobre superficie hundida.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** blanco sobre fondo niebla.
- **Shadow Strategy:** contorno (ver Elevation & Depth).
- **Internal Padding:** 20px, 16px en móvil; el chat usa 24px.
- **Tarjeta acentuada:** petróleo sólido con texto blanco, rótulos al 86 % de blanco e icono sobre blanco al 14 %; sin sombra.
- **Superficies del asistente:** petróleo suave, sin sombra, con el monograma "F" a la izquierda, texto en tinta apagada con la cifra en tinta y la acción primaria a la derecha (a lo ancho en móvil).

### Inputs / Fields
- **Style:** fondo blanco, borde de 1px en línea marcada, 8px de radio, 44px de alto, etiqueta siempre encima en Label; textarea desde 104px con redimensión vertical.
- **Focus:** borde petróleo más halo petróleo de 3px (petrol-ring).
- **Selector:** tarjeta con contorno, icono a la izquierda, rótulo Caption encima del valor y chevron que gira 180° al abrir; toda la tarjeta es el objetivo del clic y lleva el anillo de foco.
- **Código:** 52px de alto, cifras tabulares centradas a 1.5rem con tracking 0.32em; placeholder en 400.
- **Error / Aviso:** mensaje en gasto sobre gasto suave o en petróleo profundo sobre petróleo suave, con icono, junto al formulario.

### Navigation
- **Escritorio:** ítems de 40px con icono de 19px y etiqueta Body en 500; activo en relleno petróleo suave con texto petróleo en 600, sin indicador lateral, sin sombra ni degradado. El perfil cierra la sidebar sobre una línea, con avatar de iniciales en petróleo suave y menú que se abre hacia arriba.
- **Móvil:** barra inferior blanca de cuatro pestañas, icono sobre etiqueta Caption; el activo lleva una píldora petróleo suave detrás del icono y texto petróleo.
- **Menús:** superficie blanca de 10px con sombra flotante, 4px de relleno e ítems de 6px; el ítem elegido va en petróleo, las acciones destructivas en gasto.

### Chat
- **Usuario:** burbuja tinta con texto blanco, alineada a la derecha, máximo 72 % (88 % en móvil).
- **Asistente:** avatar circular "F" en petróleo y burbuja en fondo niebla con el rótulo "FinancIA" en petróleo; los desgloses usan la anatomía de Cifras.
- **Preguntas rápidas:** tarjetas de 10px con icono en cuadro hundido; la seleccionada pasa a petróleo suave con contorno petróleo de 1.5px e icono sobre petróleo.

### Dialogs & Toasts
- **Modal:** 520px de ancho, 24px de relleno, radio de 16px, sombra de diálogo, encabezado con icono en cuadro petróleo suave de 40px y botón de cerrar de 32px. En móvil es una hoja inferior que entra desde abajo.
- **Notificación:** tinta con texto blanco, esquina inferior derecha (a lo ancho y sobre la barra inferior en móvil), sombra flotante; su salida está sincronizada con el temporizador de 2.8s.

### Cifras (Signature Component)
Cada monto es una cifra tabular alineada a la derecha, con su signo y su color semántico, que no se parte en dos líneas. Resumen, filas de movimientos, metas, detalle de modal y respuestas del asistente usan la misma anatomía de etiqueta, cifra y metadato. En móvil el resumen de Inicio se lee como un libro: tres filas, etiqueta a la izquierda y cifra a la derecha.

### Movimiento
Todo movimiento usa una salida suave (`cubic-bezier(0.23, 1, 0.32, 1)`) entre 120 y 240ms. Las vistas entran con 4px de subida y fundido; los menús aparecen desde su origen (escala 0.97); los modales entran con escala y 4px, o desde abajo como hoja en móvil; la pestaña activa del acceso se desliza bajo el texto. Los cambios de color de hover duran 150ms. Con `prefers-reduced-motion` solo quedan fundidos: sin desplazamientos, escalas ni deslizamiento.

## Do's and Don'ts

### Do:
- **Do** usar `tabular-nums` y `nowrap` en todo monto.
- **Do** acentuar una sola cifra por vista con petróleo sólido y texto blanco.
- **Do** acompañar verde y rojo con un signo o un icono.
- **Do** usar el monograma "F" en petróleo donde habla la marca o el asistente.
- **Do** usar iconos de línea lucide de 1.75 de trazo (2 en glifos pequeños y funcionales: flechas, chevrons, "+", cerrar y alertas), entre 14 y 20px.
- **Do** mantener un anillo de foco visible de 2px en petróleo.
- **Do** llevar los campos a 16px en pantallas táctiles.
- **Do** reducir el movimiento a fundidos con `prefers-reduced-motion`.

### Don't:
- **Don't** usar degradados, brillos de color ni halos radiales.
- **Don't** usar emojis como iconos.
- **Don't** usar etiquetas en mayúsculas con tracking amplio.
- **Don't** hacer que un título pese más que la cifra que presenta.
- **Don't** marcar el ítem de navegación activo con una barra lateral de color; el relleno petróleo suave basta.
- **Don't** usar el petróleo sólido en más de una tarjeta de cifras por vista.
