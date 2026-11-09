// Lee un brandbook (PDF, TXT o MD) en el navegador y devuelve su texto.
// El PDF se lee con pdf.js solo cuando hace falta, para no cargar la página de entrada.

const LIMITE = 20000 // caracteres que se envían a MUSA

export async function leerBrandbook(archivo) {
  let texto = ''
  if (archivo.type === 'application/pdf' || archivo.name.toLowerCase().endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    const pdf = await pdfjs.getDocument({ data: await archivo.arrayBuffer() }).promise
    for (let i = 1; i <= pdf.numPages; i++) {
      const pagina = await pdf.getPage(i)
      const contenido = await pagina.getTextContent()
      texto += contenido.items.map((it) => it.str).join(' ') + '\n'
    }
  } else {
    texto = await archivo.text()
  }
  texto = texto.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  if (!texto) throw new Error('No encontré texto en el archivo. Si el PDF es una imagen escaneada, pega el texto.')
  return { nombre: archivo.name, texto: texto.slice(0, LIMITE), recortado: texto.length > LIMITE }
}
