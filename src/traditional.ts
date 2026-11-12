import type { Analysis, Category, Priority } from './contract'

const rules: ReadonlyArray<{ category: Category; terms: readonly string[] }> = [
  { category: 'SECURITY', terms: ['vulnerabilidad', 'hackeo', 'filtración', 'filtracion', 'acceso no autorizado', 'inyección', 'inyeccion', 'datos expuestos', 'sin permiso'] },
  { category: 'ACCESS', terms: ['iniciar sesión', 'iniciar sesion', 'login', 'contraseña', 'contrasena', 'no puedo entrar', 'cuenta bloqueada', 'acceder'] },
  { category: 'BUG', terms: ['error', 'falla', 'fallo', 'no carga', 'se cierra', 'crash', 'bug', 'pantalla en blanco'] },
  { category: 'FEATURE', terms: ['sería útil', 'seria util', 'me gustaría', 'me gustaria', 'agregar', 'añadir', 'anadir', 'nueva función', 'nueva funcion', 'podrían', 'podrian'] },
]

const responses: Record<Category, string> = {
  ACCESS: 'Lamentamos el inconveniente. Verifica tus credenciales y utiliza la recuperación de contraseña si es necesario.',
  BUG: 'Gracias por reportar esta falla. Hemos registrado el problema; comparte los pasos para reproducirlo si puedes.',
  FEATURE: 'Gracias por compartir tu sugerencia. La registraremos para que el equipo evalúe su viabilidad.',
  SECURITY: 'Gracias por alertarnos. El equipo de seguridad debe revisar este incidente; evita compartir datos sensibles aquí.',
}

export function analyzeTraditional(message: string): Analysis {
  const normalized = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
  const category = rules.find((rule) => rule.terms.some((term) => normalized.includes(term.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))))?.category ?? 'BUG'
  const criticalSignals = ['produccion caida', 'todos los usuarios', 'datos expuestos', 'robo de datos', 'servicio completamente caido']
  const urgentSignals = ['urgente', 'bloqueado', 'no puedo trabajar', 'muchos usuarios']
  let priority: Priority = 'MEDIUM'
  if (criticalSignals.some((term) => normalized.includes(term))) priority = 'CRITICAL'
  else if (category === 'SECURITY' || urgentSignals.some((term) => normalized.includes(term))) priority = 'HIGH'
  else if (category === 'FEATURE') priority = 'LOW'

  return {
    category,
    priority,
    response: responses[category],
    requiresHumanReview: category === 'SECURITY',
    mode: 'traditional',
  }
}
