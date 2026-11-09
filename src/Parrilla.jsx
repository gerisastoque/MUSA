import { useState } from 'react'
import { crearParrilla, elegirPlantilla, formatoFecha } from './api'
import { Estrella } from './Mascota'
import { AvisoError, Campo, Cargando, Encabezado, Grupo, Resultado } from './piezas'

const RESPALDO = ['Lanzamiento de producto', 'Educativo / tips', 'Detrás de cámaras', 'Promo / oferta', 'Fecha especial', 'Subirse a una tendencia']

function hoyMas(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export default function Parrilla({ marcas, plantillas, activa, elegirMarca, ir, cargandoMarcas, errorMarcas }) {
  const lista = plantillas.length ? plantillas : RESPALDO
  const [f, setF] = useState({ plantilla: '', peticion: '', fecha_inicio: hoyMas(1), cantidad_posts: 3 })
  const [estado, setEstado] = useState({ tipo: 'idle' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const plantillaFinal = f.plantilla || elegirPlantilla(f.peticion, lista)
  const listo = activa && f.peticion.trim() && f.fecha_inicio

  async function enviar(e) {
    e.preventDefault()
    if (!listo) return
    setEstado({ tipo: 'cargando' })
    try {
      await crearParrilla({
        proyecto: activa.nombre,
        plantilla: plantillaFinal,
        peticion: f.peticion,
        fecha_inicio: f.fecha_inicio,
        cantidad_posts: Number(f.cantidad_posts),
      })
      setEstado({ tipo: 'listo' })
    } catch (err) {
      setEstado({ tipo: 'error', mensaje: err.message })
    }
  }

  if (estado.tipo === 'cargando')
    return (
      <div className="pagina">
        <Cargando titulo="Pasándole tu pedido a MUSA" frases={['Buscando inspiración…']} expresion="investigando" />
      </div>
    )

  if (estado.tipo === 'listo')
    return (
      <div className="pagina">
        <Resultado
          titulo="¡Tu parrilla está tomando forma!"
          texto={`Make ya está escribiendo ${f.cantidad_posts} ${Number(f.cantidad_posts) === 1 ? 'post' : 'posts'} para ${activa.nombre}. En 2 a 4 minutos aparecen en la sala de revisión como “Por revisar”, con gancho, copy, guion o slides, prompt de imagen y hashtags.`}
          acciones={
            <>
              <button className="btn btn-linea" onClick={() => setEstado({ tipo: 'idle' })}>
                Pedir otra parrilla
              </button>
              <button className="btn btn-azul" onClick={() => ir('revision')}>
                Ir a la sala de revisión
              </button>
            </>
          }
        />
      </div>
    )

  return (
    <div className="pagina">
      <form className="formulario" onSubmit={enviar}>
        <Encabezado etiqueta="PASO 2" titulo="Pide tu parrilla" texto="MUSA usa el brandbook de la marca, la plantilla y lo que está pasando esta semana para proponer cada post." />

        <Grupo titulo="El pedido">
          <Campo label="Marca" requerido>
            {marcas.length ? (
              <select value={activa?.id || ''} onChange={(e) => elegirMarca(e.target.value)}>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <input disabled placeholder={cargandoMarcas ? 'Cargando marcas…' : 'Primero crea una marca'} />
            )}
          </Campo>
          <Campo label="Plantilla de contenido">
            <select value={f.plantilla} onChange={set('plantilla')}>
              <option value="">Que MUSA elija</option>
              {lista.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="¿Qué quieres comunicar esta semana?" ancho requerido ayuda="Un tema, una campaña, una fecha o un producto. Entre más concreto, mejor.">
            <textarea required rows="3" value={f.peticion} onChange={set('peticion')} placeholder="Lanzamos tres bebidas de temporada navideña y queremos que la gente venga a probarlas." />
          </Campo>
          <Campo label="Empieza el" requerido>
            <input type="date" required value={f.fecha_inicio} onChange={set('fecha_inicio')} />
          </Campo>
          <Campo label="Número de publicaciones">
            <div className="segmentado" role="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} role="radio" aria-checked={Number(f.cantidad_posts) === n} className={Number(f.cantidad_posts) === n ? 'seg activo' : 'seg'} onClick={() => setF({ ...f, cantidad_posts: n })}>
                  {n}
                </button>
              ))}
            </div>
          </Campo>
        </Grupo>

        {errorMarcas && <AvisoError mensaje="No pude traer las marcas desde Notion." />}

        <div className="plan plan-grande">
          <div className="plan-titulo">
            <Estrella size={18} fill="#FF78B7" stroke="#29243A" />
            ¡Este es el plan!
          </div>
          <dl>
            <div>
              <dt>Marca</dt>
              <dd>{activa?.nombre || '—'}</dd>
            </div>
            <div>
              <dt>Inicio</dt>
              <dd>{formatoFecha(f.fecha_inicio)}</dd>
            </div>
            <div>
              <dt>Publicaciones</dt>
              <dd>{f.cantidad_posts}</dd>
            </div>
            <div>
              <dt>Plantilla</dt>
              <dd>
                {f.plantilla || (f.peticion.trim() ? plantillaFinal : 'MUSA la elige con tu tema')}
                {!f.plantilla && f.peticion.trim() && <span className="muted"> (la eligió MUSA)</span>}
              </dd>
            </div>
            <div className="plan-ancho">
              <dt>Tema</dt>
              <dd>{f.peticion || 'Cuéntale a MUSA qué quieres comunicar'}</dd>
            </div>
          </dl>
          <p className="ayuda">Cada post usa varios agentes de IA. Con el plan gratis de Make, mejor de 1 a 3 posts por prueba.</p>
          {estado.tipo === 'error' && <AvisoError mensaje={estado.mensaje} />}
          <div className="acciones">
            <button className="btn btn-azul" type="submit" disabled={!listo}>
              Sí, crear parrilla
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
