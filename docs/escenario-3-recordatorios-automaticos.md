# MUSA 3 · Recordatorios automáticos (versión de plan pago)

**Estado:** documentado, no instalado. Se eliminó de Make el 9 de noviembre de 2026 para mantener el espacio ordenado.

## Qué hace
Cada 15 minutos revisa los posts editados en Notion. Si un post está en **Aprobado** y todavía no tiene evento, crea un recordatorio en Google Calendar (a la hora de publicación, con aviso 2 horas antes y el link al post) y lo marca como **Agendado**.

## Por qué no está activo
El plan gratis de Make permite solo **2 escenarios activos** y 1.000 créditos al mes. MUSA usa esos dos cupos en *MUSA 1 · Proyectos y agenda* y *MUSA 2 · Parrilla de contenido*. Además, revisar Notion cada 15 minutos gasta unos 3.000 créditos al mes aunque no haya posts nuevos.

En el plan gratis, lo mismo se hace **a demanda** con el botón **"Agendar recordatorios"** de la sala de revisión (acción `programar` de MUSA 1).

## Cómo activarlo en un plan pago
1. En Make: *Create a new scenario* → menú ⋯ → **Import Blueprint** → sube `escenario-3-recordatorios-automaticos.json`.
2. Elige las conexiones de Notion y Google Calendar, y pon tu correo en el calendario.
3. Enciéndelo. Se puede quitar el botón "Agendar" de la web o dejar ambos (el filtro evita eventos duplicados).
