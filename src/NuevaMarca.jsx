import { useState } from 'react'
import { crearProyecto } from './api'
import { leerBrandbook } from './leerArchivo'
import { AvisoError, Campo, Cargando, Encabezado, Grupo, Resultado } from './piezas'

const REDES = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn']

const INICIAL = {
  marca: '',
  sector: '',
  que_vende: '',
  audiencia: '',
  pais: 'Colombia',
  personalidad: '',
  tono: 'tú',
  temas: '',
  palabras_prohibidas: '',
  colores: ['#5546e8', '#ff78b7', '#ffd66b'],
  tipografias: '',
  redes: ['Instagram'],
  estilo_visual: '',
  evitar_imagenes: '',
  referencias: '',
  correo: '',
}

const FRASES = ['Conociendo tu marca…', 'Armando su personalidad…', 'Traduciendo su identidad visual…', '¡Tu brandbook está tomando forma!']

export default function NuevaMarca({ ir, cargarMarcas, elegirMarca, marcas }) {
  const [f, setF] = useState(INICIAL)
  const [modo, setModo] = useState('cero')
  const [bb, setBb] = useState({ nombre: '', texto: '', error: '' })
  const [estado, setEstado] = useState({ tipo: 'idle' })
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

  const toggleRed = (red) => setF({ ...f, redes: f.redes.includes(red) ? f.redes.filter((r) => r !== red) : [...f.redes, red] })
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
      cargarMarcas().then(() => {})
    } catch (err) {
      setEstado({ tipo: 'error', mensaje: err.message })
    }
  }

  if (estado.tipo === 'cargando')
    return (
      <div className="pagina">
        <Cargando titulo={`Conociendo a ${f.marca}`} frases={FRASES} expresion={modo === 'brandbook' ? 'investigando' : 'creando'} />
      </div>
    )

  if (estado.tipo === 'listo') {
    const nombre = estado.r.marca || f.marca
    return (
      <div className="pagina">
        <Resultado
          titulo={`¡${nombre} ya tiene brandbook!`}
          texto="MUSA lo guardó en Notion con el tono, los pilares, los colores y el estilo visual. Revísalo y ajusta lo que quieras: lo que dice ahí es lo que MUSA va a usar."
          acciones={
            <>
              {estado.r.notion && (
                <a className="btn btn-linea" href={estado.r.notion} target="_blank" rel="noreferrer">
                  Ver brandbook en Notion ↗
                </a>
              )}
              <button
                className="btn btn-azul"
                onClick={() => {
                  const nueva = marcas.find((m) => m.nombre.toLowerCase() === nombre.toLowerCase())
                  if (nueva) elegirMarca(nueva.id)
                  ir('chat', `Quiero la primera parrilla de ${nombre}`)
                }}
              >
                Crear su primera parrilla
              </button>
            </>
          }
        />
      </div>
    )
  }

  return (
    <div className="pagina">
      <form className="formulario" onSubmit={enviar}>
        <Encabezado etiqueta="PASO 1" titulo="Conozcamos tu marca" texto="Con esto MUSA arma el brandbook. Si no sabes algo, déjalo vacío: MUSA te propone una opción y la marca como sugerida." />

        <div className="modos" role="radiogroup" aria-label="¿La marca ya tiene brandbook?">
          <button type="button" role="radio" aria-checked={modo === 'cero'} className={modo === 'cero' ? 'modo activo' : 'modo'} onClick={() => setModo('cero')}>
            <strong>Empezar de cero</strong>
            <span>Respondes unas preguntas y MUSA arma el brandbook.</span>
          </button>
          <button type="button" role="radio" aria-checked={modo === 'brandbook'} className={modo === 'brandbook' ? 'modo activo' : 'modo'} onClick={() => setModo('brandbook')}>
            <strong>Ya tengo brandbook</strong>
            <span>Lo subes y MUSA lo pasa a Notion respetando lo que ya está definido.</span>
          </button>
        </div>

        {modo === 'brandbook' ? (
          <Grupo titulo="Tu brandbook">
            <Campo label="Nombre de la marca" requerido>
              <input required value={f.marca} onChange={set('marca')} placeholder="Café Aurora" />
            </Campo>
            <Campo label="Correo de la persona responsable" ayuda="Recibe las invitaciones del calendario.">
              <input type="email" value={f.correo} onChange={set('correo')} placeholder="responsable@marca.com" />
            </Campo>
            <Campo label="Archivo (PDF, TXT o MD)" ancho ayuda="MUSA lee el texto del archivo. Si tu PDF es una imagen escaneada, pega el texto abajo.">
              <label className="subir">
                <input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" onChange={alSubir} />
                <span>{bb.nombre ? `✓ ${bb.nombre} · ${bb.texto.length.toLocaleString('es-CO')} caracteres leídos` : 'Elige o arrastra tu brandbook aquí'}</span>
              </label>
              {bb.error && <span className="texto-error">{bb.error}</span>}
            </Campo>
            <Campo label="…o pega el texto del brandbook" ancho>
              <textarea rows="6" value={bb.texto} onChange={(e) => setBb({ ...bb, texto: e.target.value })} placeholder="Misión, tono de voz, colores, tipografías, lo que la marca dice y no dice…" />
            </Campo>
          </Grupo>
        ) : (
          <>
            <Grupo titulo="La marca">
              <Campo label="Nombre de la marca" requerido>
                <input required value={f.marca} onChange={set('marca')} placeholder="Café Aurora" />
              </Campo>
              <Campo label="Sector">
                <input value={f.sector} onChange={set('sector')} placeholder="Café de especialidad" />
              </Campo>
              <Campo label="¿Qué ofrece?" ancho>
                <textarea rows="3" value={f.que_vende} onChange={set('que_vende')} placeholder="Una cafetería en Cali que tuesta su propio café de fincas del Valle…" />
              </Campo>
              <Campo label="¿A quién le habla?" ancho>
                <textarea rows="2" value={f.audiencia} onChange={set('audiencia')} placeholder="Estudiantes y jóvenes profesionales de 20 a 35 años que trabajan desde cafés…" />
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
                <textarea rows="2" value={f.temas} onChange={set('temas')} placeholder="El origen del café, recetas en casa, la comunidad del local, lanzamientos…" />
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
              <Campo label="Correo de la persona responsable" ayuda="Recibe la invitación de Google Calendar cada vez que se agende un post." ancho>
                <input type="email" value={f.correo} onChange={set('correo')} placeholder="responsable@marca.com" />
              </Campo>
            </Grupo>
          </>
        )}

        {estado.tipo === 'error' && <AvisoError mensaje={estado.mensaje} />}

        <div className="form-fin">
          <p className="ayuda">MUSA tarda alrededor de un minuto. Usa créditos de Make, así que lo hacemos una vez por marca.</p>
          <button className="btn btn-azul" type="submit" disabled={!f.marca.trim() || (modo === 'brandbook' && !bb.texto.trim())}>
            {modo === 'brandbook' ? 'Importar brandbook' : 'Crear brandbook'}
          </button>
        </div>
      </form>
    </div>
  )
}
