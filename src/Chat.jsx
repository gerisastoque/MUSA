import { useEffect, useRef, useState } from 'react'
import { chatear, crearProyecto, crearParrilla, agendarAprobados, traerPosts, formatoFecha, GOOGLE_CALENDAR } from './api'
import { leerBrandbook } from './leerArchivo'
import Mascota, { Estrella } from './Mascota'
import { PuntosColor, Svg } from './piezas'

const SUGERENCIAS = [
  'Quiero la parrilla de esta semana',
  'Tengo una marca nueva',
  '¿Qué tipo de reels me recomiendas?',
  'Agenda lo que ya aprobé',
]

const ACCIONES = {
  crear_marca: 'Crear brandbook',
  crear_parrilla: 'Crear parrilla',
  agendar: 'Agendar recordatorios',
  programar: 'Agendar recordatorios',
}

const PASOS = {
  crear_marca: ['Conociendo tu marca…', 'Armando su personalidad…', 'Traduciendo su identidad visual…', 'Guardando el brandbook en Notion…'],
  crear_parrilla: ['Le pasé tu pedido a Make…'],
  agendar: ['Buscando los posts aprobados…'],
}

export default function Chat({
  marcas,
  plantillas,
  activa,
  elegirMarca,
  posts,
  cargarMarcas,
  cargarPosts,
  ir,
  mensajes,
  setMensajes,
  pendiente,
  limpiarPendiente,
}) {
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [adjunto, setAdjunto] = useState(null)
  const finRef = useRef(null)
  const archivoRef = useRef(null)
  const enviadoPendiente = useRef(false)

  const agregar = (m) => setMensajes((prev) => [...prev, m])
  const marcar = (i, cambios) => setMensajes((prev) => prev.map((m, j) => (j === i ? { ...m, ...cambios } : m)))

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, pensando])

  useEffect(() => {
    if (pendiente && !enviadoPendiente.current) {
      enviadoPendiente.current = true
      limpiarPendiente()
      enviar(pendiente)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendiente])

  const contexto = activa
    ? [
        activa.sector && `Sector: ${activa.sector}`,
        activa.personalidad && `Personalidad: ${activa.personalidad}`,
        activa.tono && `Tono: ${activa.tono}`,
        activa.pilares && `Pilares: ${activa.pilares}`,
        activa.redes && `Redes: ${activa.redes}`,
        activa.no_decimos && `No dice: ${activa.no_decimos}`,
      ]
        .filter(Boolean)
        .join(' | ')
    : ''

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
        marca_activa: activa?.nombre || '',
        contexto_marca: contexto,
        marcas: marcas.map((m) => m.nombre).join(', '),
        plantillas: plantillas.join(', '),
        pendientes: String(posts.filter((p) => p.estado === 'Por revisar' && (!activa || p.proyecto === activa.id)).length),
        adjunto: adjunto ? `sí, el archivo "${adjunto.nombre}". Inicio del documento: ${adjunto.texto.slice(0, 1500)}` : '',
      })
      const accion = ACCIONES[r.accion] ? (r.accion === 'programar' ? 'agendar' : r.accion) : null
      agregar({
        de: 'musa',
        expresion: accion ? 'creando' : r.accion === 'revisar' ? 'investigando' : 'hola',
        texto: r.respuesta || r.mensaje || 'Mmm, no te entendí bien. ¿Me lo cuentas de otra forma?',
        accion,
        irRevision: r.accion === 'revisar',
        datos: r,
        estado: accion ? 'pendiente' : null,
      })
    } catch {
      agregar({ de: 'musa', expresion: 'confundida', error: true, texto: 'Uy, no pude hablar con Make. No perdiste nada: revisa que MUSA 1 esté activo y vuelve a enviarme el mensaje.' })
    } finally {
      setPensando(false)
    }
  }

  async function vigilarParrilla(marcaId, cantidad, antes) {
    const esperas = [90, 60, 60, 60]
    for (const s of esperas) {
      await new Promise((r) => setTimeout(r, s * 1000))
      try {
        const lista = await traerPosts()
        const ahora = lista.filter((p) => p.proyecto === marcaId && p.estado === 'Por revisar').length
        if (ahora - antes >= cantidad) {
          cargarPosts()
          agregar({
            de: 'musa',
            expresion: 'celebrando',
            texto: '¡Está viva! Tu contenido está listo para revisar.',
            botonRevision: true,
          })
          return
        }
      } catch {
        /* se intenta en la siguiente vuelta */
      }
    }
    cargarPosts()
    agregar({ de: 'musa', expresion: 'investigando', texto: 'Make sigue trabajando en tu parrilla. En la sala de revisión la vas a ver apenas llegue.', botonRevision: true })
  }

  async function ejecutar(i) {
    const { accion, datos } = mensajes[i]
    marcar(i, { estado: 'ejecutando' })
    try {
      if (accion === 'crear_marca') {
        const r = await crearProyecto({
          marca: datos.marca,
          resumen_marca: datos.resumen_marca,
          brandbook_existente: adjunto?.texto || '',
        })
        marcar(i, { estado: 'hecho' })
        setAdjunto(null)
        await cargarMarcas()
        agregar({
          de: 'musa',
          expresion: 'celebrando',
          texto: `¡Listo! El brandbook de ${r.marca || datos.marca} ya está en Notion. Revísalo y ajusta lo que quieras: eso es lo que voy a usar para crear su contenido. ¿Le armamos su primera parrilla?`,
          link: r.notion,
          linkTexto: 'Ver brandbook en Notion',
        })
      } else if (accion === 'crear_parrilla') {
        const cantidad = Math.min(5, Math.max(1, Number(datos.cantidad_posts) || 3))
        const marca = marcas.find((m) => m.nombre.toLowerCase() === (datos.marca || '').toLowerCase()) || activa
        const antes = posts.filter((p) => p.proyecto === marca?.id && p.estado === 'Por revisar').length
        await crearParrilla({
          proyecto: datos.marca || activa?.nombre,
          plantilla: datos.plantilla,
          peticion: datos.peticion,
          fecha_inicio: datos.fecha_inicio,
          cantidad_posts: cantidad,
        })
        marcar(i, { estado: 'hecho' })
        agregar({
          de: 'musa',
          expresion: 'investigando',
          texto: `¡Manos a la obra! Make ya está buscando inspiración y escribiendo ${cantidad} ${cantidad === 1 ? 'post' : 'posts'} para ${datos.marca || activa?.nombre}. Tarda de 2 a 4 minutos; te aviso aquí cuando estén listos.`,
        })
        if (marca) vigilarParrilla(marca.id, cantidad, antes)
      } else if (accion === 'agendar') {
        await agendarAprobados()
        marcar(i, { estado: 'hecho' })
        agregar({
          de: 'musa',
          expresion: 'celebrando',
          texto: 'Listo. Los posts aprobados van llegando a Google Calendar con el link al post y un recordatorio 2 horas antes. La persona responsable recibe la invitación.',
          link: GOOGLE_CALENDAR,
          linkTexto: 'Ver Google Calendar',
        })
        setTimeout(cargarPosts, 15000)
      }
    } catch {
      marcar(i, { estado: 'pendiente' })
      agregar({ de: 'musa', expresion: 'confundida', error: true, texto: 'Algo se enredó al ejecutar la acción. No se perdió nada: puedes volver a intentarlo con el mismo botón.' })
    }
  }

  function cancelar(i) {
    marcar(i, { estado: 'cancelado' })
    agregar({ de: 'musa', expresion: 'hola', texto: 'Va, dime qué le cambiamos y lo ajusto.' })
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
      agregar({ de: 'musa', expresion: 'confundida', texto: err.message })
    }
  }

  const soloSaludo = mensajes.length === 1

  return (
    <div className="pagina chat-pagina">
      <section className="chat">
        <header className="chat-cabeza">
          <h1 className="display-m">Habla con MUSA</h1>
          {marcas.length > 0 && (
            <label className="selector-marca">
              <PuntosColor colores={activa?.paleta || []} size={20} />
              <span className="sr">Marca activa</span>
              <select value={activa?.id || ''} onChange={(e) => elegirMarca(e.target.value)}>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
              <Svg nombre="abajo" size={16} />
            </label>
          )}
        </header>

        <div className="mensajes" aria-live="polite">
          {mensajes.map((m, i) => (
            <Burbuja key={i} m={m} onSi={() => ejecutar(i)} onNo={() => cancelar(i)} ir={ir} />
          ))}
          {soloSaludo && (
            <div className="chips sugerencias">
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
            <div className="fila-musa">
              <Avatar expresion="investigando" />
              <div className="burbuja musa pensando" role="status">
                <span className="punto" />
                <span className="punto" />
                <span className="punto" />
                <span className="sr">MUSA está pensando</span>
              </div>
            </div>
          )}
          <div ref={finRef} />
        </div>

        <form
          className="compositor"
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
        >
          {adjunto && (
            <div className="adjunto">
              <Svg nombre="clip" size={16} />
              <span>{adjunto.nombre}</span>
              <button type="button" aria-label="Quitar brandbook" onClick={() => setAdjunto(null)}>
                ×
              </button>
            </div>
          )}
          <div className="compositor-fila">
            <button type="button" className="btn-icono" aria-label="Adjuntar brandbook (PDF o texto)" title="Adjuntar brandbook" onClick={() => archivoRef.current?.click()}>
              <Svg nombre="clip" />
            </button>
            <input ref={archivoRef} type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" hidden onChange={alAdjuntar} />
            <label htmlFor="mensaje" className="sr">
              Mensaje para MUSA
            </label>
            <textarea
              id="mensaje"
              rows="1"
              value={texto}
              placeholder="Escríbele a MUSA como le escribirías a una compañera…"
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
            />
            <button className="btn-redondo" type="submit" disabled={!texto.trim() || pensando} aria-label="Enviar">
              <Svg nombre="enviar" />
            </button>
          </div>
        </form>
      </section>

      <aside className="contexto" aria-label="Lo que MUSA sabe de tu marca">
        <span className="micro">Lo que MUSA sabe de tu marca</span>
        {activa ? (
          <>
            {activa.paleta.length > 0 && (
              <div className="franja-color redonda">
                {activa.paleta.map((c, i) => (
                  <span key={c} style={{ background: c, flex: 3 - Math.min(i, 2) }} />
                ))}
              </div>
            )}
            <div>
              <h2 className="titulo-marca">{activa.nombre}</h2>
              {activa.sector && <p className="muted">{activa.sector}</p>}
            </div>
            {activa.personalidad && (
              <div className="dato">
                <span className="dato-label">Personalidad</span>
                <div className="chips">
                  {activa.personalidad
                    .split(/,|\|/)
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((x, i) => (
                      <span key={x} className={`chip-suave tono-${i % 3}`}>
                        {x}
                      </span>
                    ))}
                </div>
              </div>
            )}
            {activa.pilares && (
              <div className="dato">
                <span className="dato-label">Pilares</span>
                <p>{activa.pilares.split('|').map((x) => x.split(':')[0].trim()).join(' · ')}</p>
              </div>
            )}
            {activa.redes && (
              <div className="dato">
                <span className="dato-label">Redes</span>
                <p>{activa.redes}</p>
              </div>
            )}
            {activa.url && (
              <a href={activa.url} target="_blank" rel="noreferrer" className="enlace-fuerte">
                Ver brandbook completo ↗
              </a>
            )}
          </>
        ) : (
          <div className="contexto-vacio">
            <Mascota expresion="creando" size={110} />
            <p>Todavía no conozco ninguna marca. ¡Cuéntame de la tuya!</p>
          </div>
        )}
      </aside>
    </div>
  )
}

function Avatar({ expresion }) {
  const fondo = { celebrando: '#FFE1EF', investigando: '#C8EB85', confundida: '#FFFFFF', creando: '#EDE7FF' }[expresion] || '#FFD66B'
  return (
    <span className="avatar" style={{ background: fondo }} aria-hidden="true">
      <Mascota expresion={expresion} size={50} />
    </span>
  )
}

function Burbuja({ m, onSi, onNo, ir }) {
  if (m.de === 'yo') return <div className="burbuja yo">{m.texto}</div>
  return (
    <div className="fila-musa">
      <Avatar expresion={m.expresion || 'hola'} />
      <div className={`burbuja musa${m.error ? ' error' : ''}`}>
        <p>{m.texto}</p>
        {m.link && (
          <a className="enlace-fuerte" href={m.link} target="_blank" rel="noreferrer">
            {m.linkTexto} ↗
          </a>
        )}
        {(m.irRevision || m.botonRevision) && (
          <button className="btn btn-azul btn-chico" onClick={() => ir('revision')}>
            Ir a la sala de revisión
          </button>
        )}
        {m.accion && <Plan m={m} onSi={onSi} onNo={onNo} />}
      </div>
    </div>
  )
}

function Plan({ m, onSi, onNo }) {
  const d = m.datos
  const filas =
    m.accion === 'crear_parrilla'
      ? [
          ['Acción', 'Crear parrilla'],
          ['Marca', d.marca],
          ['Inicio', d.fecha_inicio ? formatoFecha(d.fecha_inicio) : ''],
          ['Publicaciones', [d.cantidad_posts || '3', d.formatos].filter(Boolean).join(' · ')],
          ['Tema', d.peticion],
          ['Plantilla', d.plantilla ? `${d.plantilla} (la eligió MUSA)` : 'La elige MUSA'],
        ]
      : m.accion === 'crear_marca'
        ? [
            ['Acción', 'Crear brandbook'],
            ['Marca', d.marca],
          ]
        : [['Acción', 'Agendar recordatorios de los posts aprobados']]
  return (
    <div className="plan">
      <div className="plan-titulo">
        <Estrella size={18} fill="#FF78B7" stroke="#29243A" />
        ¡Este es el plan!
      </div>
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
      {m.accion === 'crear_parrilla' && <p className="ayuda">Los posts quedan en Notion como “Por revisar”. Nada se publica sin tu visto bueno.</p>}
      {m.estado === 'pendiente' && (
        <div className="acciones">
          <button className="btn btn-azul" onClick={onSi}>
            Sí, hazlo
          </button>
          <button className="btn btn-linea" onClick={onNo}>
            Cambiar algo
          </button>
        </div>
      )}
      {m.estado === 'ejecutando' && <Progreso pasos={PASOS[m.accion] || ['Trabajando en eso…']} />}
      {m.estado === 'hecho' && <span className="chip-estado estado-aprobado">Hecho</span>}
      {m.estado === 'cancelado' && <span className="ayuda">Lo dejamos para después.</span>}
    </div>
  )
}

function Progreso({ pasos }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (pasos.length < 2) return
    const t = setInterval(() => setI((x) => Math.min(x + 1, pasos.length - 1)), 9000)
    return () => clearInterval(t)
  }, [pasos])
  return (
    <ul className="progreso" role="status">
      {pasos.slice(0, i + 1).map((p, j) => (
        <li key={p} className={j < i ? 'listo' : 'actual'}>
          {p}
        </li>
      ))}
    </ul>
  )
}
