import { useCallback, useEffect, useMemo, useState } from 'react'
import { listar, traerPosts, traerTendencias, coloresDe, leer, guardar, NOTION_MUSA } from './api'
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

const nuevoChat = (marcaId = null) => {
  const ahora = Date.now()
  return { id: ahora.toString(36) + Math.random().toString(36).slice(2, 6), titulo: 'Chat nuevo', marcaId, actualizado: ahora, mensajes: [SALUDO] }
}

// Si la página se cerró mientras MUSA ejecutaba algo, no lo dejamos "trabajando" para siempre
const limpiarChat = (c) => ({
  ...c,
  mensajes: (c.mensajes || [SALUDO]).map((m) => (m.estado === 'ejecutando' ? { ...m, estado: 'interrumpido' } : m)),
})

const recortar = (t) => (t.length > 42 ? t.slice(0, 40).trim() + '…' : t)

export default function App() {
  const [vista, setVista] = useState(() => {
    const h = window.location.hash.replace('#', '')
    return IDS.includes(h) ? h : 'inicio'
  })
  const [datos, setDatos] = useState({ marcas: [], plantillas: [], cargando: true, error: false })
  const [posts, setPosts] = useState({ lista: [], cargando: true, error: false })
  const [activaId, setActivaId] = useState(() => leer('musa-marca-activa', null))
  const [chats, setChats] = useState(() => {
    const guardados = leer('musa-chats', null)
    return Array.isArray(guardados) && guardados.length ? guardados.map(limpiarChat) : [nuevoChat(leer('musa-marca-activa', null))]
  })
  const [chatId, setChatId] = useState(() => leer('musa-chat-actual', null))
  const [pendienteChat, setPendienteChat] = useState('')
  const [tendencias, setTendencias] = useState({ lista: [], musica: [], cargando: true })

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
    traerTendencias()
      .then((d) => setTendencias({ ...d, cargando: false }))
      .catch(() => setTendencias({ lista: [], musica: [], cargando: false }))
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

  const chatsOrdenados = useMemo(() => [...chats].sort((a, b) => b.actualizado - a.actualizado), [chats])
  const chatActual = chats.find((c) => c.id === chatId) || chatsOrdenados[0]

  useEffect(() => {
    guardar('musa-chats', chatsOrdenados.slice(0, 30))
  }, [chatsOrdenados])

  useEffect(() => {
    guardar('musa-chat-actual', chatActual.id)
  }, [chatActual.id])

  // Actualiza los mensajes de un chat concreto (aunque la persona ya se haya cambiado a otro)
  const actualizarChat = useCallback((id, fn) => {
    setChats((cs) =>
      cs.map((c) => {
        if (c.id !== id) return c
        const mensajes = typeof fn === 'function' ? fn(c.mensajes) : fn
        const primero = mensajes.find((m) => m.de === 'yo')
        return {
          ...c,
          mensajes,
          actualizado: Date.now(),
          titulo: c.titulo === 'Chat nuevo' && primero ? recortar(primero.texto) : c.titulo,
        }
      }),
    )
  }, [])

  const elegirMarca = (id) => {
    setActivaId(id)
    guardar('musa-marca-activa', id)
    setChats((cs) => cs.map((c) => (c.id === chatActual.id ? { ...c, marcaId: id } : c)))
  }

  const abrirChat = (id) => {
    const c = chats.find((x) => x.id === id)
    if (!c) return
    setChatId(id)
    if (c.marcaId && marcas.some((m) => m.id === c.marcaId)) {
      setActivaId(c.marcaId)
      guardar('musa-marca-activa', c.marcaId)
    }
  }

  const empezarChat = () => {
    // Si el chat actual está vacío, no creamos otro igual
    if (!chatActual.mensajes.some((m) => m.de === 'yo')) return chatActual.id
    const c = nuevoChat(activa?.id || null)
    setChats((cs) => [c, ...cs].slice(0, 30))
    setChatId(c.id)
    return c.id
  }

  const borrarChat = (id) => {
    setChats((cs) => {
      const quedan = cs.filter((c) => c.id !== id)
      return quedan.length ? quedan : [nuevoChat(activa?.id || null)]
    })
    setChatId(null)
  }

  const ir = (id, mensajeChat) => {
    if (mensajeChat) {
      empezarChat()
      setPendienteChat(mensajeChat)
    }
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
    tendencias: tendencias.lista,
    musica: tendencias.musica,
    cargandoTendencias: tendencias.cargando,
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
            key={chatActual.id}
            chatId={chatActual.id}
            chats={chatsOrdenados}
            mensajes={chatActual.mensajes}
            actualizarChat={actualizarChat}
            abrirChat={abrirChat}
            empezarChat={empezarChat}
            borrarChat={borrarChat}
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
