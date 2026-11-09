import { useEffect, useState } from 'react'
import Mascota, { Estrella } from './Mascota'

export function Etiqueta({ children, tono = 'rosa' }) {
  return (
    <span className={`etiqueta etiqueta-${tono}`}>
      <Estrella size={12} />
      {children}
    </span>
  )
}

export function Encabezado({ etiqueta, titulo, texto, children }) {
  return (
    <header className="encabezado">
      <div className="encabezado-texto">
        {etiqueta && <Etiqueta>{etiqueta}</Etiqueta>}
        <h1 className="display-l">{titulo}</h1>
        {texto && <p className="lead">{texto}</p>}
      </div>
      {children}
    </header>
  )
}

export function Grupo({ titulo, children }) {
  return (
    <fieldset className="grupo">
      <legend>{titulo}</legend>
      <div className="grid-campos">{children}</div>
    </fieldset>
  )
}

export function Campo({ label, ayuda, requerido, ancho, children }) {
  return (
    <label className={ancho ? 'campo ancho' : 'campo'}>
      <span className="campo-label">
        {label}
        {requerido && <span className="req"> *</span>}
      </span>
      {children}
      {ayuda && <span className="ayuda">{ayuda}</span>}
    </label>
  )
}

export function Cargando({ titulo, frases, expresion = 'creando' }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (frases.length < 2) return
    const t = setInterval(() => setI((x) => Math.min(x + 1, frases.length - 1)), 8000)
    return () => clearInterval(t)
  }, [frases])
  return (
    <div className="pantalla-estado" role="status" aria-live="polite">
      <div className="mascota-flota">
        <Mascota expresion={expresion} size={190} />
      </div>
      <h1 className="display-m">{titulo}</h1>
      <p className="lead">{frases[i]}</p>
    </div>
  )
}

export function Resultado({ titulo, texto, acciones }) {
  return (
    <div className="pantalla-estado">
      <Mascota expresion="celebrando" size={190} />
      <h1 className="display-m">{titulo}</h1>
      <p className="lead">{texto}</p>
      <div className="acciones">{acciones}</div>
    </div>
  )
}

export function AvisoError({ mensaje, onReintentar }) {
  return (
    <div className="aviso aviso-error" role="alert">
      <Mascota expresion="confundida" size={56} />
      <div>
        <strong>Uy, algo se enredó con Make.</strong> No perdiste nada: revisa que el escenario esté activo e inténtalo
        otra vez.
        {mensaje && <span className="ayuda"> ({mensaje.slice(0, 120)})</span>}
      </div>
      {onReintentar && (
        <button className="btn btn-linea btn-chico" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export function PuntosColor({ colores = [], size = 20 }) {
  if (!colores.length) return null
  return (
    <span className="puntos" aria-hidden="true">
      {colores.map((c) => (
        <span key={c} style={{ background: c, width: size, height: size }} />
      ))}
    </span>
  )
}

export const ESTADOS = {
  'Por revisar': 'revisar',
  'Cambios pedidos': 'cambios',
  Aprobado: 'aprobado',
  Agendado: 'agendado',
  Programado: 'agendado',
  Publicado: 'publicado',
}

export function ChipEstado({ estado }) {
  return <span className={`chip-estado estado-${ESTADOS[estado] || 'revisar'}`}>{estado || 'Por revisar'}</span>
}

export const Icono = {
  chat: (
    <path d="M4 5h16v11H9l-5 4z" />
  ),
  marca: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  parrilla: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  revision: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </>
  ),
  marcas: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </>
  ),
  clip: <path d="M21 11.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.6-8.6a3.3 3.3 0 014.7 4.7l-8.6 8.6a1.7 1.7 0 01-2.4-2.4l7.9-7.9" />,
  enviar: <path d="M5 12h14M13 6l6 6-6 6" />,
  externo: <path d="M7 17L17 7M8 7h9v9" />,
  abajo: <path d="M6 9l6 6 6-6" />,
  mas: <path d="M12 5v14M5 12h14" />,
  basura: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
}

export function Svg({ nombre, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {Icono[nombre]}
    </svg>
  )
}
