# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Se usa tanto en escritorio como en el navegador del celular; todas las vistas deben funcionar en ambos.

## Users

Personas comunes en Perú, sin formación en finanzas, que quieren entender en qué se les va el dinero y avanzar hacia metas concretas de ahorro (un viaje, una laptop, un fondo de emergencia). Registran sus movimientos del día a día y consultan cuánto les queda para ahorrar.

## Product Purpose

FinancIA centraliza los ingresos, gastos y metas de ahorro de una persona y, a partir de esos registros, le da respuestas claras sobre su situación. El éxito es que el usuario sepa en segundos cuánto entró, cuánto gastó y cuánto le queda, y que confíe en esas cifras.

## Positioning

El diferencial es el asistente de IA que analiza los registros del propio usuario y le responde en lenguaje simple ("¿En qué gasté más este mes?", "¿Cómo voy con el dinero para mi Laptop?"). Registrar movimientos y metas es la base que alimenta a ese asistente.

## Operating Context

- Moneda: soles, con el formato `S/ 1,500.00`.
- Cuentas de origen y destino habituales en Perú: Banco, Billetera y Yape.
- Lenguaje coloquial en la interfaz: "Entró", "Gasté", "Queda para ahorrar".
- Vistas: Inicio (resumen), Movimientos, Metas, Asistente IA, e Iniciar sesión / Crear cuenta.

## Capabilities and Constraints

- Conectado al backend: registro, inicio de sesión con JWT, activación y verificación de 2FA con Google Authenticator, y datos del usuario autenticado.
- Inicio, Movimientos, Metas y Asistente IA usan todavía datos de ejemplo (`src/data.ts`); el asistente no está conectado a un modelo de IA.
- Stack existente: React 19, TypeScript y Vite, con CSS propio sin framework de estilos.

## Brand Commitments

- Nombre: FinancIA. No existe logo oficial; la interfaz puede usar una marca simple (ícono + nombre).
- Tono: cercano pero confiable, como un banco moderno; nunca infantil ni de juguete.
- Idioma: español.

## Evidence on Hand

- No hay datos reales de usuarios, testimonios ni métricas. Las cifras de las vistas son de ejemplo y no deben presentarse como resultados reales.

## Product Principles

1. Los números primero: montos legibles de un vistazo y consistentes en todas las vistas.
2. Confianza antes que entusiasmo: la app maneja el dinero de la gente y debe sentirse seria y predecible.
3. Lenguaje de la persona, no del banco: términos cotidianos en vez de jerga financiera.
4. El asistente es el corazón: las demás vistas preparan los datos que el asistente interpreta.

## Accessibility & Inclusion

Objetivo WCAG 2.1 AA: contraste suficiente, foco visible y formularios etiquetados. El público no es técnico, por lo que la claridad de textos y montos es parte de la accesibilidad.
