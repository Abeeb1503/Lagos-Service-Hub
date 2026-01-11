export const ROLES = ['buyer', 'seller', 'admin']

export const THEMES = ['light', 'dark', 'midnight', 'ocean-breeze', 'warm-night', 'sunset-gold']

export const PASSWORD_POLICY = {
  minLength: 8,
  requiresUpper: true,
  requiresLower: true,
  requiresNumber: true,
  requiresSymbol: true,
}

export const DASHBOARD_ROUTE_BY_ROLE = {
  buyer: '/buyer',
  seller: '/seller',
  admin: '/admin',
}

export const PROFESSIONS = [
  'Fashion Design / Tailoring',
  'Catering / Baking',
  'Graphic Design',
  'Web Development',
  'Electrical Installation / Repairs',
  'Plumbing',
  'Carpentry',
  'Door Making (Specialized)',
  'Furniture Making',
  'Aluminium Fabrication',
  'Painting / Decoration',
  'Welding',
  'POP Design / Tiling',
  'Event Planning / Decoration',
  'Shoe Making / Leather Works',
  'Laundry / Dry Cleaning',
]

export const LAGOS_AREAS = [
  'Agege',
  'Ajeromi-Ifelodun',
  'Alimosho',
  'Amuwo-Odofin',
  'Apapa',
  'Badagry',
  'Epe',
  'Eti-Osa',
  'Ibeju-Lekki',
  'Ifako-Ijaiye',
  'Ikeja',
  'Ikorodu',
  'Kosofe',
  'Lagos Island',
  'Lagos Mainland',
  'Mushin',
  'Ojo',
  'Oshodi-Isolo',
  'Somolu',
  'Surulere',
]

export const PROFESSIONS_OPTIONS = PROFESSIONS.map((p) => ({
  value: p.toLowerCase().replace(/\s+/g, '-'),
  label: p,
}))

export const LAGOS_AREAS_OPTIONS = LAGOS_AREAS.map((a) => ({
  value: a.toLowerCase().replace(/\s+/g, '-'),
  label: a,
}))
