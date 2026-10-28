// Major System: turn words into numbers by their consonant *sounds*.
//
// English spelling doesn't map cleanly to sounds, so this is a rule-based
// approximation covering the common cases (silent letters, double letters,
// ph/th/sh/ch/ck/tch/dge, soft c and g, x = ks...). Where a spelling is
// genuinely ambiguous (soft or hard g, "ng"), every reading is kept, and an
// answer counts if any reading matches.

export const DIGIT_SOUND: Record<string, string> = {
  '0': 'S', '1': 'T', '2': 'N', '3': 'M', '4': 'R',
  '5': 'L', '6': 'SH', '7': 'K', '8': 'F', '9': 'P',
};

const SIMPLE: Record<string, string> = {
  b: '9', d: '1', f: '8', j: '6', k: '7', l: '5', m: '3', n: '2',
  p: '9', r: '4', s: '0', t: '1', v: '8', z: '0', q: '7',
};

const SOFT = /[eiy]/;
const MAX_READINGS = 32;

// "-ough"/"-augh" words where the gh sounds like f
const GH_AS_F = new Set(['rough', 'tough', 'enough', 'cough', 'laugh', 'trough', 'slough']);

function decodeWord(raw: string): string[] {
  let w = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return [''];

  // Silent letters at the start or end of a word
  w = w.replace(/^(kn|gn|pn|ps)/, (m) => m.slice(1)); // knee, gnome, pneumonia, psycho
  w = w.replace(/^wr/, 'r'); // write
  w = w.replace(/mb$/, 'm').replace(/mn$/, 'm'); // tomb, autumn
  if (w.startsWith('x')) w = 'z' + w.slice(1); // xylophone

  let readings = [''];
  const emit = (...options: string[]) => {
    const next: string[] = [];
    for (const r of readings) for (const o of options) next.push(r + o);
    readings = [...new Set(next)].slice(0, MAX_READINGS);
  };

  for (let i = 0; i < w.length; ) {
    const c = w[i];
    const rest = w.slice(i);
    const after = (n: number) => w[i + n] ?? '';

    // Letters that are often, but not always, silent: keep both readings
    if (/^st(en$|le)/.test(rest)) { emit('0'); i += 2; continue; } // listen, castle
    if (/^l[km]/.test(rest) && w[i - 1] === 'a') { emit('', '5'); i += 1; continue; } // walk, calm
    if (/^sl/.test(rest) && w[i - 1] === 'i') { emit('', '0'); i += 1; continue; } // island, aisle
    if (i === 0 && /^su[gr]/.test(rest)) { emit('6', '0'); i += 1; continue; } // sugar, sure (vs surf)

    if (rest.startsWith('tch')) { emit('6'); i += 3; continue; } // watch
    if (rest.startsWith('sch')) { emit('07'); i += 3; continue; } // school
    if (/^ch[rl]/.test(rest)) { emit('7'); i += 2; continue; } // chrome, chlorine
    if (/^dg[eiy]/.test(rest)) { emit('6'); i += 2; continue; } // bridge
    if (/^[ts]ion/.test(rest) && i > 0) { emit('6'); i += 1; continue; } // nation, mission
    if (rest.startsWith('cc') && SOFT.test(after(2))) { emit('70'); i += 2; continue; } // accent
    if (rest.startsWith('ph')) { emit('8'); i += 2; continue; }
    if (rest.startsWith('th')) { emit('1'); i += 2; continue; }
    if (rest.startsWith('sh') || rest.startsWith('ch')) { emit('6'); i += 2; continue; }
    if (rest.startsWith('ck')) { emit('7'); i += 2; continue; }
    if (rest.startsWith('qu')) { emit('7'); i += 2; continue; }
    if (rest.startsWith('gh')) {
      if (i === 0) emit('7'); // ghost
      else if (GH_AS_F.has(w)) emit('8'); // laugh
      // otherwise silent: night, though, high
      i += 2;
      continue;
    }
    if (rest.startsWith('ng')) {
      // sing (N), finger (N+K), angel (N+J)
      if (SOFT.test(after(2))) emit('2', '26', '27');
      else emit('2', '27');
      i += 2;
      while (w[i] === 'g') i++;
      continue;
    }
    if (c === 'x') { emit('70'); i += 1; continue; } // box = ks
    if (c === 'c') { emit(SOFT.test(after(1)) ? '0' : '7'); i += 1; while (w[i] === 'c') i++; continue; }
    if (c === 'g') {
      if (SOFT.test(after(1))) emit('6', '7'); // gem vs get
      else emit('7');
      i += 1;
      while (w[i] === 'g') i++;
      continue;
    }
    if (SIMPLE[c]) {
      emit(SIMPLE[c]);
      i += 1;
      while (w[i] === c) i++; // double letters make one sound: butter
      continue;
    }
    // Vowels and w, h, y carry no value
    i += 1;
  }
  return readings;
}

/** Every number a word or phrase could stand for. */
export function decodeMajor(text: string): string[] {
  let readings = [''];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next: string[] = [];
    for (const r of readings) for (const d of decodeWord(word)) next.push(r + d);
    readings = [...new Set(next)].slice(0, MAX_READINGS);
  }
  return readings;
}

export function matchesNumber(text: string, number: string): boolean {
  return decodeMajor(text).includes(number);
}

/** "M · N" for a digit string, for showing how an answer decodes. */
export function soundsFor(digits: string): string {
  return digits.split('').map((d) => DIGIT_SOUND[d]).join(' · ');
}

// One picture word for every number 00-99 (all checked by decodeMajor)
export const MAJOR_WORDS: Record<string, string> = {
  '00': 'sauce', '01': 'suit', '02': 'sun', '03': 'sumo', '04': 'sewer',
  '05': 'seal', '06': 'sash', '07': 'sock', '08': 'sofa', '09': 'soap',
  '10': 'toes', '11': 'tot', '12': 'tin', '13': 'tomb', '14': 'tire',
  '15': 'tail', '16': 'dish', '17': 'duck', '18': 'dove', '19': 'tub',
  '20': 'nose', '21': 'net', '22': 'nun', '23': 'gnome', '24': 'honor',
  '25': 'nail', '26': 'niche', '27': 'neck', '28': 'knife', '29': 'knob',
  '30': 'mouse', '31': 'mat', '32': 'moon', '33': 'mummy', '34': 'mower',
  '35': 'mule', '36': 'match', '37': 'mug', '38': 'movie', '39': 'map',
  '40': 'rose', '41': 'rat', '42': 'rain', '43': 'ram', '44': 'rear',
  '45': 'rail', '46': 'rash', '47': 'rock', '48': 'roof', '49': 'rope',
  '50': 'lace', '51': 'lid', '52': 'lion', '53': 'lime', '54': 'lure',
  '55': 'lily', '56': 'leash', '57': 'lake', '58': 'leaf', '59': 'lip',
  '60': 'cheese', '61': 'sheet', '62': 'chain', '63': 'jam', '64': 'chair',
  '65': 'jail', '66': 'judge', '67': 'chick', '68': 'chef', '69': 'ship',
  '70': 'case', '71': 'cat', '72': 'coin', '73': 'comb', '74': 'car',
  '75': 'coal', '76': 'cash', '77': 'cake', '78': 'cave', '79': 'cab',
  '80': 'face', '81': 'foot', '82': 'fan', '83': 'foam', '84': 'fire',
  '85': 'file', '86': 'fish', '87': 'fig', '88': 'fife', '89': 'vibe',
  '90': 'bus', '91': 'bat', '92': 'bone', '93': 'bomb', '94': 'bear',
  '95': 'bell', '96': 'bush', '97': 'book', '98': 'beef', '99': 'baby',
};

// Single-digit words, to build answers for 3-digit numbers
export const MAJOR_SINGLE: Record<string, string> = {
  '0': 'sea', '1': 'tea', '2': 'knee', '3': 'ma', '4': 'ray',
  '5': 'law', '6': 'shoe', '7': 'key', '8': 'ivy', '9': 'bee',
};

/** A sample answer for any 2- or 3-digit number, e.g. 321 → "moon tea". */
export function exampleFor(number: string): string {
  if (number.length === 2) return MAJOR_WORDS[number];
  if (number.length === 3) return `${MAJOR_WORDS[number.slice(0, 2)]} ${MAJOR_SINGLE[number[2]]}`;
  return '';
}
