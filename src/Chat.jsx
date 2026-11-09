import { useEffect, useRef, useState } from 'react'
import { chatear, crearProyecto, crearParrilla, listar, programarAprobados, NOTION_MUSA, GOOGLE_CALENDAR } from './api'
import { leerBrandbook } from './leerArchivo'

const SALUDO = {
  de: 'musa',
  texto:
    '¡Hola! Soy MUSA. Puedo crear el brandbook de una marca (o leer el que ya tiene), armarte la parrilla de la semana con tendencias, o pasar a tu calendario lo que ya aprobaste. ¿Con qué empezamos?',
}

const SUGERENCIAS = [
  'Tengo una marca nueva',
  'Quiero la parrilla de esta semana',
  'Programa lo que ya aprobé',
  '¿Qué tipo de reels me recomiendas?',
]

const NOMBRES_ACCION = {
  crear_marca: 'Crear brandbook',
  crear_parrilla: 'Crear parrilla',
  programar: 'Programar aprobados',
}

export default function Chat() {
  const [mensajes, setMensajes] = useState([SALUDO])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [listas, setListas] = useState({ marcas: [], plantillas: [] })
  const [adjunto, setAdjunto] = useState(null)
  const finRef = useRef(null)
  const archivoRef = useRef(null)

  const cargarListas = () =>
    listar()
      .then((r) => setListas({ marcas: (r.marcas || []).filter(Boolean), plantillas: (r.plantillas || []).filter(Boolean) }))
      .catch(() => {})

  useEffect(() => {
    cargarListas()
  }, [])

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, pensando])

  const agregar = (m) => setMensajes((prev) => [...prev, m])

  async function enviar(contenido) {
    const mensaje = (contenido ?? texto).trim()
    if (!mensaje || pensando) return
    setTexto('')
    const previos = mensajes
    agregar({ de: 'yo', texto: mensaje })
    setPensando(true)

    const historial = previos
      .filter((m) => m.de !== 'sistema')
      .slice(-12)
      .map((m) => `${m.de === 'yo' ? 'Persona' : 'MUSA'}: ${m.texto}`)
      .join('\n')

    try {
      const r = await chatear({
        mensaje,
        historial,
        marcas: listas.marcas.join(', '),
        plantillas: listas.plantillas.join(', '),
        adjunto: adjunto ? `sí, el archivo "${adjunto.nombre}". Inicio del documento: ${adjunto.texto.slice(0, 1500)}` : '',
      })
      const accion = NOMBRES_ACCION[r.accion] ? r.accion : null
      agregar({
        de: 'musa',
        texto: r.respuesta || r.mensaje || 'Mmm, no te entendí bien. ¿Me lo dices de otra forma?',
        accion,
        datos: r,
        estado: accion ? 'pendiente' : null,
      })
    } catch {
      agregar({ de: 'sistema', texto: 'No pude hablar con Make. Revisa que el escenario MUSA 1 esté activo e inténtalo de nuevo.' })
    } finally {
      setPensando(false)
    }
  }

  function marcar(indice, estado) {
    setMensajes((prev) => prev.map((m, i) => (i === indice ? { ...m, estado } : m)))
  }

  async function ejecutar(indice) {
    const { accion, datos } = mensajes[indice]
    marcar(indice, 'ejecutando')
    try {
      if (accion === 'crear_marca') {
        const r = await crearProyecto({
          marca: datos.marca,
          resumen_marca: datos.resumen_marca,
          brandbook_existente: adjunto?.texto || '',
        })
        agregar({
          de: 'musa',
          texto: `Listo, el brandbook de ${r.marca || datos.marca} ya está en Notion. Revísalo y ajusta lo que quieras: eso es lo que voy a usar para crear su contenido. ¿Le armamos su primera parrilla?`,
          link: r.notion,
          linkTexto: 'Ver brandbook en Notion',
        })
        setAdjunto(null)
        cargarListas()
      } else if (accion === 'crear_parrilla') {
        const cantidad = Number(datos.cantidad_posts) || 3
        await crearParrilla({
          proyecto: datos.marca,
          plantilla: datos.plantilla,
          peticion: datos.peticion,
          fecha_inicio: datos.fecha_inicio,
          cantidad_posts: cantidad,
        })
        agregar({
          de: 'musa',
          texto: `Ya estoy trabajando. En 2 a 4 minutos aparecen ${cantidad} posts de ${datos.marca} en Notion como "Por revisar". Cuando apruebes los que te gusten, me dices y los programo.`,
          link: NOTION_MUSA,
          linkTexto: 'Abrir Notion',
        })
      } else if (accion === 'programar') {
        await programarAprobados()
        agregar({
          de: 'musa',
          texto: 'Listo. Los posts aprobados van llegando a Google Calendar con el link al post y un recordatorio 2 horas antes. La persona responsable recibe la invitación.',
          link: GOOGLE_CALENDAR,
          linkTexto: 'Ver Google Calendar',
        })
      }
      marcar(indice, 'hecho')
    } catch {
      marcar(indice, 'pendiente')
      agregar({ de: 'sistema', texto: 'Algo falló al ejecutar la acción. Inténtalo de nuevo en un momento.' })
    }
  }

  function cancelar(indice) {
    marcar(indice, 'cancelado')
    agregar({ de: 'musa', texto: 'Va, dime qué cambio y lo ajusto.' })
  }

  async function alAdjuntar(e) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    try {
      const leido = await leerBrandbook(archivo)
      setAdjunto(leido)
      enviar(`Te comparto el brandbook de mi marca (${leido.nombre}).`)
    } catch (err) {
      agregar({ de: 'sistema', texto: err.message })
    }
  }

  const soloSaludo = mensajes.length === 1

  return (
    <div className="chat">
      <div className="chat-cabeza">
        <p className="label">Habla con MUSA</p>
        <h1 className="h1">¿Qué creamos hoy?</h1>
      </div>

      <div className="chat-mensajes" aria-live="polite">
        {mensajes.map((m, i) => (
          <Burbuja key={i} m={m} onSi={() => ejecutar(i)} onNo={() => cancelar(i)} />
        ))}
        {soloSaludo && (
          <div className="sugerencias">
            {SUGERENCIAS.map((s) => (
              <button key={s} className="chip-btn" onClick={() => enviar(s)}>
                {s}
              </button>
            ))}
            <button className="chip-btn" onClick={() => archivoRef.current?.click()}>
              Ya tengo brandbook
            </button>
          </div>
        )}
        {pensando && (
          <div className="burbuja musa pensando" role="status">
            <span className="punto" />
            <span className="punto" />
            <span className="punto" />
            <span className="sr">MUSA está escribiendo</span>
          </div>
        )}
        <div ref={finRef} />
      </div>

      <form
        className="chat-caja"
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
      >
        {adjunto && (
          <div className="adjunto">
            <IconoDoc />
            <span>{adjunto.nombre}</span>
            <button type="button" aria-label="Quitar brandbook" onClick={() => setAdjunto(null)}>
              ×
            </button>
          </div>
        )}
        <div className="chat-fila">
          <button type="button" className="icono-btn" aria-label="Adjuntar brandbook (PDF o texto)" title="Adjuntar brandbook" onClick={() => archivoRef.current?.click()}>
            <IconoClip />
          </button>
          <input ref={archivoRef} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" hidden onChange={alAdjuntar} />
          <textarea
            rows="1"
            value={texto}
            placeholder="Escríbele a MUSA…"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                enviar()
              }
            }}
          />
          <button className="btn btn-musa enviar" type="submit" disabled={!texto.trim() || pensando} aria-label="Enviar">
            <IconoEnviar />
          </button>
        </div>
      </form>
    </div>
  )
}

function Burbuja({ m, onSi, onNo }) {
  if (m.de === 'sistema') return <p className="burbuja sistema">{m.texto}</p>
  return (
    <div className={`burbuja ${m.de}`}>
      {m.de === 'musa' && <span className="autor">MUSA</span>}
      <p>{m.texto}</p>
      {m.link && (
        <a className="enlace" href={m.link} target="_blank" rel="noreferrer">
          {m.linkTexto} ↗
        </a>
      )}
      {m.accion && <TarjetaAccion m={m} onSi={onSi} onNo={onNo} />}
    </div>
  )
}

function TarjetaAccion({ m, onSi, onNo }) {
  const d = m.datos
  const filas =
    m.accion === 'crear_parrilla'
      ? [
          ['Marca', d.marca],
          ['Plantilla', d.plantilla],
          ['Desde', d.fecha_inicio],
          ['Posts', d.cantidad_posts || '3'],
        ]
      : m.accion === 'crear_marca'
        ? [['Marca', d.marca]]
        : []
  return (
    <div className="accion">
      <span className="label">{NOMBRES_ACCION[m.accion]}</span>
      {filas.length > 0 && (
        <dl>
          {filas
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
      )}
      {m.estado === 'pendiente' && (
        <div className="acciones">
          <button className="btn btn-musa btn-chico" onClick={onSi}>
            Sí, hazlo
          </button>
          <button className="btn btn-linea btn-chico" onClick={onNo}>
            Cambiar algo
          </button>
        </div>
      )}
      {m.estado === 'ejecutando' && <span className="muted small">Trabajando en eso…</span>}
      {m.estado === 'hecho' && <span className="estado estado-aprobado">Hecho</span>}
      {m.estado === 'cancelado' && <span className="muted small">Cancelado</span>}
    </div>
  )
}

const IconoClip = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.6-8.6a3.3 3.3 0 014.7 4.7l-8.6 8.6a1.7 1.7 0 01-2.4-2.4l7.9-7.9" />
  </svg>
)
const IconoEnviar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const IconoDoc = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8z" />
    <path d="M14 3v5h5" />
  </svg>
)
