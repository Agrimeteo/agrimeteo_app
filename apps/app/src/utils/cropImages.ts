const imageModules = import.meta.glob('../../../../image_culture/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const normalizeCropName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const imageMap = Object.entries(imageModules).reduce<Record<string, string>>((acc, [path, source]) => {
  const filename = path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
  acc[normalizeCropName(filename)] = source;
  return acc;
}, {});

const aliases: Record<string, string> = {
  mais: 'mais',
  maïs: 'mais',
  corn: 'mais',
  maize: 'mais',
  ble: 'ble',
  blé: 'ble',
  wheat: 'ble',
  soja: 'soja',
  soy: 'soja',
  soybean: 'soja',
  cacao: 'cacao',
  cocoa: 'cacao',
  cafe: 'cacao', // fallback
  café: 'cacao', // fallback
  banane: 'banane',
  banana: 'banane',
  plantain: 'banane',
  plantain_banana: 'banane',
  tomate: 'tomate',
  tomato: 'tomate',
  tomatoes: 'tomate',
  riz: 'riz',
  rice: 'riz',
  ananas: 'ananas',
  pineapple: 'ananas',
  arachide: 'arachide',
  peanut: 'arachide',
  groundnut: 'arachide',
  avocat: 'avocat',
  avocado: 'avocat',
  ail: 'ail',
  garlic: 'ail',
  carotte: 'carotte',
  carrot: 'carotte',
  choux: 'choux',
  chou: 'choux',
  cabbage: 'choux',
  chou_fleur: 'choux',
  haricot: 'haricot',
  bean: 'haricot',
  beans: 'haricot',
  haricot_vert: 'haricot',
  oignon: 'oignon',
  onion: 'oignon',
  onions: 'oignon',
  papaye: 'papaye',
  papaya: 'papaye',
  papayas: 'papaye',
  pasteque: 'pasteque',
  pastèque: 'pasteque',
  watermelon: 'pasteque',
  pastèques: 'pasteque',
  patate: 'patate',
  sweet_potato: 'patate',
  yam: 'patate',
  'pomme de terre': 'pomme de terre',
  pomme_de_terre: 'pomme de terre',
  potato: 'pomme de terre',
  potatoes: 'pomme de terre',
  white_potato: 'pomme de terre',
  irish_potato: 'pomme de terre',
};

const firstImage = Object.values(imageMap)[0] ?? '';

export const getCropImage = (cropName?: string | null) => {
  if (!cropName) {
    return firstImage;
  }

  const normalizedInput = normalizeCropName(cropName);
  const alias = aliases[normalizedInput] ?? normalizedInput;

  // Direct match
  if (imageMap[alias]) {
    return imageMap[alias];
  }

  // Partial match - look for words that contain or are contained in the alias
  const match = Object.entries(imageMap).find(
    ([key]) => 
      alias.includes(key) || 
      key.includes(alias) ||
      // Check for word boundaries
      key.split(' ').some(word => normalizedInput.includes(word)) ||
      normalizedInput.split(' ').some(word => key.includes(word))
  );
  
  if (match) {
    return match[1];
  }

  // Fallback image
  return firstImage;
};
