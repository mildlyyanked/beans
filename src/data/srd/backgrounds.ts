import type { Background } from '@/types/ruleset';

/**
 * Backgrounds. The Acolyte is drawn from the SRD 5.1 (CC-BY-4.0); the
 * remaining backgrounds are original text using generic names.
 */
export const backgrounds: Background[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description:
      'You have spent your life in the service of a temple to a specific god or pantheon of gods. You act as an intermediary between the realm of the holy and the mortal world, performing sacred rites and offering sacrifices in order to conduct worshipers into the presence of the divine. You are not necessarily a cleric; performing sacred rites is not the same thing as channeling divine power.',
    skillProficiencies: ['insight', 'religion'],
    toolProficiencies: [],
    languages: 2,
    equipment: [
      'A holy symbol (a gift to you when you entered the priesthood)',
      'A prayer book or prayer wheel',
      '5 sticks of incense',
      'Vestments',
      'A set of common clothes',
      'A pouch containing 15 gp',
    ],
    startingItems: [
      { itemId: 'holy-symbol', qty: 1 },
      { itemId: 'prayer-book', qty: 1 },
      { itemId: 'incense', qty: 5 },
      { itemId: 'vestments', qty: 1 },
      { itemId: 'common-clothes', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 15,
    feature: {
      name: 'Shelter of the Faithful',
      description:
        'As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity. You and your adventuring companions can expect to receive free healing and care at a temple, shrine, or other established presence of your faith, though you must provide any material components needed for spells. Those who share your religion will support you (but only you) at a modest lifestyle. You might also have ties to a specific temple dedicated to your chosen deity or pantheon, and you have a residence there. This could be the temple where you used to serve, if you remain on good terms with it, or a temple where you have found a new home. While near your temple, you can call upon the priests for assistance, provided the assistance you ask for is not hazardous and you remain in good standing with your temple.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I idolize a particular hero of my faith and constantly refer to that person\'s deeds and example.',
        'I can find common ground between the fiercest enemies, empathizing with them and always working toward peace.',
        'I see omens in every event and action. The gods try to speak to us; we just need to listen.',
        'Nothing can shake my optimistic attitude.',
      ],
      ideals: [
        'Tradition. The ancient traditions of worship and sacrifice must be preserved and upheld.',
        'Charity. I always try to help those in need, no matter what the personal cost.',
        'Faith. I trust that my deity will guide my actions. I have faith that if I work hard, things will go well.',
      ],
      bonds: [
        'I would die to recover an ancient relic of my faith that was lost long ago.',
        'I owe my life to the priest who took me in when my parents died.',
        'Everything I do is for the common people.',
      ],
      flaws: [
        'I judge others harshly, and myself even more severely.',
        'I put too much trust in those who wield power within my temple\'s hierarchy.',
        'My piety sometimes leads me to blindly trust those that profess faith in my god.',
      ],
    },
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description:
      'War shaped you long before adventure found you. You marched under a banner, drilled until your hands knew a weapon better than a spoon, and learned that the person beside you in the line matters more than any cause the generals invoke. Whether you left the ranks honorably, deserted, or simply outlived your company, the discipline stayed with you.',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['One type of gaming set', 'Vehicles (land)'],
    languages: 0,
    equipment: [
      'An insignia of rank',
      'A trophy taken from a fallen enemy (a dagger, broken blade, or piece of a banner)',
      'A set of bone dice or deck of cards',
      'A set of common clothes',
      'A pouch containing 10 gp',
    ],
    startingItems: [
      { itemId: 'insignia-of-rank', qty: 1 },
      { itemId: 'trophy', qty: 1 },
      { itemId: 'dice-set', qty: 1 },
      { itemId: 'common-clothes', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 10,
    feature: {
      name: 'Military Rank',
      description:
        'You still hold a rank from your days of service, and soldiers loyal to your former organization recognize its authority. You can invoke that rank to influence lower-ranking soldiers, requisition simple equipment or horses for temporary use, and gain entry to friendly military encampments and fortresses where your rank is recognized.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I am always polite and respectful, even to those who have not earned it.',
        'I face problems head-on. A simple, direct solution is the best path to success.',
        'I can stare down a hell hound without flinching.',
        'I have a crude sense of humor that got me through the worst nights on campaign.',
      ],
      ideals: [
        'Greater Good. Our lot is to lay down our lives in defense of others.',
        'Responsibility. I do what I must and obey just authority.',
        'Live and Let Live. Ideals are not worth killing over or going to war for.',
      ],
      bonds: [
        'I would still lay down my life for the people I served with.',
        'Someone saved my life on the battlefield. To this day, I will never leave a friend behind.',
        'I fight for those who cannot fight for themselves.',
      ],
      flaws: [
        'The monstrous enemy we faced in battle still leaves me quivering with fear.',
        'I have little respect for anyone who is not a proven warrior.',
        'I obey the law, even if the law causes misery.',
      ],
    },
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description:
      'You have a long history of breaking the law and a longer list of people who would like a word with you about it. You know how a lock thinks, how a mark walks, and which alley to duck into when the watch comes calling. The underworld remembers your name, for better or worse.',
    skillProficiencies: ['deception', 'stealth'],
    toolProficiencies: ['One type of gaming set', 'Thieves\' tools'],
    languages: 0,
    equipment: [
      'A crowbar',
      'A set of dark common clothes including a hood',
      'A pouch containing 15 gp',
    ],
    startingItems: [
      { itemId: 'crowbar', qty: 1 },
      { itemId: 'common-clothes', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 15,
    feature: {
      name: 'Criminal Contact',
      description:
        'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals. You know how to get messages to and from your contact, even over great distances; specifically, you know the local messengers, corrupt caravan masters, and seedy sailors who can deliver messages for you.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I always have a plan for what to do when things go wrong.',
        'I am always calm, no matter what the situation. I never raise my voice or let my emotions control me.',
        'The first thing I do in a new place is note the locations of everything valuable, or where such things could be hidden.',
        'I would rather make a new friend than a new enemy.',
      ],
      ideals: [
        'Honor. I do not steal from others in the trade.',
        'Freedom. Chains are meant to be broken, as are those who would forge them.',
        'Redemption. There is a spark of good in everyone.',
      ],
      bonds: [
        'I am trying to pay off an old debt I owe to a generous benefactor.',
        'My ill-gotten gains go to support my family.',
        'Something important was taken from me, and I aim to steal it back.',
      ],
      flaws: [
        'When I see something valuable, I cannot think about anything but how to steal it.',
        'When faced with a choice between money and my friends, I usually choose the money.',
        'I have a tell that reveals when I am lying.',
      ],
    },
  },
  {
    id: 'folk-hero',
    name: 'Folk Hero',
    description:
      'You come from humble stock, but the common folk already tell stories about you. Perhaps you stood up to a cruel landlord, dragged children from a burning barn, or drove off the beast that had been taking the sheep. Whatever the deed, it set you on a road that leads far from the fields you once tilled.',
    skillProficiencies: ['animal-handling', 'survival'],
    toolProficiencies: ['One type of artisan\'s tools', 'Vehicles (land)'],
    languages: 0,
    equipment: [
      'A set of artisan\'s tools (one of your choice)',
      'A shovel',
      'An iron pot',
      'A set of common clothes',
      'A pouch containing 10 gp',
    ],
    startingItems: [
      { itemId: 'artisans-tools', qty: 1 },
      { itemId: 'shovel', qty: 1 },
      { itemId: 'iron-pot', qty: 1 },
      { itemId: 'common-clothes', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 10,
    feature: {
      name: 'Rustic Hospitality',
      description:
        'Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among other commoners, unless you have shown yourself to be a danger to them. They will shield you from the law or anyone else searching for you, though they will not risk their lives for you.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I judge people by their actions, not their words.',
        'If someone is in trouble, I am always ready to lend help.',
        'I have a strong sense of fair play and always try to find the most equitable solution to arguments.',
        'I misuse long words in an attempt to sound smarter.',
      ],
      ideals: [
        'Respect. People deserve to be treated with dignity and respect.',
        'Fairness. No one should get preferential treatment before the law, and no one is above it.',
        'Sincerity. There is no good in pretending to be something I am not.',
      ],
      bonds: [
        'I have a family, but I have no idea where they are. One day I hope to see them again.',
        'I worked the land, I love the land, and I will protect the land.',
        'I protect those who cannot protect themselves.',
      ],
      flaws: [
        'The tyrant who rules my land will stop at nothing to see me killed.',
        'I have trouble trusting in my allies.',
        'I am convinced of the significance of my destiny, and blind to my shortcomings and the risk of failure.',
      ],
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    description:
      'You spent your formative years among books, scrolls, and the dusty argument of scholars. You have read more than most people will ever hear of, and you know that knowledge is a door which, once opened, cannot be closed again. Now you carry that hunger for answers out into a world that is far less tidy than a library.',
    skillProficiencies: ['arcana', 'history'],
    toolProficiencies: [],
    languages: 2,
    equipment: [
      'A bottle of black ink',
      'A quill',
      'A small knife',
      'A letter from a dead colleague posing a question you have not yet been able to answer',
      'A set of common clothes',
      'A pouch containing 10 gp',
    ],
    startingItems: [
      { itemId: 'ink', qty: 1 },
      { itemId: 'ink-pen', qty: 1 },
      { itemId: 'small-knife', qty: 1 },
      { itemId: 'letter', qty: 1 },
      { itemId: 'common-clothes', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 10,
    feature: {
      name: 'Researcher',
      description:
        'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it. Usually, this information comes from a library, scriptorium, university, or a sage or other learned person or creature. Unearthing the deepest secrets of the multiverse can require an adventure or even a whole campaign.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I use polysyllabic words that convey the impression of great erudition.',
        'I have read every book in the world\'s greatest libraries, or I like to boast that I have.',
        'There is nothing I like more than a good mystery.',
        'I am horribly, horribly awkward in social situations.',
      ],
      ideals: [
        'Knowledge. The path to power and self-improvement is through knowledge.',
        'Beauty. What is beautiful points us beyond itself toward what is true.',
        'No Limits. Nothing should fetter the infinite possibility inherent in all existence.',
      ],
      bonds: [
        'It is my duty to protect my students.',
        'I have an ancient text that holds terrible secrets that must not fall into the wrong hands.',
        'My life\'s work is a series of tomes related to a specific field of lore.',
      ],
      flaws: [
        'I am easily distracted by the promise of information.',
        'Most people scream and run when they see a demon. I stop and take notes on its anatomy.',
        'I speak without really thinking through my words, invariably insulting others.',
      ],
    },
  },
  {
    id: 'noble',
    name: 'Noble',
    description:
      'You were raised in a house whose name means something, with tutors, servants, and the quiet weight of expectation. You understand titles, precedence, and the thousand small courtesies that govern the powerful. Whether your family is rich or merely well-remembered, doors open for you that stay shut for others.',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiencies: ['One type of gaming set'],
    languages: 1,
    equipment: [
      'A set of fine clothes',
      'A signet ring',
      'A scroll of pedigree',
      'A purse containing 25 gp',
    ],
    startingItems: [
      { itemId: 'fine-clothes', qty: 1 },
      { itemId: 'signet-ring', qty: 1 },
      { itemId: 'scroll-of-pedigree', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 25,
    feature: {
      name: 'Position of Privilege',
      description:
        'Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are. The common folk make every effort to accommodate you and avoid your displeasure, and other people of high birth treat you as a member of the same social sphere. You can secure an audience with a local noble if you need to.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'My eloquent flattery makes everyone I talk to feel like the most wonderful and important person in the world.',
        'The common folk love me for my kindness and generosity.',
        'Despite my noble birth, I do not place myself above other folk. We all have the same blood.',
        'No one could doubt by looking at my regal bearing that I am a cut above the unwashed masses.',
      ],
      ideals: [
        'Noble Obligation. It is my duty to protect and care for the people beneath me.',
        'Family. Blood runs thicker than water.',
        'Independence. I must prove that I can handle myself without the coddling of my family.',
      ],
      bonds: [
        'I will face any challenge to win the approval of my family.',
        'My house\'s alliance with another noble family must be sustained at all costs.',
        'Nothing is more important than the other members of my family.',
      ],
      flaws: [
        'I secretly believe that everyone is beneath me.',
        'I hide a truly scandalous secret that could ruin my family forever.',
        'I have an insatiable desire for carnal pleasures.',
      ],
    },
  },
  {
    id: 'outlander',
    name: 'Outlander',
    description:
      'You grew up far from the walls and cobblestones of civilization, in a place where the weather could kill you and the land gave nothing away for free. You can read a sky, track a stag, and sleep soundly with a stone for a pillow. Cities strike you as loud, crowded, and oddly fragile.',
    skillProficiencies: ['athletics', 'survival'],
    toolProficiencies: ['One type of musical instrument'],
    languages: 1,
    equipment: [
      'A staff',
      'A hunting trap',
      'A trophy from an animal you killed',
      'A set of traveler\'s clothes',
      'A pouch containing 10 gp',
    ],
    startingItems: [
      { itemId: 'quarterstaff', qty: 1 },
      { itemId: 'hunting-trap', qty: 1 },
      { itemId: 'trophy', qty: 1 },
      { itemId: 'travelers-clothes', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 10,
    feature: {
      name: 'Wanderer',
      description:
        'You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you. In addition, you can find food and fresh water for yourself and up to five other people each day, provided that the land offers berries, small game, water, and so forth.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I am driven by a wanderlust that led me away from home.',
        'I watch over my friends as if they were a litter of newborn pups.',
        'I once ran twenty-five miles without stopping to warn my clan of an approaching horde. I would do it again if I had to.',
        'I feel far more comfortable around animals than people.',
      ],
      ideals: [
        'Change. Life is like the seasons, in constant change, and we must change with it.',
        'Nature. The natural world is more important than all the constructs of civilization.',
        'Honor. If I dishonor myself, I dishonor my whole clan.',
      ],
      bonds: [
        'My family, clan, or tribe is the most important thing in my life, even when they are far from me.',
        'An injury to the unspoiled wilderness of my home is an injury to me.',
        'I am the last of my tribe, and it is up to me to ensure their names enter legend.',
      ],
      flaws: [
        'I am too enamored of ale, wine, and other intoxicants.',
        'There is no room for caution in a life lived to the fullest.',
        'I remember every insult I have received and nurse a silent resentment toward anyone who has ever wronged me.',
      ],
    },
  },
  {
    id: 'urchin',
    name: 'Urchin',
    description:
      'You grew up on the streets, alone and small in a city that did not care whether you lived or died. You learned to steal a meal, dodge a blow, and find warmth in the gaps the wealthy never see. Nobody handed you anything, and you have never forgotten it.',
    skillProficiencies: ['sleight-of-hand', 'stealth'],
    toolProficiencies: ['Disguise kit', 'Thieves\' tools'],
    languages: 0,
    equipment: [
      'A small knife',
      'A map of the city you grew up in',
      'A pet mouse',
      'A token to remember your parents by',
      'A set of common clothes',
      'A pouch containing 10 gp',
    ],
    startingItems: [
      { itemId: 'small-knife', qty: 1 },
      { itemId: 'city-map', qty: 1 },
      { itemId: 'pet-mouse', qty: 1 },
      { itemId: 'keepsake', qty: 1 },
      { itemId: 'common-clothes', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 10,
    feature: {
      name: 'City Secrets',
      description:
        'You know the secret patterns and flow of cities and can find passages through the urban sprawl that others would miss. When you are not in combat, you and companions you lead can travel between any two locations in a city twice as fast as your speed would normally allow.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I hide scraps of food and trinkets away in my pockets.',
        'I ask a lot of questions.',
        'I like to squeeze into small places where no one else can get to me.',
        'I sleep with my back to a wall or tree, with everything I own wrapped in a bundle in my arms.',
      ],
      ideals: [
        'Community. We have to take care of each other, because no one else is going to do it.',
        'Retribution. The rich need to be shown what life and death are like in the gutters.',
        'Aspiration. I am going to prove that I am worthy of a better life.',
      ],
      bonds: [
        'My town or city is my home, and I will fight to defend it.',
        'I sponsor an orphanage to keep others from enduring what I was forced to endure.',
        'I owe my survival to another urchin who taught me to live on the streets.',
      ],
      flaws: [
        'If I am outnumbered, I will run away from a fight.',
        'Gold seems like a lot of money to me, and I will do just about anything for more of it.',
        'It is not stealing if I need it more than someone else.',
      ],
    },
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    description:
      'You live for the moment when the crowd falls silent and every eye turns your way. Song, dance, jest, or juggling, you have plied your craft in taverns, courts, and market squares, and you know that a well-timed performance can open a purse or a heart. The road is your stage now.',
    skillProficiencies: ['acrobatics', 'performance'],
    toolProficiencies: ['Disguise kit', 'One type of musical instrument'],
    languages: 0,
    equipment: [
      'A musical instrument (one of your choice)',
      'The favor of an admirer (love letter, lock of hair, or trinket)',
      'A costume',
      'A pouch containing 15 gp',
    ],
    startingItems: [
      { itemId: 'musical-instrument', qty: 1 },
      { itemId: 'admirers-favor', qty: 1 },
      { itemId: 'costume', qty: 1 },
      { itemId: 'pouch', qty: 1 },
    ],
    startingGold: 15,
    feature: {
      name: 'By Popular Demand',
      description:
        'You can always find a place to perform, usually in an inn or tavern but possibly with a circus, at a theater, or even in a noble\'s court. At such a place, you receive free lodging and food of a modest or comfortable standard, as long as you perform each night. In addition, your performance makes you something of a local figure. When strangers recognize you in a town where you have performed, they typically take a liking to you.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I know a story relevant to almost every situation.',
        'Whenever I come to a new place, I collect local rumors and spread gossip.',
        'I am a hopeless romantic, always searching for that special someone.',
        'I love a good insult, even one directed at me.',
      ],
      ideals: [
        'Beauty. When I perform, I make the world better than it was.',
        'Creativity. The world is in need of new ideas and bold action.',
        'Honesty. Art should reflect the soul; it should come from within and reveal who we really are.',
      ],
      bonds: [
        'My instrument is my most treasured possession, and it reminds me of someone I love.',
        'Someone stole my precious instrument, and someday I will get it back.',
        'I want to be famous, whatever it takes.',
      ],
      flaws: [
        'I will do anything to win fame and renown.',
        'I am a sucker for a pretty face.',
        'Despite my best efforts, I am unreliable to my friends.',
      ],
    },
  },
  {
    id: 'hermit',
    name: 'Hermit',
    description:
      'For years you lived apart from the world, in a mountain cave, a sealed monastery, or a hut at the edge of the marsh, with only your thoughts and the turning seasons for company. In that silence you found something: a revelation, a secret, or a truth about yourself. Now you have come back to a world that never noticed you were gone.',
    skillProficiencies: ['medicine', 'religion'],
    toolProficiencies: ['Herbalism kit'],
    languages: 1,
    equipment: [
      'A scroll case stuffed full of notes from your studies or prayers',
      'A winter blanket',
      'A set of common clothes',
      'An herbalism kit',
      '5 gp',
    ],
    startingItems: [
      { itemId: 'scroll-case', qty: 1 },
      { itemId: 'blanket', qty: 1 },
      { itemId: 'common-clothes', qty: 1 },
      { itemId: 'herbalism-kit', qty: 1 },
    ],
    startingGold: 5,
    feature: {
      name: 'Discovery',
      description:
        'The quiet seclusion of your extended hermitage gave you access to a unique and powerful discovery. The exact nature of this revelation depends on the nature of your seclusion. It might be a great truth about the cosmos, the deities, the powerful beings of the outer planes, or the forces of nature. It could be a site that no one else has ever seen, or a long-forgotten fact or relic. Work with your GM to determine the details of your discovery and its impact on the campaign.',
    },
    suggestedCharacteristics: {
      personalityTraits: [
        'I have been isolated for so long that I rarely speak, preferring gestures and the occasional grunt.',
        'I am utterly serene, even in the face of disaster.',
        'I connect everything that happens to me to a grand, cosmic plan.',
        'I feel tremendous empathy for all who suffer.',
      ],
      ideals: [
        'Greater Good. My gifts are meant to be shared with all, not used for my own benefit.',
        'Self-Knowledge. If you know yourself, there is nothing left to know.',
        'Free Thinking. Inquiry and curiosity are the pillars of progress.',
      ],
      bonds: [
        'Nothing is more important than the other members of my hermitage, order, or association.',
        'I entered seclusion to hide from the ones who might still be hunting me. I must someday confront them.',
        'I entered seclusion because I loved someone I could not have.',
      ],
      flaws: [
        'Now that I have returned to the world, I enjoy its delights a little too much.',
        'I harbor dark, bloodthirsty thoughts that my isolation failed to quell.',
        'I like keeping secrets and will not share them with anyone.',
      ],
    },
  },
];
