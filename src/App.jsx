import { useEffect, useState } from 'react'
import {
  crearProyecto,
  crearParrilla,
  listar,
  programarAprobados,
  NOTION_MUSA,
  GOOGLE_CALENDAR,
} from './api'
import Chat from './Chat'
import { leerBrandbook } from './leerArchivo'

const VISTAS = [
  { id: 'inicio', nombre: 'Inicio' },
  { id: 'chat', nombre: 'Habla con MUSA' },
  { id: 'marca', nombre: 'Nueva marca' },
  { id: 'parrilla', nombre: 'Crear parrilla' },
  { id: 'agenda', nombre: 'Revisar y programar' },
]

export default function App() {
  const [vista, setVista] = useState(() => {
    const h = window.location.hash.replace('#', '')
    return VISTAS.some((v) => v.id === h) ? h : 'inicio'
  })

  useEffect(() => {
    const alCambiar = () => {
      const h = window.location.hash.replace('#', '')
      if (VISTAS.some((v) => v.id === h)) setVista(h)
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  useEffect(() => {
    window.location.hash = vista
    window.scrollTo(0, 0)
  }, [vista])

  return (
    <div className="app">
      <header className="top">
        <button className="wordmark" onClick={() => setVista('inicio')} aria-label="MUSA, ir al inicio">
          MUSA
        </button>
        <nav aria-label="Secciones">
          {VISTAS.slice(1).map((v, i) => (
            <button
              key={v.id}
              className={(vista === v.id ? 'nav-item activo' : 'nav-item') + (v.id === 'chat' ? ' nav-chat' : '')}
              onClick={() => setVista(v.id)}
              aria-current={vista === v.id ? 'page' : undefined}
            >
              <span className="nav-num">{v.id === 'chat' ? '✦' : i}</span>
              {v.nombre}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {vista === 'inicio' && <Inicio ir={setVista} />}
        {vista === 'chat' && <Chat />}
        {vista === 'marca' && <NuevaMarca ir={setVista} />}
        {vista === 'parrilla' && <Parrilla ir={setVista} />}
        {vista === 'agenda' && <Agenda />}
      </main>

      <footer className="pie">
        <span className="pie-marca">MUSA</span>
        <span>Inspired by what's happening. Created by you.</span>
        <span>Proyecto de Soluciones con IA Generativa · ICESI · 2026</span>
      </footer>
    </div>
  )
}

/* ---------- INICIO ---------- */

function Inicio({ ir }) {
  return (
    <>
      <section className="hero">
        <p className="label">Tu community manager con IA</p>
        <h1 className="hero-title">
          Inspired by what's happening.
          <br />
          <em>Created by you.</em>
        </h1>
        <p className="lead">
          MUSA aprende cómo habla tu marca, mira lo que está pasando esta semana y te propone una parrilla de
          contenido con copy, guiones de reels y prompts de imagen. Tú revisas, apruebas y MUSA te lo agenda.
        </p>
        <div className="acciones">
          <button className="btn btn-musa" onClick={() => ir('chat')}>
            Habla con MUSA
          </button>
          <button className="btn btn-linea" onClick={() => ir('marca')}>
            Prefiero llenar el formulario
          </button>
        </div>
      </section>

      <section className="pasos" aria-label="Cómo funciona">
        <Paso
          n="1"
          titulo="Cuéntanos de tu marca"
          texto="Llenas el onboarding y MUSA arma el brandbook: tono, pilares, colores y estilo visual. Queda como proyecto en Notion."
          onClick={() => ir('marca')}
        />
        <Paso
          n="2"
          titulo="Pide tu parrilla"
          texto="Eliges la marca, una plantilla y lo que quieres comunicar. MUSA busca tendencias y crea cada post en Notion, listo para revisar."
          chip="Tendencias"
          onClick={() => ir('parrilla')}
        />
        <Paso
          n="3"
          titulo="Aprueba y programa"
          texto="Revisas cada post con tu equipo o tu cliente. Lo que apruebes llega a Google Calendar con el link al post e invitación al responsable."
          onClick={() => ir('agenda')}
        />
      </section>

      <section className="franja">
        <div>
          <h2 className="h2">Todo vive en tu Notion</h2>
          <p className="muted">
            Proyectos, posts, plantillas de prompts y el calendario de todas las marcas en un solo lugar. Puedes
            compartirlo con tu equipo o tu cliente para revisar juntos.
          </p>
        </div>
        <a className="btn btn-linea" href={NOTION_MUSA} target="_blank" rel="noreferrer">
          Abrir MUSA en Notion ↗
        </a>
      </section>
    </>
  )
}

function Paso({ n, titulo, texto, chip, onClick }) {
  return (
    <button className="paso" onClick={onClick}>
      <span className="paso-n">{n}</span>
      <span className="h2">{titulo}</span>
      <span className="muted">{texto}</span>
      {chip && <span className="chip chip-chispa">{chip}</span>}
    </button>
  )
}

/* ---------- 1. NUEVA MARCA ---------- */

const REDES = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn']

const MARCA_INICIAL = {
  marca: '',
  sector: '',
  que_vende: '',
  audiencia: '',
  pais: 'Colombia',
  personalidad: '',
  tono: 'tú',
  temas: '',
  palabras_prohibidas: '',
  colores: ['#c8205f', '#17181c', '#f6f5f1'],
  tipografias: '',
  redes: ['Instagram'],
  estilo_visual: '',
  evitar_imagenes: '',
  referencias: '',
  correo: '',
}

function NuevaMarca({ ir }) {
  const [f, setF] = useState(MARCA_INICIAL)
  const [estado, setEstado] = useState({ tipo: 'idle' })
  const [modo, setModo] = useState('cero')
  const [bb, setBb] = useState({ nombre: '', texto: '', error: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function alSubir(e) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    try {
      const leido = await leerBrandbook(archivo)
      setBb({ nombre: leido.nombre, texto: leido.texto, error: '' })
    } catch (err) {
      setBb({ nombre: '', texto: '', error: err.message })
    }
  }

  const toggleRed = (red) =>
    setF({ ...f, redes: f.redes.includes(red) ? f.redes.filter((r) => r !== red) : [...f.redes, red] })

  const setColor = (i, v) => {
    const colores = [...f.colores]
    colores[i] = v
    setF({ ...f, colores })
  }

  async function enviar(e) {
    e.preventDefault()
    setEstado({ tipo: 'cargando' })
    try {
      const datos =
        modo === 'brandbook'
          ? { marca: f.marca, correo: f.correo, brandbook_existente: bb.texto }
          : {
              ...f,
              colores: f.colores.map((c, i) => `${c} ${['principal', 'secundario', 'acento'][i]}`).join(', '),
              redes: f.redes.join(', '),
            }
      const r = await crearProyecto(datos)
      setEstado({ tipo: 'listo', r })
    } catch (err) {
      setEstado({ tipo: 'error', mensaje: err.message })
    }
  }

  if (estado.tipo === 'cargando')
    return <Cargando titulo={`Creando el brandbook de ${f.marca}`} frases={FRASES_BRANDBOOK} />

  if (estado.tipo === 'listo')
    return (
      <Resultado
        titulo={`${estado.r.marca || f.marca} ya tiene brandbook`}
        texto="MUSA creó el proyecto en Notion con el tono, los pilares, los colores y el estilo visual. Revísalo y ajusta lo que quieras: lo que dice ahí es lo que MUSA va a usar."
        link={estado.r.notion}
        linkTexto="Ver brandbook en Notion ↗"
        siguiente={{ texto: 'Crear su primera parrilla', onClick: () => ir('parrilla') }}
      />
    )

  return (
    <form className="form" onSubmit={enviar}>
      <Encabezado
        paso="Paso 1"
        titulo="Cuéntanos de tu marca"
        texto="Con esto MUSA arma el brandbook. Si no sabes algo, déjalo vacío: MUSA te propone una opción y la marca como sugerida."
      />

      <div className="modos" role="radiogroup" aria-label="¿La marca ya tiene brandbook?">
        <button type="button" role="radio" aria-checked={modo === 'cero'} className={modo === 'cero' ? 'modo activo' : 'modo'} onClick={() => setModo('cero')}>
          <strong>Empezar de cero</strong>
          <span className="muted small">Respondes unas preguntas y MUSA arma el brandbook.</span>
        </button>
        <button type="button" role="radio" aria-checked={modo === 'brandbook'} className={modo === 'brandbook' ? 'modo activo' : 'modo'} onClick={() => setModo('brandbook')}>
          <strong>Ya tengo brandbook</strong>
          <span className="muted small">Lo subes y MUSA lo pasa a Notion respetando lo que ya está definido.</span>
        </button>
      </div>

      {modo === 'brandbook' && (
        <Grupo titulo="Tu brandbook">
          <Campo label="Nombre de la marca" requerido>
            <input required value={f.marca} onChange={set('marca')} placeholder="Café Aurora" />
          </Campo>
          <Campo label="Correo de la persona responsable">
            <input type="email" value={f.correo} onChange={set('correo')} placeholder="responsable@marca.com" />
          </Campo>
          <Campo label="Archivo (PDF, TXT o MD)" ancho ayuda="MUSA lee el texto del archivo. Si tu PDF es una imagen escaneada, pega el texto abajo.">
            <label className="subir">
              <input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" onChange={alSubir} />
              <span>{bb.nombre ? `✓ ${bb.nombre} (${bb.texto.length.toLocaleString('es-CO')} caracteres leídos)` : 'Elige o arrastra tu brandbook aquí'}</span>
            </label>
            {bb.error && <span className="error small">{bb.error}</span>}
          </Campo>
          <Campo label="…o pega el texto del brandbook" ancho>
            <textarea rows="6" value={bb.texto} onChange={(e) => setBb({ ...bb, texto: e.target.value })} placeholder="Misión, tono de voz, colores, tipografías, lo que la marca dice y no dice..." />
          </Campo>
        </Grupo>
      )}

      {modo === 'cero' && (
        <>
        <Grupo titulo="La marca">
          <Campo label="Nombre de la marca" requerido>
            <input required value={f.marca} onChange={set('marca')} placeholder="Café Aurora" />
          </Campo>
          <Campo label="Sector">
            <input value={f.sector} onChange={set('sector')} placeholder="Café de especialidad" />
          </Campo>
          <Campo label="¿Qué vende o qué hace?" ancho>
            <textarea rows="3" value={f.que_vende} onChange={set('que_vende')} placeholder="Una cafetería en Cali que tuesta su propio café de fincas del Valle..." />
          </Campo>
          <Campo label="¿A quién le habla?" ancho>
            <textarea rows="2" value={f.audiencia} onChange={set('audiencia')} placeholder="Estudiantes y jóvenes profesionales de 20 a 35 años que trabajan desde cafés..." />
          </Campo>
          <Campo label="País o ciudad">
            <input value={f.pais} onChange={set('pais')} />
          </Campo>
        </Grupo>

        <Grupo titulo="Cómo habla">
          <Campo label="Personalidad (3 palabras)">
            <input value={f.personalidad} onChange={set('personalidad')} placeholder="Cálida, curiosa, honesta" />
          </Campo>
          <Campo label="Le habla a la gente de">
            <div className="segmentado" role="radiogroup">
              {['tú', 'usted'].map((t) => (
                <button type="button" key={t} role="radio" aria-checked={f.tono === t} className={f.tono === t ? 'seg activo' : 'seg'} onClick={() => setF({ ...f, tono: t })}>
                  {t}
                </button>
              ))}
            </div>
          </Campo>
          <Campo label="Temas de los que quiere hablar" ancho>
            <textarea rows="2" value={f.temas} onChange={set('temas')} placeholder="El origen del café, recetas en casa, la comunidad del local, lanzamientos..." />
          </Campo>
          <Campo label="Palabras o temas prohibidos" ancho>
            <input value={f.palabras_prohibidas} onChange={set('palabras_prohibidas')} placeholder="barato, el mejor, política" />
          </Campo>
        </Grupo>

        <Grupo titulo="Cómo se ve">
          <Campo label="Colores de la marca" ancho>
            <div className="colores">
              {f.colores.map((c, i) => (
                <label key={i} className="color">
                  <input type="color" value={c} onChange={(e) => setColor(i, e.target.value)} />
                  <span>
                    <strong>{['Principal', 'Secundario', 'Acento'][i]}</strong>
                    <span className="muted">{c.toUpperCase()}</span>
                  </span>
                </label>
              ))}
            </div>
          </Campo>
          <Campo label="Tipografías">
            <input value={f.tipografias} onChange={set('tipografias')} placeholder="Playfair Display y Lato" />
          </Campo>
          <Campo label="Estilo de las imágenes">
            <input value={f.estilo_visual} onChange={set('estilo_visual')} placeholder="Fotos cálidas con luz natural" />
          </Campo>
          <Campo label="Qué nunca debe aparecer en las imágenes" ancho>
            <input value={f.evitar_imagenes} onChange={set('evitar_imagenes')} placeholder="Vasos desechables, fondos blancos de estudio" />
          </Campo>
          <Campo label="Referencias (cuentas o marcas que le gustan)" ancho>
            <input value={f.referencias} onChange={set('referencias')} placeholder="@cuenta1, @cuenta2" />
          </Campo>
        </Grupo>

        <Grupo titulo="Dónde y con quién">
          <Campo label="Redes donde publica" ancho>
            <div className="chips">
              {REDES.map((r) => (
                <button type="button" key={r} aria-pressed={f.redes.includes(r)} className={f.redes.includes(r) ? 'chip-btn activo' : 'chip-btn'} onClick={() => toggleRed(r)}>
                  {r}
                </button>
              ))}
            </div>
          </Campo>
          <Campo label="Correo de la persona responsable" ayuda="Recibe la invitación de Google Calendar cada vez que se programe un post." ancho>
            <input type="email" value={f.correo} onChange={set('correo')} placeholder="responsable@marca.com" />
          </Campo>
        </Grupo>
        </>
      )}

      {estado.tipo === 'error' && <AvisoError mensaje={estado.mensaje} />}

      <div className="form-fin">
        <p className="muted small">MUSA tarda alrededor de un minuto en crear el brandbook.</p>
        <button className="btn btn-musa" type="submit" disabled={!f.marca.trim() || (modo === 'brandbook' && !bb.texto.trim())}>
          {modo === 'brandbook' ? 'Importar brandbook' : 'Crear brandbook'}
        </button>
      </div>
    </form>
  )
}

const FRASES_BRANDBOOK = [
  'Leyendo cómo es tu marca…',
  'Encontrando su tono de voz…',
  'Definiendo los pilares de contenido…',
  'Traduciendo los colores al estilo visual…',
  'Guardando el proyecto en Notion…',
]

/* ---------- 2. PARRILLA ---------- */

function hoyMas(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

function Parrilla({ ir }) {
  const [listas, setListas] = useState({ marcas: [], plantillas: [], cargando: true })
  const [f, setF] = useState({ proyecto: '', plantilla: '', peticion: '', fecha_inicio: hoyMas(1), cantidad_posts: 3 })
  const [estado, setEstado] = useState({ tipo: 'idle' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  useEffect(() => {
    listar()
      .then((r) =>
        setListas({
          marcas: (r.marcas || []).filter(Boolean),
          plantillas: (r.plantillas || []).filter(Boolean),
          cargando: false,
        }),
      )
      .catch(() => setListas({ marcas: [], plantillas: [], cargando: false, error: true }))
  }, [])

  async function enviar(e) {
    e.preventDefault()
    setEstado({ tipo: 'cargando' })
    try {
      const r = await crearParrilla({ ...f, cantidad_posts: Number(f.cantidad_posts) })
      setEstado({ tipo: 'listo', r })
    } catch (err) {
      setEstado({ tipo: 'error', mensaje: err.message })
    }
  }

  if (estado.tipo === 'cargando')
    return <Cargando titulo="Enviando tu pedido a MUSA" frases={['Conectando con MUSA…']} />

  if (estado.tipo === 'listo')
    return (
      <Resultado
        titulo="MUSA ya está creando tu parrilla"
        texto={`En 2 a 4 minutos aparecen ${f.cantidad_posts} posts de ${f.proyecto} en Notion, en estado "Por revisar", con su gancho, copy, guion o slides, prompt de imagen y hashtags.`}
        link={NOTION_MUSA}
        linkTexto="Ver los posts en Notion ↗"
        siguiente={{ texto: 'Cuando los revises: programar', onClick: () => ir('agenda') }}
      />
    )

  return (
    <form className="form" onSubmit={enviar}>
      <Encabezado
        paso="Paso 2"
        titulo="Pide tu parrilla"
        texto="MUSA usa el brandbook de la marca, la plantilla que elijas y las tendencias de la semana para proponer cada post."
      />

      <Grupo titulo="El pedido">
        <Campo label="Marca" requerido>
          <input required list="lista-marcas" value={f.proyecto} onChange={set('proyecto')} placeholder={listas.cargando ? 'Cargando marcas…' : 'Elige una marca'} />
          <datalist id="lista-marcas">
            {listas.marcas.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Campo>
        <Campo label="Plantilla de prompt" requerido>
          <select required value={f.plantilla} onChange={set('plantilla')}>
            <option value="">{listas.cargando ? 'Cargando plantillas…' : 'Elige una plantilla'}</option>
            {(listas.plantillas.length ? listas.plantillas : PLANTILLAS_RESPALDO).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="¿Qué quieres comunicar esta semana?" ancho ayuda="Un tema, una campaña, una fecha o un producto. Entre más concreto, mejor.">
          <textarea required rows="3" value={f.peticion} onChange={set('peticion')} placeholder="Lanzamos tres bebidas de temporada navideña y queremos que la gente venga a probarlas." />
        </Campo>
        <Campo label="Empieza el">
          <input type="date" required value={f.fecha_inicio} onChange={set('fecha_inicio')} />
        </Campo>
        <Campo label="Cantidad de posts">
          <div className="segmentado" role="radiogroup">
            {[1, 2, 3, 4, 5].map((n) => (
              <button type="button" key={n} role="radio" aria-checked={Number(f.cantidad_posts) === n} className={Number(f.cantidad_posts) === n ? 'seg activo' : 'seg'} onClick={() => setF({ ...f, cantidad_posts: n })}>
                {n}
              </button>
            ))}
          </div>
        </Campo>
      </Grupo>

      {listas.error && <p className="aviso">No pude traer las marcas desde Notion. Puedes escribir el nombre exacto de la marca.</p>}
      {estado.tipo === 'error' && <AvisoError mensaje={estado.mensaje} />}

      <div className="form-fin">
        <p className="muted small">Cada post usa varios agentes de IA. Con el plan gratis de Make, mejor de 1 a 3 posts por prueba.</p>
        <button className="btn btn-musa" type="submit">
          Crear parrilla
        </button>
      </div>
    </form>
  )
}

const PLANTILLAS_RESPALDO = [
  'Lanzamiento de producto',
  'Educativo / tips',
  'Detrás de cámaras',
  'Promo / oferta',
  'Fecha especial',
  'Subirse a una tendencia',
]

/* ---------- 3. AGENDA ---------- */

function Agenda() {
  const [estado, setEstado] = useState({ tipo: 'idle' })

  async function programar() {
    setEstado({ tipo: 'cargando' })
    try {
      const r = await programarAprobados()
      setEstado({ tipo: 'listo', mensaje: r.mensaje })
    } catch (err) {
      setEstado({ tipo: 'error', mensaje: err.message })
    }
  }

  return (
    <div className="form">
      <Encabezado
        paso="Paso 3"
        titulo="Revisa, aprueba y programa"
        texto="MUSA propone, tú decides. Ningún post llega al calendario sin que una persona lo apruebe."
      />

      <ol className="checklist">
        <li>
          <span className="estado estado-revisar">Por revisar</span>
          <div>
            <strong>Abre los posts en Notion</strong>
            <p className="muted">Lee el gancho, el copy y el guion. Ajusta lo que quieras directamente en la página del post.</p>
          </div>
        </li>
        <li>
          <span className="estado estado-aprobado">Aprobado</span>
          <div>
            <strong>Cambia el estado a Aprobado</strong>
            <p className="muted">Si trabajas con un cliente, compártele el proyecto en Notion para que comente o apruebe con su cuenta.</p>
          </div>
        </li>
        <li>
          <span className="estado estado-programado">Programado</span>
          <div>
            <strong>Programa los aprobados</strong>
            <p className="muted">Cada post aprobado se vuelve un evento en Google Calendar con el link al post, recordatorio 2 horas antes e invitación a la persona responsable de la marca.</p>
          </div>
        </li>
      </ol>

      {estado.tipo === 'listo' && <p className="ok">{estado.mensaje || 'Listo. Revisa tu Google Calendar en unos segundos.'}</p>}
      {estado.tipo === 'error' && <AvisoError mensaje={estado.mensaje} />}

      <div className="form-fin">
        <div className="acciones">
          <a className="btn btn-linea" href={NOTION_MUSA} target="_blank" rel="noreferrer">
            Abrir Notion ↗
          </a>
          <a className="btn btn-linea" href={GOOGLE_CALENDAR} target="_blank" rel="noreferrer">
            Ver Google Calendar ↗
          </a>
        </div>
        <button className="btn btn-musa" onClick={programar} disabled={estado.tipo === 'cargando'}>
          {estado.tipo === 'cargando' ? 'Programando…' : 'Programar aprobados'}
        </button>
      </div>
    </div>
  )
}

/* ---------- Piezas compartidas ---------- */

function Encabezado({ paso, titulo, texto }) {
  return (
    <div className="encabezado">
      <p className="label">{paso}</p>
      <h1 className="h1">{titulo}</h1>
      <p className="lead">{texto}</p>
    </div>
  )
}

function Grupo({ titulo, children }) {
  return (
    <fieldset className="grupo">
      <legend className="h2">{titulo}</legend>
      <div className="grid">{children}</div>
    </fieldset>
  )
}

function Campo({ label, ayuda, requerido, ancho, children }) {
  return (
    <label className={ancho ? 'campo ancho' : 'campo'}>
      <span className="campo-label">
        {label}
        {requerido && <span className="req"> *</span>}
      </span>
      {children}
      {ayuda && <span className="muted small">{ayuda}</span>}
    </label>
  )
}

function Cargando({ titulo, frases }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (frases.length < 2) return
    const t = setInterval(() => setI((x) => Math.min(x + 1, frases.length - 1)), 9000)
    return () => clearInterval(t)
  }, [frases])
  return (
    <div className="estado-pantalla" role="status" aria-live="polite">
      <div className="spark" aria-hidden="true" />
      <h1 className="h1">{titulo}</h1>
      <p className="lead">{frases[i]}</p>
    </div>
  )
}

function Resultado({ titulo, texto, link, linkTexto, siguiente }) {
  return (
    <div className="estado-pantalla">
      <span className="estado estado-aprobado">Listo</span>
      <h1 className="h1">{titulo}</h1>
      <p className="lead">{texto}</p>
      <div className="acciones">
        {link && (
          <a className="btn btn-linea" href={link} target="_blank" rel="noreferrer">
            {linkTexto}
          </a>
        )}
        {siguiente && (
          <button className="btn btn-musa" onClick={siguiente.onClick}>
            {siguiente.texto}
          </button>
        )}
      </div>
    </div>
  )
}

function AvisoError({ mensaje }) {
  return (
    <p className="error" role="alert">
      Algo falló al hablar con Make. Revisa que el escenario esté activo e inténtalo de nuevo.
      {mensaje && <span className="small"> ({mensaje.slice(0, 140)})</span>}
    </p>
  )
}
