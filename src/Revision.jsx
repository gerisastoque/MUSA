import { useState } from 'react'
import { agendarAprobados, cambiarEstado, formatoFecha, GOOGLE_CALENDAR } from './api'
import Mascota from './Mascota'
import { AvisoError, ChipEstado, Encabezado } from './piezas'

const FILTROS = [
  ['todos', 'Todos'],
  ['Por revisar', 'Por revisar'],
  ['Cambios pedidos', 'Con cambios'],
  ['Aprobado', 'Aprobados'],
  ['Agendado', 'Agendados'],
]

export default function Revision({ posts, cargandoPosts, errorPosts, cargarPosts, setPostsLista, activa, marcas, ir }) {
  const [filtro, setFiltro] = useState('todos')
  const [soloActiva, setSoloActiva] = useState(true)
  const [abierto, setAbierto] = useState(null)
  const [cambios, setCambios] = useState({ id: null, texto: '' })
  const [ocupado, setOcupado] = useState(null)
  const [agenda, setAgenda] = useState({ tipo: 'idle' })
  const [errorAccion, setErrorAccion] = useState('')

  const deMarca = posts.filter((p) => !soloActiva || !activa || p.proyecto === activa.id)
  const visibles = deMarca
    .filter((p) => filtro === 'todos' || p.estado === filtro || (filtro === 'Agendado' && p.estado === 'Programado'))
    .sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
  const cuenta = (e) => deMarca.filter((p) => p.estado === e).length
  const aprobados = posts.filter((p) => p.estado === 'Aprobado').length
  const nombreMarca = (id) => marcas.find((m) => m.id === id)?.nombre

  async function mover(post, estado, comentario = '') {
    setOcupado(post.id)
    setErrorAccion('')
    try {
      await cambiarEstado(post.id, estado, comentario)
      setPostsLista((lista) => lista.map((p) => (p.id === post.id ? { ...p, estado, comentarios: comentario } : p)))
      setCambios({ id: null, texto: '' })
    } catch (err) {
      setErrorAccion(err.message || 'No se pudo cambiar el estado')
    } finally {
      setOcupado(null)
    }
  }

  async function agendar() {
    setAgenda({ tipo: 'cargando' })
    try {
      await agendarAprobados()
      setAgenda({ tipo: 'listo' })
      setTimeout(() => cargarPosts(), 15000)
    } catch (err) {
      setAgenda({ tipo: 'error', mensaje: err.message })
    }
  }

  return (
    <div className="pagina">
      <Encabezado etiqueta="MUSA PROPONE, TÚ DECIDES" titulo="Sala de revisión" texto={activa && soloActiva ? `Los posts de ${activa.nombre}. Aprueba lo que te guste y pide cambios a lo que no.` : 'Todos los posts de tus marcas.'}>
        <div className="panel-agenda">
          <span>
            <strong>
              {aprobados} {aprobados === 1 ? 'post aprobado' : 'posts aprobados'}
            </strong>{' '}
            {aprobados === 1 ? 'listo para el calendario' : aprobados ? 'listos para el calendario' : 'por ahora'}
          </span>
          <button className="btn btn-azul" onClick={agendar} disabled={!aprobados || agenda.tipo === 'cargando'}>
            {agenda.tipo === 'cargando' ? 'Agendando…' : 'Agendar recordatorios'}
          </button>
        </div>
      </Encabezado>

      {agenda.tipo === 'listo' && (
        <div className="aviso aviso-ok" role="status">
          <Mascota expresion="celebrando" size={56} />
          <div>
            <strong>¡Listo!</strong> Los recordatorios van llegando a Google Calendar, con el link al post y un aviso 2 horas antes.{' '}
            <a href={GOOGLE_CALENDAR} target="_blank" rel="noreferrer">
              Ver calendario ↗
            </a>
          </div>
        </div>
      )}
      {agenda.tipo === 'error' && <AvisoError mensaje={agenda.mensaje} onReintentar={agendar} />}
      {errorAccion && <AvisoError mensaje={errorAccion} />}

      <div className="barra-filtros">
        <div className="pestanas" role="tablist" aria-label="Filtrar por estado">
          {FILTROS.map(([id, nombre]) => (
            <button key={id} role="tab" aria-selected={filtro === id} className={filtro === id ? 'pestana activa' : 'pestana'} onClick={() => setFiltro(id)}>
              {nombre} · {id === 'todos' ? deMarca.length : id === 'Agendado' ? cuenta('Agendado') + cuenta('Programado') : cuenta(id)}
            </button>
          ))}
        </div>
        <div className="flujo" aria-hidden="true">
          <ChipEstado estado="Por revisar" />→<ChipEstado estado="Aprobado" />→<ChipEstado estado="Agendado" />
        </div>
      </div>
      {activa && marcas.length > 1 && (
        <label className="interruptor">
          <input type="checkbox" checked={soloActiva} onChange={(e) => setSoloActiva(e.target.checked)} />
          Solo {activa.nombre}
        </label>
      )}

      {errorPosts && <AvisoError mensaje="No pude traer los posts desde Notion." onReintentar={cargarPosts} />}

      {cargandoPosts && posts.length === 0 ? (
        <div className="posts-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="post esqueleto" />
          ))}
        </div>
      ) : visibles.length === 0 ? (
        <div className="vacio">
          <Mascota expresion="creando" size={150} />
          <h2 className="display-s">{deMarca.length ? 'Nada por aquí con ese filtro' : 'Todavía no hay posts'}</h2>
          <p className="muted">{deMarca.length ? 'Prueba con otro estado.' : 'Pídele una parrilla a MUSA y aparecerá aquí para que la revises.'}</p>
          {!deMarca.length && (
            <button className="btn btn-azul" onClick={() => ir('chat', 'Quiero la parrilla de esta semana')}>
              Pedir una parrilla
            </button>
          )}
        </div>
      ) : (
        <div className="posts-grid">
          {visibles.map((p) => {
            const formato = (p.formato || 'Reel').toLowerCase()
            const pidiendo = cambios.id === p.id
            return (
              <article key={p.id} className={`post${pidiendo ? ' post-foco' : ''}`}>
                <div className={`post-visual visual-${formato}`}>
                  <IconoFormato formato={formato} />
                  <span className="post-estado">
                    <ChipEstado estado={p.estado} />
                  </span>
                  {formato !== 'historia' && <span className="post-nota">Prompt de imagen listo</span>}
                </div>
                <div className="post-cuerpo">
                  <span className="post-meta">
                    {[p.formato, p.red, formatoFecha(p.fecha)].filter(Boolean).join(' · ')}
                    {!soloActiva && nombreMarca(p.proyecto) ? ` · ${nombreMarca(p.proyecto)}` : ''}
                  </span>
                  <h2 className="post-titulo">{p.gancho || p.titulo}</h2>
                  {p.caption && <p className="post-texto">{p.caption}</p>}
                  {p.tendencia && p.tendencia !== 'Sin tendencia' && (
                    <span className="chip-tendencia">
                      ↗ {p.tendencia.slice(0, 60)}
                      {p.fuente && (
                        <a href={p.fuente} target="_blank" rel="noreferrer">
                          fuente
                        </a>
                      )}
                    </span>
                  )}
                  {p.estado === 'Cambios pedidos' && p.comentarios && <p className="comentario">“{p.comentarios}”</p>}

                  {abierto === p.id && p.contenido && (
                    <div className="guion">
                      <span className="dato-label">{formato === 'reel' ? 'Guion' : 'Contenido'}</span>
                      {p.contenido.split(/\n| · /).filter(Boolean).map((l, i) => (
                        <p key={i}>{l}</p>
                      ))}
                    </div>
                  )}
                  {p.contenido && (
                    <button className="enlace" onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
                      {abierto === p.id ? 'Ver menos' : formato === 'reel' ? 'Ver guion' : 'Ver contenido'}
                    </button>
                  )}

                  {pidiendo ? (
                    <div className="pedir-cambios">
                      <label htmlFor={`c-${p.id}`}>¿Qué le cambiamos?</label>
                      <textarea id={`c-${p.id}`} rows="3" value={cambios.texto} onChange={(e) => setCambios({ id: p.id, texto: e.target.value })} placeholder="Que el gancho sea más cálido, menos de venta…" autoFocus />
                      <div className="acciones">
                        <button className="btn btn-oscuro btn-chico" disabled={!cambios.texto.trim() || ocupado === p.id} onClick={() => mover(p, 'Cambios pedidos', cambios.texto.trim())}>
                          {ocupado === p.id ? 'Guardando…' : 'Guardar pedido'}
                        </button>
                        <button className="btn btn-fantasma btn-chico" onClick={() => setCambios({ id: null, texto: '' })}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="post-acciones">
                      {(p.estado === 'Por revisar' || p.estado === 'Cambios pedidos') && (
                        <>
                          <button className="btn btn-azul btn-chico" disabled={ocupado === p.id} onClick={() => mover(p, 'Aprobado')}>
                            {ocupado === p.id ? '…' : 'Aprobar'}
                          </button>
                          <button className="btn btn-linea btn-chico" onClick={() => setCambios({ id: p.id, texto: p.comentarios || '' })}>
                            Pedir cambios
                          </button>
                        </>
                      )}
                      {p.estado === 'Aprobado' && (
                        <button className="btn btn-fantasma btn-chico" disabled={ocupado === p.id} onClick={() => mover(p, 'Por revisar')}>
                          Devolver a revisión
                        </button>
                      )}
                      {p.calendar && (
                        <a className="btn btn-linea btn-chico" href={p.calendar} target="_blank" rel="noreferrer">
                          Ver en Calendar ↗
                        </a>
                      )}
                    </div>
                  )}
                  <a className="enlace-fuerte" href={p.url} target="_blank" rel="noreferrer">
                    Ver post completo en Notion ↗
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function IconoFormato({ formato }) {
  if (formato === 'carrusel')
    return (
      <svg width="58" height="46" viewBox="0 0 56 44" aria-hidden="true">
        <rect x="12" y="4" width="32" height="36" rx="5" fill="#fff" stroke="#29243A" strokeWidth="2" />
        <rect x="2" y="9" width="8" height="26" rx="3" fill="#fff" stroke="#29243A" strokeWidth="2" />
        <rect x="46" y="9" width="8" height="26" rx="3" fill="#fff" stroke="#29243A" strokeWidth="2" />
      </svg>
    )
  if (formato === 'historia')
    return (
      <svg width="40" height="56" viewBox="0 0 40 56" aria-hidden="true">
        <rect x="2" y="2" width="36" height="52" rx="7" fill="#fff" stroke="#29243A" strokeWidth="2" />
        <rect x="8" y="34" width="24" height="12" rx="6" fill="#FF78B7" />
      </svg>
    )
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#29243A" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 5l11 7-11 7z" />
    </svg>
  )
}
