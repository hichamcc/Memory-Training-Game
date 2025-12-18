import { Tactic } from '@/types';

export const tactics: Tactic[] = [
  {
    id: 'linking-method',
    name: 'Linking Method',
    shortDescription: 'Create clear, absurd connections between items in sequence',
    fullDescription: 'The Linking Method, also known as the Story Method, involves creating memorable connections between items you want to remember by forming a clear, often absurd story. The more unusual and exaggerated the connections, the more memorable they become.',
    difficulty: 'Beginner',
    bestFor: 'Unordered lists, random words, shopping lists',
    steps: [
      'Look at the first two items you need to remember',
      'Create a clear, exaggerated mental image connecting them',
      'Make the connection unusual or absurd for better retention',
      'Link the second item to the third item using the same technique',
      'Continue linking each item to the next in a chain',
      'Review the story from start to finish'
    ],
    examples: [
      'Apple, Car, Cloud: "A giant apple drives a car into a fluffy cloud"',
      'Book, Coffee, Phone: "A book spills coffee all over a ringing phone"',
      'Tree, Piano, Ocean: "A tree grows out of a piano floating in the ocean"'
    ],
    tips: [
      'Make your images exaggerated and unusual',
      'Engage multiple senses (sight, sound, smell, touch)',
      'Use action and movement in your mental images',
      'The more absurd, the more memorable'
    ],
    icon: '🔗'
  },
  {
    id: 'memory-palace',
    name: 'Method of Loci',
    shortDescription: 'Associate items with specific locations in a familiar place',
    fullDescription: 'The Method of Loci, or Memory Palace technique, involves associating items you want to remember with specific locations in a familiar place, like your home. As you mentally walk through the location, you encounter each item in order.',
    difficulty: 'Intermediate',
    bestFor: 'Ordered lists, speeches, long sequences',
    steps: [
      'Choose a familiar location (your home, a route you know well)',
      'Identify specific locations or stations along a path',
      'Create clear mental images of items at each location',
      'Mentally walk through your palace, placing each item',
      'To recall, mentally walk through the palace again',
      'Visualize each item at its designated location'
    ],
    examples: [
      'Front door: visualize milk pouring through the mail slot',
      'Living room couch: see eggs cracked all over the cushions',
      'Kitchen table: imagine bread loaves stacked like a pyramid'
    ],
    tips: [
      'Use a location you know extremely well',
      'Always walk the same path through your palace',
      'Make the images interact with the location',
      'The more rooms/locations, the more you can remember'
    ],
    icon: '🏛️'
  },
  {
    id: 'peg-system',
    name: 'Peg System',
    shortDescription: 'Use pre-memorized rhyming pegs to anchor new information',
    fullDescription: 'The Peg System uses pre-memorized words that rhyme with numbers (1=bun, 2=shoe, 3=tree, etc.) as mental "pegs" to hang new information on. Once you know the pegs, you can quickly memorize lists by associating each item with its corresponding peg.',
    difficulty: 'Beginner',
    bestFor: 'Short lists with specific positions, numbered items',
    steps: [
      'First, memorize the rhyming pegs: 1=bun, 2=shoe, 3=tree, 4=door, 5=hive, 6=sticks, 7=heaven, 8=gate, 9=wine, 10=hen',
      'For each item to remember, create a clear image with the corresponding peg',
      'Make the interaction between the peg and item memorable',
      'To recall item #3, think of "tree" and see what\'s on it',
      'The peg system lets you recall items in any order'
    ],
    examples: [
      'Item 1 (milk): Imagine milk being poured all over a hamburger bun',
      'Item 2 (keys): Visualize keys jingling inside a shoe',
      'Item 3 (phone): See a phone hanging from a tree branch'
    ],
    tips: [
      'Learn the basic pegs thoroughly first',
      'Make your associations action-oriented',
      'You can extend beyond 10 with more rhymes',
      'Great for remembering things in specific positions'
    ],
    icon: '📌'
  },
  {
    id: 'chunking',
    name: 'Chunking',
    shortDescription: 'Group information into larger meaningful units',
    fullDescription: 'Chunking involves breaking down large amounts of information into smaller, manageable groups or "chunks" that are easier to remember. Our brains can typically hold 7±2 chunks of information in working memory.',
    difficulty: 'Beginner',
    bestFor: 'Phone numbers, long sequences, text, numbers',
    steps: [
      'Identify patterns or natural groupings in the information',
      'Break the information into chunks of 3-4 items',
      'Look for meaningful connections within each chunk',
      'Create associations or meanings for each chunk',
      'Remember the chunks rather than individual items'
    ],
    examples: [
      'Phone number 5551234567 → 555-123-4567 (three chunks)',
      'Number sequence 149217761945 → 1492 (Columbus) 1776 (Independence) 1945 (WWII)',
      'Letters FBICIANYPD → FBI CIA NYPD (three organizations)'
    ],
    tips: [
      'Look for familiar patterns (dates, acronyms)',
      'Group by meaning, not just arbitrary divisions',
      'Use existing knowledge to create meaningful chunks',
      'Ideal chunk size is 3-4 items'
    ],
    icon: '🧩'
  },
  {
    id: 'major-system',
    name: 'Major System',
    shortDescription: 'Convert numbers to consonant sounds, then to memorable words',
    fullDescription: 'The Major System is a phonetic number encoding system where digits are converted to consonant sounds, which are then formed into words. This transforms abstract numbers into concrete, memorable images.',
    difficulty: 'Advanced',
    bestFor: 'Long numbers, dates, phone numbers, mathematical constants',
    steps: [
      'Learn the digit-to-sound conversions: 0=s/z, 1=t/d, 2=n, 3=m, 4=r, 5=l, 6=sh/ch, 7=k/g, 8=f/v, 9=p/b',
      'Convert each digit to its corresponding consonant sound',
      'Add vowels to create actual words',
      'Create a clear mental image of the word',
      'To recall, visualize the image and decode back to numbers'
    ],
    examples: [
      '32 = MN → "moon", "man", "mine"',
      '45 = RL → "roll", "rail", "royal"',
      '321 = MNT → "mint", "mount"',
      'Date 1776 = TKKS → "tactics"'
    ],
    tips: [
      'Practice the number-to-sound conversions until automatic',
      'Vowels don\'t matter, only consonants',
      'Choose the most visual, memorable words',
      'Combine with Memory Palace for long number sequences'
    ],
    icon: '🔢'
  },
  {
    id: 'pao-system',
    name: 'PAO System',
    shortDescription: 'Convert numbers to images of People, Actions, and Objects',
    fullDescription: 'The PAO (Person-Action-Object) System assigns each two-digit number (00-99) a unique person, action, and object. For longer numbers, you combine different elements to create memorable scenes.',
    difficulty: 'Advanced',
    bestFor: 'Long number sequences, card memorization, competition',
    steps: [
      'Create a list of 100 people (00-99), one for each number',
      'Assign each person a characteristic action',
      'Assign each person a characteristic object',
      'For 6-digit numbers, combine: Person from first pair doing Action from second pair with Object from third pair',
      'Visualize the complete scene clearly'
    ],
    examples: [
      '12 = Albert Einstein (person)',
      '34 = Juggling (action)',
      '56 = Bananas (object)',
      '123456 = "Einstein juggling bananas"',
      '00 = Your hero, 01 = A celebrity, 02 = A friend, etc.'
    ],
    tips: [
      'Choose people you know well or famous figures',
      'Make actions distinctive and visual',
      'Objects should be concrete and easy to visualize',
      'Building your full system takes time but is very powerful'
    ],
    icon: '👤'
  },
  {
    id: 'face-name',
    name: 'Face-Name Association',
    shortDescription: 'Link facial features to names with clear imagery',
    fullDescription: 'Face-Name Association involves carefully observing distinctive facial features and creating strong visual associations between those features and the person\'s name. This technique is essential for remembering people you meet.',
    difficulty: 'Intermediate',
    bestFor: 'Remembering names at events, networking, social situations',
    steps: [
      'Look carefully at the person\'s face when introduced',
      'Identify one or two distinctive features (eyes, nose, smile, hair)',
      'Convert their name into a visual image or wordplay',
      'Create a clear mental image connecting the facial feature to the name',
      'Review the association immediately after meeting them',
      'Practice recalling the name when you see them again'
    ],
    examples: [
      'Rose with rosy cheeks: Imagine roses growing from her cheeks',
      'Bill with a prominent forehead: Visualize a dollar bill on his forehead',
      'Mike with a strong voice: Picture him holding a microphone to his mouth',
      'Lily with delicate features: See lily flowers around her face'
    ],
    tips: [
      'Really focus when being introduced',
      'Use the name immediately in conversation',
      'Be creative with name conversions',
      'Exaggerate the distinctive feature in your mind'
    ],
    icon: '👥'
  },
  {
    id: 'dominic-system',
    name: 'Dominic System',
    shortDescription: 'Use initials to convert numbers to people and actions',
    fullDescription: 'The Dominic System, created by memory champion Dominic O\'Brien, converts numbers to letters based on their shape (1=A, 2=B, etc.), then uses those letters as initials for people. Each person has a characteristic action, allowing you to encode long numbers efficiently.',
    difficulty: 'Advanced',
    bestFor: 'Card decks, numbers, memory competitions',
    steps: [
      'Learn the number-to-letter conversion: 0=O, 1=A, 2=B, 3=C, 4=D, 5=E, 6=S, 7=G, 8=H, 9=N',
      'For each two-digit number, convert to two letters (initials)',
      'Assign a person with those initials (52=EB=Emmanuel Bannon, or Elvis Presley)',
      'Give each person a characteristic action',
      'For four digits, first person does second person\'s action',
      'Create a clear scene of the interaction'
    ],
    examples: [
      '52 = EB = Elvis Presley (pelvis thrusting)',
      '19 = AN = Albert Newton (writing equations)',
      '5219 = Elvis Presley writing equations',
      '00 = OO = Barack Obama, 11 = AA = Audrey Hepburn, etc.'
    ],
    tips: [
      'Use well-known people for easier recall',
      'Actions should be characteristic and visual',
      'Practice with dates and historical events',
      'Combine with Memory Palace for very long sequences'
    ],
    icon: '🎭'
  }
];

export function getTacticById(id: string): Tactic | undefined {
  return tactics.find(t => t.id === id);
}

export function getTacticsByDifficulty(difficulty: string): Tactic[] {
  return tactics.filter(t => t.difficulty === difficulty);
}
