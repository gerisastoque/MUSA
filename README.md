# MUSA

**Inspired by what's happening. Created by you.**

Frontend de MUSA, un agente de IA para crear contenido de redes sociales. Proyecto del curso Soluciones con IA Generativa (ICESI, 2026).

## Cómo funciona

La web habla con dos escenarios de Make por webhook (`src/api.js`):

| Pantalla | Escenario de Make | Acción |
|---|---|---|
| Habla con MUSA | MUSA 1 (`chat`) | El agente conversa, pide lo que falta y propone una acción que la persona confirma |
| 1. Nueva marca | MUSA 1 · Proyectos y agenda | `crear`: el Agente Brandbook crea el proyecto en Notion (desde cero o leyendo un brandbook existente en PDF o texto) |
| 2. Crear parrilla | MUSA 1 (`listar`) y MUSA 2 · Parrilla de contenido | Trae marcas y plantillas; luego crea los posts en Notion como "Por revisar" |
| 3. Revisar y programar | MUSA 1 · Proyectos y agenda | `programar`: los posts aprobados pasan a Google Calendar |

## Correr en local

```bash
npm install
npm run dev
```

## Publicar en GitHub Pages

`npm run build` genera la carpeta `dist`, que se publica en la rama `gh-pages`.
