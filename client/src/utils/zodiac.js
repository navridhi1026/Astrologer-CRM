// Zodiac sign data with symbols, emojis, elements, gemstones, and colors
export const ZODIAC_SIGNS = [
  {
    name: 'Aries',
    symbol: '♈',
    emoji: '🐏',
    element: 'Fire',
    dateRange: 'Mar 21 – Apr 19',
    gemstone: 'Diamond',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    traits: ['Bold', 'Ambitious', 'Confident'],
    rulingPlanet: 'Mars',
  },
  {
    name: 'Taurus',
    symbol: '♉',
    emoji: '🐂',
    element: 'Earth',
    dateRange: 'Apr 20 – May 20',
    gemstone: 'Emerald',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    traits: ['Patient', 'Reliable', 'Devoted'],
    rulingPlanet: 'Venus',
  },
  {
    name: 'Gemini',
    symbol: '♊',
    emoji: '👯',
    element: 'Air',
    dateRange: 'May 21 – Jun 20',
    gemstone: 'Pearl',
    color: '#eab308',
    gradient: 'linear-gradient(135deg, #eab308, #ca8a04)',
    traits: ['Adaptable', 'Curious', 'Witty'],
    rulingPlanet: 'Mercury',
  },
  {
    name: 'Cancer',
    symbol: '♋',
    emoji: '🦀',
    element: 'Water',
    dateRange: 'Jun 21 – Jul 22',
    gemstone: 'Ruby',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    traits: ['Intuitive', 'Emotional', 'Nurturing'],
    rulingPlanet: 'Moon',
  },
  {
    name: 'Leo',
    symbol: '♌',
    emoji: '🦁',
    element: 'Fire',
    dateRange: 'Jul 23 – Aug 22',
    gemstone: 'Peridot',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    traits: ['Creative', 'Passionate', 'Generous'],
    rulingPlanet: 'Sun',
  },
  {
    name: 'Virgo',
    symbol: '♍',
    emoji: '👩',
    element: 'Earth',
    dateRange: 'Aug 23 – Sep 22',
    gemstone: 'Sapphire',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    traits: ['Analytical', 'Practical', 'Diligent'],
    rulingPlanet: 'Mercury',
  },
  {
    name: 'Libra',
    symbol: '♎',
    emoji: '⚖️',
    element: 'Air',
    dateRange: 'Sep 23 – Oct 22',
    gemstone: 'Opal',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    traits: ['Diplomatic', 'Fair', 'Social'],
    rulingPlanet: 'Venus',
  },
  {
    name: 'Scorpio',
    symbol: '♏',
    emoji: '🦂',
    element: 'Water',
    dateRange: 'Oct 23 – Nov 21',
    gemstone: 'Topaz',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #991b1b)',
    traits: ['Brave', 'Loyal', 'Determined'],
    rulingPlanet: 'Pluto',
  },
  {
    name: 'Sagittarius',
    symbol: '♐',
    emoji: '🏹',
    element: 'Fire',
    dateRange: 'Nov 22 – Dec 21',
    gemstone: 'Turquoise',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    traits: ['Optimistic', 'Free-spirited', 'Adventurous'],
    rulingPlanet: 'Jupiter',
  },
  {
    name: 'Capricorn',
    symbol: '♑',
    emoji: '🐐',
    element: 'Earth',
    dateRange: 'Dec 22 – Jan 19',
    gemstone: 'Garnet',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
    traits: ['Disciplined', 'Responsible', 'Ambitious'],
    rulingPlanet: 'Saturn',
  },
  {
    name: 'Aquarius',
    symbol: '♒',
    emoji: '🏺',
    element: 'Air',
    dateRange: 'Jan 20 – Feb 18',
    gemstone: 'Amethyst',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    traits: ['Progressive', 'Original', 'Independent'],
    rulingPlanet: 'Uranus',
  },
  {
    name: 'Pisces',
    symbol: '♓',
    emoji: '🐟',
    element: 'Water',
    dateRange: 'Feb 19 – Mar 20',
    gemstone: 'Aquamarine',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6, #0f766e)',
    traits: ['Compassionate', 'Artistic', 'Intuitive'],
    rulingPlanet: 'Neptune',
  },
];

export const getZodiacByName = (name) => ZODIAC_SIGNS.find((z) => z.name === name);

export const getZodiacFromDOB = (dob) => {
  if (!dob) return null;
  const date = new Date(dob);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

export const ELEMENTS = {
  Fire: { color: '#ef4444', icon: '🔥' },
  Earth: { color: '#22c55e', icon: '🌍' },
  Air: { color: '#eab308', icon: '💨' },
  Water: { color: '#3b82f6', icon: '💧' },
};
