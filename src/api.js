// Conexión con los dos escenarios de Make.
// Se envía el JSON como text/plain para que el navegador no haga la petición previa (CORS preflight);
// los webhooks de Make lo reciben igual en {{1.value}} y lo leen con "Parse JSON".

export const HOOK_PROYECTOS = 'https://hook.us2.make.com/57q0kgytqssl3vmhrbughlxjrd2qvkoc' // MUSA 1 · crear / listar / programar
export const HOOK_PARRILLA = 'https://hook.us2.make.com/rpwthtptd6mcuumhjjm5t5rlklrc2kr8' // MUSA 2 · parrilla de contenido
export const CLAVE = 'musa2026'

export const NOTION_MUSA = 'https://www.notion.so/40d2f8d187e081a98f1dc437d9aab1d6'
export const GOOGLE_CALENDAR = 'https://calendar.google.com/calendar/u/0/r/week'

async function enviar(url, datos) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ clave: CLAVE, ...datos }),
  })
  const texto = await res.text()
  if (!res.ok) throw new Error(texto || `Make respondió ${res.status}`)
  try {
    return JSON.parse(texto)
  } catch {
    // Make responde "Accepted" cuando ningún módulo de respuesta se ejecutó
    return { ok: true, mensaje: texto }
  }
}

export const crearProyecto = (onboarding) => enviar(HOOK_PROYECTOS, { accion: 'crear', ...onboarding })
export const listar = () => enviar(HOOK_PROYECTOS, { accion: 'listar' })
export const programarAprobados = () => enviar(HOOK_PROYECTOS, { accion: 'programar' })
export const crearParrilla = (pedido) => enviar(HOOK_PARRILLA, pedido)
