# MUSA

**Inspired by what's happening. Created by you.**

Frontend de MUSA, un agente de IA para crear contenido de redes sociales. Proyecto del curso Soluciones con IA Generativa (ICESI, 2026).

## Cómo funciona

La web habla con dos escenarios de Make por webhook (`src/api.js`):

| Pantalla | Escenario de Make | Acción |
|---|---|---|
| 1. Nueva marca | MUSA 1 · Proyectos y agenda | `crear`: el Agente Brandbook crea el proyecto en Notion |
| 2. Crear parrilla | MUSA 1 (`listar`) y MUSA 2 · Parrilla de contenido | Trae marcas y plantillas; luego crea los posts en Notion como "Por revisar" |
| 3. Revisar y programar | MUSA 1 · Proyectos y agenda | `programar`: los posts aprobados pasan a Google Calendar |

## Correr en local

```bash
npm install
npm run dev
```

## Publicar en GitHub Pages

```bash
npm run deploy
```
