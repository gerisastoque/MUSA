import { useCallback, useEffect, useMemo, useState } from 'react'
import { listar, traerPosts, coloresDe, leer, guardar, NOTION_MUSA } from './api'
import { Estrella } from './Mascota'
import { PuntosColor, Svg } from './piezas'
import Inicio from './Inicio'
import Chat from './Chat'
import NuevaMarca from './NuevaMarca'
import Parrilla from './Parrilla'
import Revision from './Revision'
import Marcas from './Marcas'

const VISTAS = [
  { id: 'chat', nombre: 'Habla con MUSA', icono: 'chat' },
  { id: 'marca', nombre: 'Nueva marca', icono: 'marca' },
  { id: 'parrilla', nombre: 'Crear parrilla', icono: 'parrilla' },
  { id: 'revision', nombre: 'Revisar y agendar', icono: 'revision' },
  { id: 'marcas', nombre: 'Mis marcas', icono: 'marcas' },
]
const IDS = ['inicio', ...VISTAS.map((v) => v.id)]

const SALUDO = {
  de: 'musa',
  expresion: 'hola',
  texto: '¡Hola! Soy MUSA, tu compañera creativa. Puedo conocer una marca nueva (o leer su brandbook), armarte la parrilla de la semana o agendar lo que ya aprobaste. ¿Con qué empezamos?',
}

export default function App() {
  const [vista, setVista] = useState(() => {
    const h = window.location.hash.replace('#', '')
    return IDS.includes(h) ? h : 'inicio'
  })
  const [datos, setDatos] = useState({ marcas: [], plantillas: [], cargando: true, error: false })
  const [posts, setPosts] = useState({ lista: [], cargando: true, error: false })
  const [activaId, setActivaId] = useState(() => leer('musa-marca-activa', null))
  const [mensajes, setMensajes] = useState([SALUDO])
  const [pendienteChat, setPendienteChat] = useState('')

  const cargarMarcas = useCallback(() => {
    setDatos((d) => ({ ...d, cargando: true, error: false }))
    return listar()
      .then((r) => setDatos({ ...r, cargando: false, error: false }))
      .catch(() => setDatos((d) => ({ ...d, cargando: false, error: true })))
  }, [])

  const cargarPosts = useCallback(() => {
    setPosts((p) => ({ ...p, cargando: true, error: false }))
    return traerPosts()
      .then((lista) => setPosts({ lista, cargando: false, error: false }))
      .catch(() => setPosts((p) => ({ ...p, cargando: false, error: true })))
  }, [])

  useEffect(() => {
    cargarMarcas()
    cargarPosts()
  }, [cargarMarcas, cargarPosts])

  useEffect(() => {
    const alCambiar = () => {
      const h = window.location.hash.replace('#', '')
      if (IDS.includes(h)) setVista(h)
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  useEffect(() => {
    if (window.location.hash !== `#${vista}`) window.location.hash = vista
    window.scrollTo(0, 0)
  }, [vista])

  const marcas = useMemo(() => datos.marcas.map((m) => ({ ...m, paleta: coloresDe(m.colores) })), [datos.marcas])
  const activa = marcas.find((m) => m.id === activaId) || marcas[0] || null
  const porRevisar = posts.lista.filter((p) => p.estado === 'Por revisar').length

  const elegirMarca = (id) => {
    setActivaId(id)
    guardar('musa-marca-activa', id)
  }

  const ir = (id, mensajeChat) => {
    if (mensajeChat) setPendienteChat(mensajeChat)
    setVista(id)
  }

  const ctx = {
    marcas,
    plantillas: datos.plantillas,
    cargandoMarcas: datos.cargando,
    errorMarcas: datos.error,
    cargarMarcas,
    posts: posts.lista,
    cargandoPosts: posts.cargando,
    errorPosts: posts.error,
    cargarPosts,
    setPostsLista: (fn) => setPosts((p) => ({ ...p, lista: fn(p.lista) })),
    activa,
    elegirMarca,
    ir,
  }

  return (
    <div className="app">
      <aside className="lateral">
        <button className="logo" onClick={() => setVista('inicio')} aria-label="MUSA, ir al inicio">
          musa
          <Estrella size={22} fill="#FFD66B" stroke="#29243A" />
        </button>
        <span className="modo-creativo">
          <span className="punto-vivo" />
          Modo creativo: on
        </span>
        <nav aria-label="Menú principal" className="menu">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              className={vista === v.id ? 'menu-item activo' : 'menu-item'}
              onClick={() => setVista(v.id)}
              aria-current={vista === v.id ? 'page' : undefined}
            >
              <span className="menu-icono">
                <Svg nombre={v.icono} size={17} />
              </span>
              {v.nombre}
              {v.id === 'revision' && porRevisar > 0 && <span className="contador">{porRevisar}</span>}
            </button>
          ))}
        </nav>
        <div className="lateral-pie">
          {activa && (
            <div className="marca-activa">
              <span className="micro">Marca activa</span>
              <div className="marca-activa-fila">
                <PuntosColor colores={activa.paleta} size={18} />
                <strong>{activa.nombre}</strong>
              </div>
              {marcas.length > 1 && (
                <label className="cambiar-marca">
                  <span className="sr">Cambiar marca activa</span>
                  <select value={activa.id} onChange={(e) => elegirMarca(e.target.value)}>
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
          <a className="enlace-notion" href={NOTION_MUSA} target="_blank" rel="noreferrer">
            Abrir en Notion <Svg nombre="externo" size={16} />
          </a>
        </div>
      </aside>

      <main className="contenido">
        {vista === 'inicio' && <Inicio {...ctx} />}
        {vista === 'chat' && (
          <Chat
            {...ctx}
            mensajes={mensajes}
            setMensajes={setMensajes}
            pendiente={pendienteChat}
            limpiarPendiente={() => setPendienteChat('')}
          />
        )}
        {vista === 'marca' && <NuevaMarca {...ctx} />}
        {vista === 'parrilla' && <Parrilla {...ctx} />}
        {vista === 'revision' && <Revision {...ctx} />}
        {vista === 'marcas' && <Marcas {...ctx} />}

        <footer className="pie">
          <div className="pie-marca">
            <span className="pie-logo">musa</span>
            <em>Inspired by what's happening. Created by you.</em>
          </div>
          <div className="pie-links">
            <a href={NOTION_MUSA} target="_blank" rel="noreferrer">
              Notion
            </a>
            <span>Hecho con Make, Notion y Google Calendar · Soluciones con IA Generativa · ICESI 2026</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
