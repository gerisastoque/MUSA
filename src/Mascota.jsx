// Musa, la mascota de MUSA. Una base fija y una capa por expresión.
const INK = '#29243A'
const LAV = '#A78BFA'

function Brazo({ d }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
      <path d={d} fill="none" stroke={LAV} strokeWidth="6" strokeLinecap="round" />
    </>
  )
}

function Ojos({ px = 82, py = 118, r = 6.5 }) {
  return (
    <>
      <ellipse cx="80" cy="116" rx="12" ry="14" fill="#fff" stroke={INK} strokeWidth="3.5" />
      <ellipse cx="120" cy="116" rx="12" ry="14" fill="#fff" stroke={INK} strokeWidth="3.5" />
      <circle cx={px} cy={py} r={r} fill={INK} />
      <circle cx={px + 40} cy={py} r={r} fill={INK} />
      {r > 5 && (
        <>
          <circle cx={px + 2.5} cy={py - 3.5} r="2.2" fill="#fff" />
          <circle cx={px + 42.5} cy={py - 3.5} r="2.2" fill="#fff" />
        </>
      )}
    </>
  )
}

const Chispa = ({ x, y, s = 1, fill, stroke }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -10L2.6 -2.6L10 0L2.6 2.6L0 10L-2.6 2.6L-10 0L-2.6 -2.6Z"
    fill={fill}
    stroke={stroke}
    strokeWidth={stroke ? 1.5 : 0}
  />
)

const CAPAS = {
  hola: (
    <>
      <Ojos />
      <path d="M88 139Q100 157 112 139Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <Brazo d="M164 138C180 128 186 110 180 94" />
      <path d="M186 80L192 72M192 92L201 89" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  investigando: (
    <>
      <Ojos px={86} py={114} />
      <path d="M68 96Q80 90 92 95" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="103" cy="144" r="5" fill={INK} />
      <Brazo d="M164 142C178 140 188 130 191 120" />
      <path d="M183 104L195 118" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <circle cx="172" cy="91" r="17" fill="#EDE7FF" fillOpacity=".7" stroke={INK} strokeWidth="4" />
      <path d="M164 84Q168 79 174 79" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  creando: (
    <>
      <Ojos px={83} py={122} />
      <path d="M67 107H93M107 107H133" stroke={LAV} strokeWidth="7" />
      <path d="M66 104L92 108M108 108L134 104" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M94 143H108" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M108 143Q112 150 116 145" fill="#FF78B7" stroke={INK} strokeWidth="2.5" />
      <Brazo d="M164 142C176 136 182 126 184 116" />
      <g transform="rotate(30 186 100)">
        <rect x="181" y="78" width="10" height="34" rx="2" fill="#FFD66B" stroke={INK} strokeWidth="3" />
        <path d="M181 112L186 123L191 112Z" fill={INK} />
      </g>
      <Chispa x={40} y={62} fill="#5546E8" />
      <Chispa x={162} y={48} s={0.8} fill="#FF78B7" />
      <Chispa x={22} y={98} s={0.6} fill="#C8EB85" stroke={INK} />
    </>
  ),
  celebrando: (
    <>
      <path d="M68 120Q80 106 92 120M108 120Q120 106 132 120" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M86 136Q100 160 114 136Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M94 147Q100 152 106 147" fill="none" stroke="#FF78B7" strokeWidth="4" strokeLinecap="round" />
      <Brazo d="M36 136C20 124 16 106 22 90" />
      <Brazo d="M164 136C180 124 184 106 178 90" />
      <rect x="30" y="40" width="10" height="5" rx="2" fill="#FF78B7" transform="rotate(-25 35 42)" />
      <rect x="160" y="34" width="10" height="5" rx="2" fill="#5546E8" transform="rotate(30 165 36)" />
      <circle cx="56" cy="22" r="4" fill="#C8EB85" stroke={INK} strokeWidth="1.5" />
      <circle cx="146" cy="16" r="4" fill="#FFD66B" stroke={INK} strokeWidth="1.5" />
      <Chispa x={14} y={47} s={0.7} fill="#5546E8" />
      <Chispa x={188} y={37} s={0.7} fill="#C8EB85" stroke={INK} />
    </>
  ),
  confundida: (
    <>
      <Ojos px={77} py={111} r={4.5} />
      <path d="M108 95Q120 87 132 93" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M68 99L92 99" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M88 146Q94 139 100 146T112 146" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <Brazo d="M164 136C178 120 176 100 164 90" />
      <path d="M150 30C150 20 168 18 168 30C168 38 158 38 158 47" fill="none" stroke="#5546E8" strokeWidth="5" strokeLinecap="round" />
      <circle cx="158" cy="57" r="3.5" fill="#5546E8" />
    </>
  ),
}

export default function Mascota({ expresion = 'hola', size = 200, className = '' }) {
  const brazoIzq = expresion !== 'celebrando'
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Musa, ${expresion}`}
    >
      <ellipse cx="80" cy="185" rx="15" ry="7" fill={INK} />
      <ellipse cx="120" cy="185" rx="15" ry="7" fill={INK} />
      <path d="M100 44C148 44 170 84 168 122C166 160 140 182 100 182C60 182 34 160 32 122C30 84 52 44 100 44Z" fill={LAV} stroke={INK} strokeWidth="4" />
      <path d="M56 96C60 78 72 64 88 59" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      <path d="M42 112C42 64 158 64 158 112" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <rect x="25" y="98" width="22" height="36" rx="10" fill="#FF78B7" stroke={INK} strokeWidth="4" />
      <rect x="153" y="98" width="22" height="36" rx="10" fill="#FF78B7" stroke={INK} strokeWidth="4" />
      <path d="M100 6L105.5 20.5L120 26L105.5 31.5L100 46L94.5 31.5L80 26L94.5 20.5Z" fill="#FFD66B" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="64" cy="140" rx="9" ry="5.5" fill="#FF78B7" opacity=".85" />
      <ellipse cx="136" cy="140" rx="9" ry="5.5" fill="#FF78B7" opacity=".85" />
      {brazoIzq && <Brazo d="M38 142C26 148 24 160 32 166" />}
      {CAPAS[expresion] || CAPAS.hola}
    </svg>
  )
}

export function Estrella({ size = 18, fill = '#29243A', stroke }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1L14.6 9.4L23 12L14.6 14.6L12 23L9.4 14.6L1 12L9.4 9.4Z" fill={fill} stroke={stroke} strokeWidth={stroke ? 1.6 : 0} strokeLinejoin="round" />
    </svg>
  )
}
