import { useState } from 'react'
import Mascota, { Estrella } from './Mascota'
import { Etiqueta, PuntosColor, Svg } from './piezas'

const SUGERENCIAS = ['Tengo una marca nueva', 'Arma mi parrilla de la semana', 'Agenda lo que aprobé']

export default function Inicio({ marcas, posts, activa, elegirMarca, ir, cargandoMarcas, tendencias = [], musica = [], cargandoTendencias }) {
  const [idea, setIdea] = useState('')
  const porRevisar = posts.filter((p) => p.estado === 'Por revisar').length

  const conteo = (id) => {
    const deMarca = posts.filter((p) => p.proyecto === id)
    return {
      revisar: deMarca.filter((p) => p.estado === 'Por revisar').length,
      agendados: deMarca.filter((p) => p.estado === 'Agendado').length,
    }
  }

  return (
    <div className="pagina pagina-inicio">
      <section className="hero">
        <div className="hero-texto">
          <Etiqueta>TU COMPAÑERA CREATIVA</Etiqueta>
          <h1 className="display-xl">
            Ideas por todas partes. Hagamos{' '}
            <span className="subrayado">
              algo
              <svg viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true">
                <path d="M3 12C30 4 50 18 78 10S128 4 152 12S186 14 197 7" fill="none" stroke="#FF78B7" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>{' '}
            con ellas.
          </h1>
          <p className="lead">
            MUSA investiga tendencias, encuentra inspiración y convierte tus ideas en contenido para tu marca. Tú pones la
            intención; ella pone las herramientas.
          </p>

          <form
            className="caja-idea"
            onSubmit={(e) => {
              e.preventDefault()
              ir('chat', idea.trim() || undefined)
            }}
          >
            <label htmlFor="idea">¿Qué vamos a crear hoy?</label>
            <div className="caja-fila">
              <input
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={activa ? `3 posts para ${activa.nombre} desde el lunes…` : 'Cuéntame tu idea…'}
              />
              <button className="btn-redondo" type="submit" aria-label="Enviar a MUSA">
                <Svg nombre="enviar" size={22} />
              </button>
            </div>
          </form>
          <div className="chips">
            {SUGERENCIAS.map((s) => (
              <button key={s} className="chip-btn" onClick={() => ir('chat', s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-arte" aria-hidden="true">
          <div className="blob" />
          <svg className="trazos" viewBox="0 0 400 400">
            <path d="M30 120C60 60 120 40 170 46" />
            <path d="M360 300C380 250 370 210 340 180" />
          </svg>
          <div className="hero-mascota">
            <Mascota expresion="hola" size={320} />
          </div>
          <div className="globo">¡Hola! ¿Qué creamos hoy?</div>
          <div className="mini-post">
            <div className="mini-post-img">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#29243A" strokeWidth="1.8" strokeLinejoin="round">
                <path d="M8 5l11 7-11 7z" />
              </svg>
            </div>
            <span>Reel · tu próxima idea</span>
            <span className="chip-estado estado-revisar">Por revisar</span>
          </div>
          <div className="sticker-rosa">
            ¡Nueva
            <br />
            idea!
          </div>
          <div className="sticker-lima">↗ Lo que está pasando</div>
          <span className="estrella-1">
            <Estrella size={34} fill="#5546E8" />
          </span>
          <span className="estrella-2">
            <Estrella size={22} />
          </span>
        </div>
      </section>

      <section className="seccion">
        <div className="seccion-cabeza">
          <div className="titulo-con-etiqueta">
            <span className="etiqueta etiqueta-lima">
              <span className="punto-vivo" /> EN VIVO · GOOGLE TRENDS + APPLE MUSIC
            </span>
            <h2 className="display-m">Lo que está pasando hoy</h2>
          </div>
          <button className="enlace" onClick={() => ir('chat', '¿Qué está en tendencia hoy y cuál le sirve a mi marca?')}>
            Pregúntale a MUSA cuál te sirve →
          </button>
        </div>
        <p className="lead">
          De qué se habla y qué se escucha hoy en Colombia. MUSA solo usa lo que encaja con tu marca y descarta los temas de
          riesgo (política, tragedias, polémicas).
        </p>
        {cargandoTendencias ? (
          <div className="tendencias-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="tendencia esqueleto" />
            ))}
          </div>
        ) : tendencias.length === 0 ? (
          <p className="muted">No hay tendencias frescas por ahora. Probemos otro ángulo más tarde.</p>
        ) : (
          <div className="tendencias-grid">
            {tendencias.slice(0, 8).map((t, i) => {
              const n = t.noticias[0]
              return (
                <article key={t.titulo + i} className="tendencia">
                  <div className="fila-entre">
                    <span className="tendencia-num">{String(i + 1).padStart(2, '0')}</span>
                    {t.trafico && <span className="chip-suave tono-2">{t.trafico} búsquedas</span>}
                  </div>
                  <h3>{t.titulo}</h3>
                  {n && (
                    <a href={n.url} target="_blank" rel="noreferrer" className="tendencia-fuente">
                      {n.titulo}
                      <span>{n.medio} ↗</span>
                    </a>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {musica.length > 0 && (
          <div className="musica">
            <div className="fila-entre">
              <h3 className="musica-titulo">Sonando en Colombia</h3>
              <span className="ayuda">Apple Music · lo más escuchado hoy</span>
            </div>
            <div className="musica-fila">
              {musica.slice(0, 8).map((c, i) => (
                <a key={c.url || i} className="cancion" href={c.url} target="_blank" rel="noreferrer">
                  {c.portada && <img src={c.portada} alt="" width="56" height="56" loading="lazy" />}
                  <span className="cancion-texto">
                    <strong>
                      {i + 1}. {c.cancion}
                    </strong>
                    <span>{c.artista}</span>
                  </span>
                </a>
              ))}
            </div>
            <p className="ayuda">
              MUSA sugiere el audio de cada reel según la personalidad de la marca. Antes de usarlo, verifica que la canción esté en
              la biblioteca de audio comercial de la red.
            </p>
          </div>
        )}
      </section>

      <section className="seccion">
        <h2 className="display-m angosto">De una ideíta a un plan de contenido completo.</h2>
        <div className="pasos">
          <div className="paso">
            <span className="paso-num lav">01</span>
            <h3>Conoce tu marca</h3>
            <p>Aprende su personalidad, su audiencia y su identidad visual. O lee el brandbook que ya tienes.</p>
          </div>
          <div className="paso">
            <span className="paso-num rosa">02</span>
            <h3>Busca la inspiración</h3>
            <p>Mira lo que está pasando y arma una propuesta de contenido que suene a tu marca.</p>
          </div>
          <div className="paso">
            <span className="paso-num amarillo">03</span>
            <h3>Crea, revisa y agenda</h3>
            <p>Tú apruebas cada post y MUSA lo lleva a tu calendario para que nada se quede en idea.</p>
          </div>
        </div>
      </section>

      <section className="seccion">
        <h2 className="display-m">Manos a la obra</h2>
        <div className="tarjetas-accion">
          <button className="tarjeta-accion fondo-lav" onClick={() => ir('marca')}>
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <rect x="6" y="10" width="44" height="48" rx="8" fill="#fff" stroke="#29243A" strokeWidth="2.5" />
              <circle cx="18" cy="24" r="5" fill="#5546E8" />
              <circle cx="30" cy="24" r="5" fill="#FF78B7" />
              <circle cx="42" cy="24" r="5" fill="#FFD66B" stroke="#29243A" strokeWidth="1.5" />
              <path d="M14 38H42M14 47H32" stroke="#29243A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M54 4L56 10L62 12L56 14L54 20L52 14L46 12L52 10Z" fill="#29243A" />
            </svg>
            <h3>Nueva marca</h3>
            <p>Cuéntame de tu marca o súbeme su brandbook. La conozco en un minuto.</p>
            <span className="tarjeta-cta">Empezar →</span>
          </button>
          <button className="tarjeta-accion fondo-amarillo" onClick={() => ir('parrilla')}>
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <rect x="6" y="12" width="52" height="44" rx="8" fill="#fff" stroke="#29243A" strokeWidth="2.5" />
              <path d="M6 24H58" stroke="#29243A" strokeWidth="2.5" />
              <path d="M20 6V16M44 6V16" stroke="#29243A" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="14" y="31" width="10" height="8" rx="2" fill="#FF78B7" />
              <rect x="28" y="31" width="10" height="8" rx="2" fill="#A78BFA" />
              <rect x="42" y="43" width="10" height="8" rx="2" fill="#C8EB85" stroke="#29243A" strokeWidth="1.5" />
            </svg>
            <h3>Crear parrilla</h3>
            <p>Ideas para la semana con copy, guiones de reels y prompts de imagen.</p>
            <span className="tarjeta-cta">Planear →</span>
          </button>
          <button className="tarjeta-accion fondo-rosa" onClick={() => ir('revision')}>
            {porRevisar > 0 && <span className="burbuja-num">{porRevisar}</span>}
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <rect x="8" y="8" width="40" height="50" rx="8" fill="#fff" stroke="#29243A" strokeWidth="2.5" />
              <path d="M16 22H40M16 31H36" stroke="#29243A" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="46" cy="46" r="13" fill="#C8EB85" stroke="#29243A" strokeWidth="2.5" />
              <path d="M40 46L44.5 50.5L52 42" fill="none" stroke="#29243A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>Revisar</h3>
            <p>{porRevisar > 0 ? `Tienes ${porRevisar} ${porRevisar === 1 ? 'post' : 'posts'} esperando tu visto bueno.` : 'Aquí aprobarás lo que MUSA te proponga.'}</p>
            <span className="tarjeta-cta">Ir a la sala de revisión →</span>
          </button>
        </div>
      </section>

      <section className="seccion">
        <div className="seccion-cabeza">
          <h2 className="display-m">Tu rincón creativo</h2>
          {marcas.length > 0 && (
            <button className="enlace" onClick={() => ir('marcas')}>
              Ver todas las marcas →
            </button>
          )}
        </div>
        <div className="marcas-grid">
          {cargandoMarcas && marcas.length === 0 && <div className="marca-card esqueleto" />}
          {marcas.slice(0, 2).map((m) => {
            const c = conteo(m.id)
            const esActiva = activa && activa.id === m.id
            return (
              <article key={m.id} className="marca-card">
                <div className="franja-color">
                  {(m.paleta.length ? m.paleta : ['#EDE7FF', '#FFE1EF', '#FFF0C2']).map((col, i) => (
                    <span key={col + i} style={{ background: col, flex: 3 - Math.min(i, 2) }} />
                  ))}
                </div>
                <div className="marca-card-cuerpo">
                  <div className="fila-entre">
                    <h3>{m.nombre}</h3>
                    {esActiva && <span className="chip-activa">ACTIVA</span>}
                  </div>
                  <p className="muted">{[m.sector, m.redes].filter(Boolean).join(' · ') || 'Proyecto en Notion'}</p>
                  <div className="chips">
                    <span className="chip-estado estado-revisar">{c.revisar} por revisar</span>
                    <span className="chip-estado estado-aprobado">{c.agendados} agendados</span>
                  </div>
                  <div className="fila-enlaces">
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noreferrer">
                        Ver brandbook ↗
                      </a>
                    )}
                    <button
                      className="enlace"
                      onClick={() => {
                        elegirMarca(m.id)
                        ir('chat')
                      }}
                    >
                      Crear contenido →
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
          <article className="marca-card marca-nueva">
            <Mascota expresion="creando" size={110} />
            <div>
              <h3>{marcas.length ? 'Tu próxima gran idea' : 'Toda gran idea empieza en algún lado'}</h3>
              <p className="muted">{marcas.length ? '¿Conocemos otra marca?' : 'Conozcamos tu marca.'}</p>
              <button className="enlace" onClick={() => ir('marca')}>
                {marcas.length ? 'Crear otra marca →' : 'Crear mi primera marca →'}
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
