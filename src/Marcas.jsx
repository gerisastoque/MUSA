import Mascota from './Mascota'
import { AvisoError, Encabezado } from './piezas'

export default function Marcas({ marcas, posts, activa, elegirMarca, ir, cargandoMarcas, errorMarcas, cargarMarcas }) {
  return (
    <div className="pagina">
      <Encabezado etiqueta="TU RINCÓN CREATIVO" titulo="Mis marcas" texto="Cada marca tiene su brandbook en Notion. Elige con cuál trabajar para que MUSA no mezcle contextos.">
        <button className="btn btn-azul" onClick={() => ir('marca')}>
          Nueva marca
        </button>
      </Encabezado>

      {errorMarcas && <AvisoError mensaje="No pude traer las marcas desde Notion." onReintentar={cargarMarcas} />}

      <div className="marcas-grid">
        {cargandoMarcas && marcas.length === 0 && [0, 1].map((i) => <div key={i} className="marca-card esqueleto" />)}
        {marcas.map((m) => {
          const deMarca = posts.filter((p) => p.proyecto === m.id)
          const esActiva = activa?.id === m.id
          return (
            <article key={m.id} className={`marca-card${esActiva ? ' marca-activa-card' : ''}`}>
              <div className="franja-color">
                {(m.paleta.length ? m.paleta : ['#EDE7FF', '#FFE1EF', '#FFF0C2']).map((c, i) => (
                  <span key={c + i} style={{ background: c, flex: 3 - Math.min(i, 2) }} />
                ))}
              </div>
              <div className="marca-card-cuerpo">
                <div className="fila-entre">
                  <h3>{m.nombre}</h3>
                  {esActiva && <span className="chip-activa">ACTIVA</span>}
                </div>
                {m.sector && <p className="muted">{m.sector}</p>}
                <dl className="ficha">
                  {m.personalidad && (
                    <div>
                      <dt>Personalidad</dt>
                      <dd>{m.personalidad}</dd>
                    </div>
                  )}
                  {m.tono && (
                    <div>
                      <dt>Tono</dt>
                      <dd>{m.tono.slice(0, 140)}</dd>
                    </div>
                  )}
                  {m.redes && (
                    <div>
                      <dt>Redes</dt>
                      <dd>{m.redes}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Publicaciones</dt>
                    <dd>
                      {deMarca.length} en total · {deMarca.filter((p) => p.estado === 'Por revisar').length} por revisar · {deMarca.filter((p) => p.estado === 'Agendado').length} agendadas
                    </dd>
                  </div>
                </dl>
                <div className="fila-enlaces">
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noreferrer">
                      Brandbook en Notion ↗
                    </a>
                  )}
                  {!esActiva && (
                    <button className="enlace" onClick={() => elegirMarca(m.id)}>
                      Usar esta marca
                    </button>
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
    </div>
  )
}
