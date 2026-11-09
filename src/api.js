// Conexión con los dos escenarios de Make.
// El JSON se envía como text/plain para que el navegador no haga la petición previa (CORS preflight);
// los webhooks de Make lo reciben igual en {{1.value}} y lo leen con "Parse JSON".

export const HOOK_PROYECTOS = 'https://hook.us2.make.com/57q0kgytqssl3vmhrbughlxjrd2qvkoc' // MUSA 1 · chat, marcas, posts, agenda
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

// Las marcas llegan como objetos; si llegan como texto (versión anterior), se convierten.
const normalizarMarca = (m) => (typeof m === 'string' ? { id: m, nombre: m } : m)

export async function listar() {
  const r = await enviar(HOOK_PROYECTOS, { accion: 'listar' })
  return {
    marcas: (r.marcas || []).map(normalizarMarca).filter((m) => m.nombre),
    plantillas: (r.plantillas || []).filter(Boolean),
  }
}

export async function traerPosts() {
  const r = await enviar(HOOK_PROYECTOS, { accion: 'posts' })
  return (r.posts || []).filter((p) => p.id)
}

export const chatear = (datos) => enviar(HOOK_PROYECTOS, { accion: 'chat', ...datos })
export const crearProyecto = (datos) => enviar(HOOK_PROYECTOS, { accion: 'crear', ...datos })
export const agendarAprobados = () => enviar(HOOK_PROYECTOS, { accion: 'programar' })
export const cambiarEstado = (post_id, estado, comentario = '') =>
  enviar(HOOK_PROYECTOS, { accion: 'estado', post_id, estado, comentario })
export const crearParrilla = (pedido) => enviar(HOOK_PARRILLA, pedido)

// Utilidades
export const coloresDe = (texto = '') => (texto.match(/#[0-9a-fA-F]{6}\b/g) || []).slice(0, 4)

export function elegirPlantilla(peticion = '', plantillas = []) {
  const t = peticion.toLowerCase()
  const reglas = [
    [/navid|diciembre|madre|padre|amor|halloween|black friday|fecha|aniversario|temporada/, 'Fecha especial'],
    [/lanz|nuev|estren/, 'Lanzamiento de producto'],
    [/promo|descuento|oferta|2x1|precio/, 'Promo / oferta'],
    [/tip|cómo|como |aprend|guía|paso/, 'Educativo / tips'],
    [/equipo|proceso|detrás|detras|taller|cocina/, 'Detrás de cámaras'],
    [/tendencia|viral|trend/, 'Subirse a una tendencia'],
  ]
  const hit = reglas.find(([re]) => re.test(t))
  const nombre = hit ? hit[1] : 'Subirse a una tendencia'
  return plantillas.find((p) => p.toLowerCase() === nombre.toLowerCase()) || plantillas[0] || nombre
}

export function formatoFecha(iso) {
  if (!iso) return 'Sin fecha'
  const d = new Date(iso)
  if (isNaN(d)) return iso
  const conHora = iso.length > 10
  return d.toLocaleString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    ...(conHora ? { hour: 'numeric', minute: '2-digit' } : {}),
    ...(conHora ? {} : { timeZone: 'UTC' }),
  })
}

export const guardar = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v))
  } catch {
    /* sin almacenamiento */
  }
}
export const leer = (k, def) => {
  try {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : def
  } catch {
    return def
  }
}

// Tendencias de hoy en Colombia (Google Trends, vía Make). Se guardan 30 min en la sesión.
export async function traerTendencias() {
  try {
    const cache = JSON.parse(sessionStorage.getItem('musa-tendencias') || 'null')
    if (cache && cache.v === 2 && Date.now() - cache.t < 30 * 60 * 1000) return cache.datos
  } catch {
    /* sin almacenamiento */
  }
  const r = await enviar(HOOK_PROYECTOS, { accion: 'tendencias' })
  const doc = new DOMParser().parseFromString(r.xml || '', 'text/xml')
  const NS = 'https://trends.google.com/trending/rss'
  const texto = (el, tag) => el.getElementsByTagNameNS(NS, tag)[0]?.textContent?.trim() || ''
  const lista = [...doc.getElementsByTagName('item')].map((item) => ({
    titulo: item.getElementsByTagName('title')[0]?.textContent?.trim() || '',
    trafico: texto(item, 'approx_traffic'),
    noticias: [...item.getElementsByTagNameNS(NS, 'news_item')].slice(0, 2).map((n) => ({
      titulo: texto(n, 'news_item_title'),
      url: texto(n, 'news_item_url'),
      medio: texto(n, 'news_item_source'),
    })),
  })).filter((t) => t.titulo)
  const musica = (r.musica?.feed?.results || []).slice(0, 12).map((c) => ({
    cancion: c.name,
    artista: c.artistName,
    url: c.url,
    portada: c.artworkUrl100,
    genero: (c.genres || []).map((g) => g.name).filter((g) => g !== 'Música').join(', '),
  }))
  const datos = { lista, musica }
  try {
    sessionStorage.setItem('musa-tendencias', JSON.stringify({ v: 2, t: Date.now(), datos }))
  } catch {
    /* sin almacenamiento */
  }
  return datos
}

export const musicaParaChat = (musica = []) =>
  musica
    .slice(0, 10)
    .map((c, i) => `${i + 1}. ${c.cancion} - ${c.artista}${c.genero ? ` (${c.genero})` : ''}`)
    .join('; ')

export const tendenciasParaChat = (lista = []) =>
  lista
    .slice(0, 10)
    .map((t) => {
      const n = t.noticias[0]
      return n ? `${t.titulo} (noticia: "${n.titulo}" de ${n.medio}, ${n.url})` : t.titulo
    })
    .join('; ')
