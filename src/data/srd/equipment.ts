import type { Item } from '@/types/ruleset';

/**
 * SRD 5.1 equipment (CC-BY-4.0): weapons, armor, ammunition, adventuring
 * gear, tools, packs, and a selection of iconic magic items.
 */

const gp = (amount: number) => ({ amount, unit: 'gp' });
const sp = (amount: number) => ({ amount, unit: 'sp' });
const cp = (amount: number) => ({ amount, unit: 'cp' });

// ---------------------------------------------------------------------------
// Weapons
// ---------------------------------------------------------------------------

const weapons: Item[] = [
  // Simple melee
  {
    id: 'club', name: 'Club', category: 'weapon', cost: sp(1), weight: 2,
    weapon: { damage: '1d4', damageType: 'bludgeoning', properties: ['light'], category: 'simple', kind: 'melee' },
  },
  {
    id: 'dagger', name: 'Dagger', category: 'weapon', cost: gp(2), weight: 1,
    weapon: { damage: '1d4', damageType: 'piercing', properties: ['finesse', 'light', 'thrown'], range: { normal: 20, long: 60 }, category: 'simple', kind: 'melee' },
  },
  {
    id: 'greatclub', name: 'Greatclub', category: 'weapon', cost: sp(2), weight: 10,
    weapon: { damage: '1d8', damageType: 'bludgeoning', properties: ['two-handed'], category: 'simple', kind: 'melee' },
  },
  {
    id: 'handaxe', name: 'Handaxe', category: 'weapon', cost: gp(5), weight: 2,
    weapon: { damage: '1d6', damageType: 'slashing', properties: ['light', 'thrown'], range: { normal: 20, long: 60 }, category: 'simple', kind: 'melee' },
  },
  {
    id: 'javelin', name: 'Javelin', category: 'weapon', cost: sp(5), weight: 2,
    weapon: { damage: '1d6', damageType: 'piercing', properties: ['thrown'], range: { normal: 30, long: 120 }, category: 'simple', kind: 'melee' },
  },
  {
    id: 'light-hammer', name: 'Light Hammer', category: 'weapon', cost: gp(2), weight: 2,
    weapon: { damage: '1d4', damageType: 'bludgeoning', properties: ['light', 'thrown'], range: { normal: 20, long: 60 }, category: 'simple', kind: 'melee' },
  },
  {
    id: 'mace', name: 'Mace', category: 'weapon', cost: gp(5), weight: 4,
    weapon: { damage: '1d6', damageType: 'bludgeoning', properties: [], category: 'simple', kind: 'melee' },
  },
  {
    id: 'quarterstaff', name: 'Quarterstaff', category: 'weapon', cost: sp(2), weight: 4,
    weapon: { damage: '1d6', damageType: 'bludgeoning', properties: ['versatile'], versatileDamage: '1d8', category: 'simple', kind: 'melee' },
  },
  {
    id: 'sickle', name: 'Sickle', category: 'weapon', cost: gp(1), weight: 2,
    weapon: { damage: '1d4', damageType: 'slashing', properties: ['light'], category: 'simple', kind: 'melee' },
  },
  {
    id: 'spear', name: 'Spear', category: 'weapon', cost: gp(1), weight: 3,
    weapon: { damage: '1d6', damageType: 'piercing', properties: ['thrown', 'versatile'], versatileDamage: '1d8', range: { normal: 20, long: 60 }, category: 'simple', kind: 'melee' },
  },
  // Simple ranged
  {
    id: 'light-crossbow', name: 'Light Crossbow', category: 'weapon', cost: gp(25), weight: 5,
    weapon: { damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'loading', 'two-handed'], range: { normal: 80, long: 320 }, category: 'simple', kind: 'ranged' },
  },
  {
    id: 'darts', name: 'Darts', category: 'weapon', cost: cp(5), weight: 0.25,
    description: 'Sold individually; price and weight are per dart.',
    weapon: { damage: '1d4', damageType: 'piercing', properties: ['finesse', 'thrown'], range: { normal: 20, long: 60 }, category: 'simple', kind: 'ranged' },
  },
  {
    id: 'shortbow', name: 'Shortbow', category: 'weapon', cost: gp(25), weight: 2,
    weapon: { damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'two-handed'], range: { normal: 80, long: 320 }, category: 'simple', kind: 'ranged' },
  },
  {
    id: 'sling', name: 'Sling', category: 'weapon', cost: cp(1), weight: 0,
    weapon: { damage: '1d4', damageType: 'bludgeoning', properties: ['ammunition'], range: { normal: 30, long: 120 }, category: 'simple', kind: 'ranged' },
  },
  // Martial melee
  {
    id: 'battleaxe', name: 'Battleaxe', category: 'weapon', cost: gp(10), weight: 4,
    weapon: { damage: '1d8', damageType: 'slashing', properties: ['versatile'], versatileDamage: '1d10', category: 'martial', kind: 'melee' },
  },
  {
    id: 'flail', name: 'Flail', category: 'weapon', cost: gp(10), weight: 2,
    weapon: { damage: '1d8', damageType: 'bludgeoning', properties: [], category: 'martial', kind: 'melee' },
  },
  {
    id: 'glaive', name: 'Glaive', category: 'weapon', cost: gp(20), weight: 6,
    weapon: { damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'greataxe', name: 'Greataxe', category: 'weapon', cost: gp(30), weight: 7,
    weapon: { damage: '1d12', damageType: 'slashing', properties: ['heavy', 'two-handed'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'greatsword', name: 'Greatsword', category: 'weapon', cost: gp(50), weight: 6,
    weapon: { damage: '2d6', damageType: 'slashing', properties: ['heavy', 'two-handed'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'halberd', name: 'Halberd', category: 'weapon', cost: gp(20), weight: 6,
    weapon: { damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'lance', name: 'Lance', category: 'weapon', cost: gp(10), weight: 6,
    description: 'You have disadvantage when you use a lance to attack a target within 5 feet of you. A lance requires two hands to wield when you aren\'t mounted.',
    weapon: { damage: '1d12', damageType: 'piercing', properties: ['reach', 'special'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'longsword', name: 'Longsword', category: 'weapon', cost: gp(15), weight: 3,
    weapon: { damage: '1d8', damageType: 'slashing', properties: ['versatile'], versatileDamage: '1d10', category: 'martial', kind: 'melee' },
  },
  {
    id: 'maul', name: 'Maul', category: 'weapon', cost: gp(10), weight: 10,
    weapon: { damage: '2d6', damageType: 'bludgeoning', properties: ['heavy', 'two-handed'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'morningstar', name: 'Morningstar', category: 'weapon', cost: gp(15), weight: 4,
    weapon: { damage: '1d8', damageType: 'piercing', properties: [], category: 'martial', kind: 'melee' },
  },
  {
    id: 'pike', name: 'Pike', category: 'weapon', cost: gp(5), weight: 18,
    weapon: { damage: '1d10', damageType: 'piercing', properties: ['heavy', 'reach', 'two-handed'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'rapier', name: 'Rapier', category: 'weapon', cost: gp(25), weight: 2,
    weapon: { damage: '1d8', damageType: 'piercing', properties: ['finesse'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'scimitar', name: 'Scimitar', category: 'weapon', cost: gp(25), weight: 3,
    weapon: { damage: '1d6', damageType: 'slashing', properties: ['finesse', 'light'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'shortsword', name: 'Shortsword', category: 'weapon', cost: gp(10), weight: 2,
    weapon: { damage: '1d6', damageType: 'piercing', properties: ['finesse', 'light'], category: 'martial', kind: 'melee' },
  },
  {
    id: 'trident', name: 'Trident', category: 'weapon', cost: gp(5), weight: 4,
    weapon: { damage: '1d6', damageType: 'piercing', properties: ['thrown', 'versatile'], versatileDamage: '1d8', range: { normal: 20, long: 60 }, category: 'martial', kind: 'melee' },
  },
  {
    id: 'war-pick', name: 'War Pick', category: 'weapon', cost: gp(5), weight: 2,
    weapon: { damage: '1d8', damageType: 'piercing', properties: [], category: 'martial', kind: 'melee' },
  },
  {
    id: 'warhammer', name: 'Warhammer', category: 'weapon', cost: gp(15), weight: 2,
    weapon: { damage: '1d8', damageType: 'bludgeoning', properties: ['versatile'], versatileDamage: '1d10', category: 'martial', kind: 'melee' },
  },
  {
    id: 'whip', name: 'Whip', category: 'weapon', cost: gp(2), weight: 3,
    weapon: { damage: '1d4', damageType: 'slashing', properties: ['finesse', 'reach'], category: 'martial', kind: 'melee' },
  },
  // Martial ranged
  {
    id: 'blowgun', name: 'Blowgun', category: 'weapon', cost: gp(10), weight: 1,
    weapon: { damage: '1', damageType: 'piercing', properties: ['ammunition', 'loading'], range: { normal: 25, long: 100 }, category: 'martial', kind: 'ranged' },
  },
  {
    id: 'hand-crossbow', name: 'Hand Crossbow', category: 'weapon', cost: gp(75), weight: 3,
    weapon: { damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'light', 'loading'], range: { normal: 30, long: 120 }, category: 'martial', kind: 'ranged' },
  },
  {
    id: 'heavy-crossbow', name: 'Heavy Crossbow', category: 'weapon', cost: gp(50), weight: 18,
    weapon: { damage: '1d10', damageType: 'piercing', properties: ['ammunition', 'heavy', 'loading', 'two-handed'], range: { normal: 100, long: 400 }, category: 'martial', kind: 'ranged' },
  },
  {
    id: 'longbow', name: 'Longbow', category: 'weapon', cost: gp(50), weight: 2,
    weapon: { damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'heavy', 'two-handed'], range: { normal: 150, long: 600 }, category: 'martial', kind: 'ranged' },
  },
  {
    id: 'net', name: 'Net', category: 'weapon', cost: gp(1), weight: 3,
    description: 'A Large or smaller creature hit by a net is restrained until it is freed. A net has no effect on creatures that are formless, or creatures that are Huge or larger. A creature can use its action to make a DC 10 Strength check, freeing itself or another creature within its reach on a success. Dealing 5 slashing damage to the net (AC 10) also frees the creature without harming it, ending the effect and destroying the net. When you use an action, bonus action, or reaction to attack with a net, you can make only one attack regardless of the number of attacks you can normally make.',
    weapon: { damage: '0', damageType: 'none', properties: ['special', 'thrown'], range: { normal: 5, long: 15 }, category: 'martial', kind: 'ranged' },
  },
];

// ---------------------------------------------------------------------------
// Armor & shields
// ---------------------------------------------------------------------------

const armor: Item[] = [
  {
    id: 'padded', name: 'Padded', category: 'armor', cost: gp(5), weight: 8,
    description: 'Quilted layers of cloth and batting.',
    armor: { baseAc: 11, dexBonus: 'full', stealthDisadvantage: true, category: 'light' },
  },
  {
    id: 'leather-armor', name: 'Leather Armor', category: 'armor', cost: gp(10), weight: 10,
    description: 'The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil.',
    armor: { baseAc: 11, dexBonus: 'full', stealthDisadvantage: false, category: 'light' },
  },
  {
    id: 'studded-leather-armor', name: 'Studded Leather Armor', category: 'armor', cost: gp(45), weight: 13,
    description: 'Made from tough but flexible leather, studded leather is reinforced with close-set rivets or spikes.',
    armor: { baseAc: 12, dexBonus: 'full', stealthDisadvantage: false, category: 'light' },
  },
  {
    id: 'hide-armor', name: 'Hide Armor', category: 'armor', cost: gp(10), weight: 12,
    description: 'This crude armor consists of thick furs and pelts.',
    armor: { baseAc: 12, dexBonus: 'max2', stealthDisadvantage: false, category: 'medium' },
  },
  {
    id: 'chain-shirt', name: 'Chain Shirt', category: 'armor', cost: gp(50), weight: 20,
    description: 'Made of interlocking metal rings, a chain shirt is worn between layers of clothing or leather.',
    armor: { baseAc: 13, dexBonus: 'max2', stealthDisadvantage: false, category: 'medium' },
  },
  {
    id: 'scale-mail', name: 'Scale Mail', category: 'armor', cost: gp(50), weight: 45,
    description: 'A coat and leggings of leather covered with overlapping pieces of metal, much like the scales of a fish.',
    armor: { baseAc: 14, dexBonus: 'max2', stealthDisadvantage: true, category: 'medium' },
  },
  {
    id: 'breastplate', name: 'Breastplate', category: 'armor', cost: gp(400), weight: 20,
    description: 'A fitted metal chest piece worn with supple leather.',
    armor: { baseAc: 14, dexBonus: 'max2', stealthDisadvantage: false, category: 'medium' },
  },
  {
    id: 'half-plate', name: 'Half Plate', category: 'armor', cost: gp(750), weight: 40,
    description: 'Shaped metal plates that cover most of the wearer\'s body, with no leg protection beyond simple greaves.',
    armor: { baseAc: 15, dexBonus: 'max2', stealthDisadvantage: true, category: 'medium' },
  },
  {
    id: 'ring-mail', name: 'Ring Mail', category: 'armor', cost: gp(30), weight: 40,
    description: 'Leather armor with heavy rings sewn into it.',
    armor: { baseAc: 14, dexBonus: 'none', stealthDisadvantage: true, category: 'heavy' },
  },
  {
    id: 'chain-mail', name: 'Chain Mail', category: 'armor', cost: gp(75), weight: 55,
    description: 'Interlocking metal rings worn over a layer of quilted fabric.',
    armor: { baseAc: 16, dexBonus: 'none', stealthDisadvantage: true, strengthRequirement: 13, category: 'heavy' },
  },
  {
    id: 'splint', name: 'Splint', category: 'armor', cost: gp(200), weight: 60,
    description: 'Narrow vertical strips of metal riveted to a backing of leather worn over cloth padding.',
    armor: { baseAc: 17, dexBonus: 'none', stealthDisadvantage: true, strengthRequirement: 15, category: 'heavy' },
  },
  {
    id: 'plate', name: 'Plate', category: 'armor', cost: gp(1500), weight: 65,
    description: 'Shaped, interlocking metal plates covering the entire body.',
    armor: { baseAc: 18, dexBonus: 'none', stealthDisadvantage: true, strengthRequirement: 15, category: 'heavy' },
  },
  {
    id: 'shield', name: 'Shield', category: 'shield', cost: gp(10), weight: 6,
    description: 'A shield is carried in one hand. Wielding a shield increases your Armor Class by 2. You can benefit from only one shield at a time.',
    shieldBonus: 2,
    armor: { baseAc: 2, dexBonus: 'none', category: 'shield' },
  },
];

// ---------------------------------------------------------------------------
// Ammunition
// ---------------------------------------------------------------------------

const ammunition: Item[] = [
  { id: 'arrows', name: 'Arrows (20)', category: 'gear', cost: gp(1), weight: 1, description: 'A quiver of 20 arrows for a shortbow or longbow.' },
  { id: 'crossbow-bolts', name: 'Crossbow Bolts (20)', category: 'gear', cost: gp(1), weight: 1.5, description: 'A case of 20 bolts for any crossbow.' },
  { id: 'sling-bullets', name: 'Sling Bullets (20)', category: 'gear', cost: cp(4), weight: 1.5, description: 'A pouch of 20 lead bullets for a sling.' },
  { id: 'blowgun-needles', name: 'Blowgun Needles (50)', category: 'gear', cost: gp(1), weight: 1, description: 'A case of 50 needles for a blowgun.' },
];

// ---------------------------------------------------------------------------
// Adventuring gear, tools, and packs
// ---------------------------------------------------------------------------

const gear: Item[] = [
  { id: 'backpack', name: 'Backpack', category: 'gear', cost: gp(2), weight: 5, description: 'Holds 1 cubic foot / 30 pounds of gear. You can also strap items to the outside.' },
  { id: 'bedroll', name: 'Bedroll', category: 'gear', cost: gp(1), weight: 7, description: 'A padded roll for sleeping outdoors.' },
  { id: 'rope-hempen', name: 'Rope, Hempen (50 feet)', category: 'gear', cost: gp(1), weight: 10, description: 'Rope has 2 hit points and can be burst with a DC 17 Strength check.' },
  { id: 'rope-silk', name: 'Rope, Silk (50 feet)', category: 'gear', cost: gp(10), weight: 5, description: 'Rope has 2 hit points and can be burst with a DC 17 Strength check.' },
  { id: 'torch', name: 'Torch', category: 'gear', cost: cp(1), weight: 1, description: 'Burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet. If you make a melee attack with a burning torch and hit, it deals 1 fire damage.' },
  { id: 'lantern-hooded', name: 'Lantern, Hooded', category: 'gear', cost: gp(5), weight: 2, description: 'Casts bright light in a 30-foot radius and dim light for an additional 30 feet. Once lit, it burns for 6 hours on a flask (1 pint) of oil. As an action, you can lower the hood, reducing the light to dim light in a 5-foot radius.' },
  { id: 'lantern-bullseye', name: 'Lantern, Bullseye', category: 'gear', cost: gp(10), weight: 2, description: 'Casts bright light in a 60-foot cone and dim light for an additional 60 feet. Once lit, it burns for 6 hours on a flask (1 pint) of oil.' },
  { id: 'oil-flask', name: 'Oil (flask)', category: 'consumable', cost: sp(1), weight: 1, description: 'Usually sold in a clay flask holding 1 pint. As an action, you can splash the oil onto a creature within 5 feet or throw it up to 20 feet, shattering on impact. Make a ranged attack against a target creature or object, treating the oil as an improvised weapon. On a hit, the target is covered in oil. If the target takes any fire damage before the oil dries (after 1 minute), it takes an additional 5 fire damage. You can also pour a flask on the ground to cover a 5-foot-square area; if lit, it burns for 2 rounds and deals 5 fire damage to any creature that enters the area or ends its turn there.' },
  { id: 'tinderbox', name: 'Tinderbox', category: 'gear', cost: sp(5), weight: 1, description: 'Flint, fire steel, and tinder. Lighting a torch or anything else with exposed fuel takes an action; lighting any other fire takes 1 minute.' },
  { id: 'rations', name: 'Rations (1 day)', category: 'consumable', cost: sp(5), weight: 2, description: 'Dry foods suitable for extended travel: jerky, dried fruit, hardtack, and nuts.' },
  { id: 'waterskin', name: 'Waterskin', category: 'gear', cost: sp(2), weight: 5, description: 'Holds 4 pints of liquid. Weight listed is when full.' },
  { id: 'healers-kit', name: 'Healer\'s Kit', category: 'gear', cost: gp(5), weight: 3, description: 'A leather pouch containing bandages, salves, and splints. The kit has ten uses. As an action, you can expend one use to stabilize a creature that has 0 hit points, without needing to make a Wisdom (Medicine) check.' },
  { id: 'potion-of-healing', name: 'Potion of Healing', category: 'consumable', cost: gp(50), weight: 0.5, rarity: 'common', description: 'A character who drinks the magical red fluid in this vial regains 2d4 + 2 hit points. Drinking or administering a potion takes an action.' },
  { id: 'antitoxin', name: 'Antitoxin (vial)', category: 'consumable', cost: gp(50), weight: 0, description: 'A creature that drinks this vial of liquid gains advantage on saving throws against poison for 1 hour. It confers no benefit to undead or constructs.' },
  { id: 'acid-vial', name: 'Acid (vial)', category: 'consumable', cost: gp(25), weight: 1, description: 'As an action, you can splash the contents of this vial onto a creature within 5 feet of you or throw the vial up to 20 feet, shattering it on impact. Make a ranged attack against a creature or object, treating the acid as an improvised weapon. On a hit, the target takes 2d6 acid damage.' },
  { id: 'alchemists-fire', name: 'Alchemist\'s Fire (flask)', category: 'consumable', cost: gp(50), weight: 1, description: 'This sticky, adhesive fluid ignites when exposed to air. As an action, you can throw this flask up to 20 feet, shattering it on impact. Make a ranged attack against a creature or object, treating the alchemist\'s fire as an improvised weapon. On a hit, the target takes 1d4 fire damage at the start of each of its turns. A creature can end this damage by using its action to make a DC 10 Dexterity check to extinguish the flames.' },
  { id: 'holy-water', name: 'Holy Water (flask)', category: 'consumable', cost: gp(25), weight: 1, description: 'As an action, you can splash the contents of this flask onto a creature within 5 feet of you or throw it up to 20 feet, shattering it on impact. Make a ranged attack against a target creature, treating the holy water as an improvised weapon. If the target is a fiend or undead, it takes 2d6 radiant damage.' },
  { id: 'caltrops', name: 'Caltrops (bag of 20)', category: 'gear', cost: gp(1), weight: 2, description: 'As an action, you can spread a bag of caltrops to cover a 5-foot-square area. Any creature that enters the area must succeed on a DC 15 Dexterity saving throw or stop moving and take 1 piercing damage. Until the creature regains at least 1 hit point, its walking speed is reduced by 10 feet. A creature moving through the area at half speed doesn\'t need to make the save.' },
  { id: 'ball-bearings', name: 'Ball Bearings (bag of 1,000)', category: 'gear', cost: gp(1), weight: 2, description: 'As an action, you can spill these tiny metal balls to cover a level, 10-foot-square area. A creature moving across the covered area must succeed on a DC 10 Dexterity saving throw or fall prone. A creature moving through the area at half speed doesn\'t need to make the save.' },
  { id: 'chain', name: 'Chain (10 feet)', category: 'gear', cost: gp(5), weight: 10, description: 'A chain has 10 hit points. It can be burst with a successful DC 20 Strength check.' },
  { id: 'crowbar', name: 'Crowbar', category: 'gear', cost: gp(2), weight: 5, description: 'Using a crowbar grants advantage to Strength checks where the crowbar\'s leverage can be applied.' },
  { id: 'grappling-hook', name: 'Grappling Hook', category: 'gear', cost: gp(2), weight: 4, description: 'A hooked iron head that can be tied to a rope and thrown to catch on a ledge or wall.' },
  { id: 'hammer', name: 'Hammer', category: 'gear', cost: gp(1), weight: 3, description: 'A simple tool for driving pitons, nails, and stakes.' },
  { id: 'pitons', name: 'Piton', category: 'gear', cost: cp(5), weight: 0.25, description: 'An iron spike that can be hammered into rock or wood to anchor a rope.' },
  { id: 'manacles', name: 'Manacles', category: 'gear', cost: gp(2), weight: 6, description: 'These metal restraints can bind a Small or Medium creature. Escaping requires a successful DC 20 Dexterity check; breaking them requires a DC 20 Strength check. Each set comes with one key. Without the key, a creature proficient with thieves\' tools can pick the lock with a DC 15 Dexterity check. Manacles have 15 hit points.' },
  { id: 'mirror-steel', name: 'Mirror, Steel', category: 'gear', cost: gp(5), weight: 0.5, description: 'A small polished steel mirror.' },
  { id: 'spyglass', name: 'Spyglass', category: 'gear', cost: gp(1000), weight: 1, description: 'Objects viewed through a spyglass are magnified to twice their size.' },
  { id: 'lock', name: 'Lock', category: 'gear', cost: gp(10), weight: 1, description: 'A key is provided with the lock. Without the key, a creature proficient with thieves\' tools can pick this lock with a successful DC 15 Dexterity check. Better locks are available for higher prices.' },
  { id: 'thieves-tools', name: 'Thieves\' Tools', category: 'tool', cost: gp(25), weight: 1, description: 'A small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers. Proficiency with these tools lets you add your proficiency bonus to any ability checks you make to disarm traps or open locks.' },
  { id: 'climbers-kit', name: 'Climber\'s Kit', category: 'gear', cost: gp(25), weight: 12, description: 'Includes special pitons, boot tips, gloves, and a harness. As an action, you can anchor yourself; when you do, you can\'t fall more than 25 feet from the anchor point, and you can\'t climb more than 25 feet away from it without undoing the anchor.' },
  { id: 'common-clothes', name: 'Clothes, Common', category: 'gear', cost: sp(5), weight: 3, description: 'Sturdy, unremarkable everyday clothing.' },
  { id: 'fine-clothes', name: 'Clothes, Fine', category: 'gear', cost: gp(15), weight: 6, description: 'Expensive garments suited to nobles and courtiers.' },
  { id: 'travelers-clothes', name: 'Clothes, Traveler\'s', category: 'gear', cost: gp(2), weight: 4, description: 'Hard-wearing clothing made for the road.' },
  { id: 'costume', name: 'Clothes, Costume', category: 'gear', cost: gp(5), weight: 4, description: 'Theatrical clothing for performances or disguises.' },
  { id: 'pouch', name: 'Pouch', category: 'gear', cost: sp(5), weight: 1, description: 'A cloth or leather pouch can hold up to 20 sling bullets or 50 blowgun needles, among other things. Holds 1/5 cubic foot / 6 pounds of gear.' },
  { id: 'chest', name: 'Chest', category: 'gear', cost: gp(5), weight: 25, description: 'Holds 12 cubic feet / 300 pounds of gear.' },
  { id: 'ink', name: 'Ink (1 ounce bottle)', category: 'gear', cost: gp(10), weight: 0, description: 'A small bottle of black ink.' },
  { id: 'ink-pen', name: 'Ink Pen', category: 'gear', cost: cp(2), weight: 0, description: 'A quill or reed pen for writing.' },
  { id: 'paper', name: 'Paper (one sheet)', category: 'gear', cost: sp(2), weight: 0, description: 'A single sheet of paper.' },
  { id: 'parchment', name: 'Parchment (one sheet)', category: 'gear', cost: sp(1), weight: 0, description: 'A single sheet of parchment.' },
  { id: 'book', name: 'Book', category: 'gear', cost: gp(25), weight: 5, description: 'A book might contain poetry, historical accounts, information pertaining to a particular field of lore, diagrams and notes on gnomish contraptions, or just about anything else that can be represented using text or pictures.' },
  { id: 'spellbook', name: 'Spellbook', category: 'gear', cost: gp(50), weight: 3, description: 'Essential for wizards, a spellbook is a leather-bound tome with 100 blank vellum pages suitable for recording spells.' },
  { id: 'component-pouch', name: 'Component Pouch', category: 'gear', cost: gp(25), weight: 2, description: 'A small, watertight leather belt pouch that has compartments to hold all the material components and other special items you need to cast your spells, except for those components that have a specific cost.' },
  { id: 'arcane-focus', name: 'Arcane Focus', category: 'gear', cost: gp(10), weight: 1, description: 'A special item — an orb, a crystal, a rod, a specially constructed staff, a wand-like length of wood, or some similar item — designed to channel the power of arcane spells. A sorcerer, warlock, or wizard can use such an item as a spellcasting focus.' },
  { id: 'druidic-focus', name: 'Druidic Focus', category: 'gear', cost: gp(10), weight: 1, description: 'A sprig of mistletoe or holly, a wand or scepter made of yew or another special wood, a staff drawn whole out of a living tree, or a totem object incorporating feathers, fur, bones, and teeth from sacred animals. A druid can use such an object as a spellcasting focus.' },
  { id: 'holy-symbol', name: 'Holy Symbol', category: 'gear', cost: gp(5), weight: 1, description: 'A representation of a god or pantheon: an amulet depicting a symbol representing a deity, the same symbol carefully engraved or inlaid as an emblem on a shield, or a tiny box holding a fragment of a sacred relic. A cleric or paladin can use a holy symbol as a spellcasting focus.' },
  { id: 'lute', name: 'Lute', category: 'tool', cost: gp(35), weight: 2, description: 'A stringed musical instrument. If you have proficiency with a given musical instrument, you can add your proficiency bonus to any ability checks you make to play music with the instrument. A bard can use a musical instrument as a spellcasting focus.' },
  { id: 'flute', name: 'Flute', category: 'tool', cost: gp(2), weight: 1, description: 'A simple wind instrument. A bard can use a musical instrument as a spellcasting focus.' },
  { id: 'drum', name: 'Drum', category: 'tool', cost: gp(6), weight: 3, description: 'A percussion instrument. A bard can use a musical instrument as a spellcasting focus.' },
  { id: 'playing-cards', name: 'Playing Card Set', category: 'tool', cost: sp(5), weight: 0, description: 'A gaming set. If you are proficient with a gaming set, you can add your proficiency bonus to ability checks you make to play a game with that set.' },
  { id: 'dice-set', name: 'Dice Set', category: 'tool', cost: sp(1), weight: 0, description: 'A gaming set. If you are proficient with a gaming set, you can add your proficiency bonus to ability checks you make to play a game with that set.' },
  { id: 'disguise-kit', name: 'Disguise Kit', category: 'tool', cost: gp(25), weight: 3, description: 'This pouch of cosmetics, hair dye, and small props lets you create disguises that change your physical appearance. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to create a visual disguise.' },
  { id: 'forgery-kit', name: 'Forgery Kit', category: 'tool', cost: gp(15), weight: 5, description: 'This small box contains a variety of papers and parchments, pens and inks, seals and sealing wax, gold and silver leaf, and other supplies necessary to create convincing forgeries of physical documents. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to create a physical forgery of a document.' },
  { id: 'herbalism-kit', name: 'Herbalism Kit', category: 'tool', cost: gp(5), weight: 3, description: 'This kit contains a variety of instruments such as clippers, mortar and pestle, and pouches and vials used by herbalists to create remedies and potions. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to identify or apply herbs. Also, proficiency with this kit is required to create antitoxin and potions of healing.' },
  { id: 'poisoners-kit', name: 'Poisoner\'s Kit', category: 'tool', cost: gp(50), weight: 2, description: 'A poisoner\'s kit includes the vials, chemicals, and other equipment necessary for the creation of poisons. Proficiency with this kit lets you add your proficiency bonus to any ability checks you make to craft or use poisons.' },
  { id: 'candle', name: 'Candle', category: 'gear', cost: cp(1), weight: 0, description: 'For 1 hour, a candle sheds bright light in a 5-foot radius and dim light for an additional 5 feet.' },
  { id: 'blanket', name: 'Blanket', category: 'gear', cost: sp(5), weight: 3, description: 'A thick wool blanket.' },
  { id: 'tent', name: 'Tent, Two-Person', category: 'gear', cost: gp(2), weight: 20, description: 'A simple and portable canvas shelter, a tent sleeps two.' },
  { id: 'whetstone', name: 'Whetstone', category: 'gear', cost: cp(1), weight: 1, description: 'A stone for sharpening blades.' },
  { id: 'soap', name: 'Soap', category: 'gear', cost: cp(2), weight: 0, description: 'A bar of soap.' },
  { id: 'signal-whistle', name: 'Signal Whistle', category: 'gear', cost: cp(5), weight: 0, description: 'A shrill whistle audible from a great distance.' },
  { id: 'crowbar-iron-spikes', name: 'Iron Spikes (10)', category: 'gear', cost: gp(1), weight: 5, description: 'Ten iron spikes for wedging doors or anchoring ropes.' },
  { id: 'hunting-trap', name: 'Hunting Trap', category: 'gear', cost: gp(5), weight: 25, description: 'When you use your action to set it, this trap forms a saw-toothed steel ring that snaps shut when a creature steps on a pressure plate in the center. The trap is affixed by a heavy chain to an immobile object. A creature that steps on the plate must succeed on a DC 13 Dexterity saving throw or take 1d4 piercing damage and stop moving. Thereafter, until the creature breaks free of the trap, its movement is limited by the length of the chain (typically 3 feet long). A creature can use its action to make a DC 13 Strength check, freeing itself or another creature within its reach on a success. Each failed check deals 1 piercing damage to the trapped creature.' },
  { id: 'vial', name: 'Vial', category: 'gear', cost: gp(1), weight: 0, description: 'Holds 4 ounces of liquid.' },
  { id: 'flask', name: 'Flask or Tankard', category: 'gear', cost: cp(2), weight: 1, description: 'Holds 1 pint of liquid.' },
  { id: 'ladder', name: 'Ladder (10-foot)', category: 'gear', cost: sp(1), weight: 25, description: 'A ten-foot wooden ladder.' },
  { id: 'pole', name: 'Pole (10-foot)', category: 'gear', cost: cp(5), weight: 7, description: 'A ten-foot wooden pole, useful for probing for traps.' },
  { id: 'sack', name: 'Sack', category: 'gear', cost: cp(1), weight: 0.5, description: 'Holds 1 cubic foot / 30 pounds of gear.' },
  { id: 'shovel', name: 'Shovel', category: 'gear', cost: gp(2), weight: 5, description: 'A sturdy digging tool.' },
  { id: 'bell', name: 'Bell', category: 'gear', cost: gp(1), weight: 0, description: 'A small brass bell.' },
  { id: 'sealing-wax', name: 'Sealing Wax', category: 'gear', cost: sp(5), weight: 0, description: 'Wax for sealing letters.' },
  { id: 'perfume', name: 'Perfume (vial)', category: 'gear', cost: gp(5), weight: 0, description: 'A vial of fragrant perfume.' },
  { id: 'jug', name: 'Jug or Pitcher', category: 'gear', cost: cp(2), weight: 4, description: 'Holds 1 gallon of liquid.' },
  { id: 'mess-kit', name: 'Mess Kit', category: 'gear', cost: sp(2), weight: 1, description: 'This tin box contains a cup and simple cutlery. The box clamps together, and one side can be used as a cooking pan and the other as a plate or shallow bowl.' },
  { id: 'crystal', name: 'Crystal (arcane focus)', category: 'gear', cost: gp(10), weight: 1, description: 'A crystal that can be used as an arcane focus by a sorcerer, warlock, or wizard.' },
  { id: 'wand-focus', name: 'Wand (arcane focus)', category: 'gear', cost: gp(10), weight: 1, description: 'A wand-like length of wood that can be used as an arcane focus by a sorcerer, warlock, or wizard.' },
  { id: 'abacus', name: 'Abacus', category: 'gear', cost: gp(2), weight: 2, description: 'A counting frame.' },
  { id: 'magnifying-glass', name: 'Magnifying Glass', category: 'gear', cost: gp(100), weight: 0, description: 'This lens allows a closer look at small objects. It is also useful as a substitute for flint and steel when starting fires. Lighting a fire with a magnifying glass requires light as bright as sunlight to focus, tinder to ignite, and about 5 minutes for the fire to ignite. A magnifying glass grants advantage on any ability check made to appraise or inspect an item that is small or highly detailed.' },
  { id: 'smiths-tools', name: 'Smith\'s Tools', category: 'tool', cost: gp(20), weight: 8, description: 'Hammers, tongs, and files for working metal. Proficiency lets you add your proficiency bonus to checks made to craft or repair metal goods.' },
  { id: 'carpenters-tools', name: 'Carpenter\'s Tools', category: 'tool', cost: gp(8), weight: 6, description: 'Saws, planes, and chisels for working wood.' },
  { id: 'alchemists-supplies', name: 'Alchemist\'s Supplies', category: 'tool', cost: gp(50), weight: 8, description: 'Glass beakers, a metal frame, and common chemicals for alchemical work.' },
  { id: 'navigators-tools', name: 'Navigator\'s Tools', category: 'tool', cost: gp(25), weight: 2, description: 'This set of instruments is used for navigation at sea. Proficiency with navigator\'s tools lets you chart a ship\'s course and follow navigation charts, and add your proficiency bonus to checks made to avoid getting lost at sea.' },
  { id: 'horn', name: 'Horn', category: 'tool', cost: gp(3), weight: 2, description: 'A brass wind instrument. A bard can use a musical instrument as a spellcasting focus.' },
  { id: 'viol', name: 'Viol', category: 'tool', cost: gp(30), weight: 1, description: 'A bowed stringed instrument. A bard can use a musical instrument as a spellcasting focus.' },
  {
    id: 'explorers-pack', name: 'Explorer\'s Pack', category: 'gear', cost: gp(10), weight: 59,
    description: 'Includes a backpack, a bedroll, a mess kit, a tinderbox, 10 torches, 10 days of rations, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.',
  },
  {
    id: 'dungeoneers-pack', name: 'Dungeoneer\'s Pack', category: 'gear', cost: gp(12), weight: 61.5,
    description: 'Includes a backpack, a crowbar, a hammer, 10 pitons, 10 torches, a tinderbox, 10 days of rations, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.',
  },
  {
    id: 'burglars-pack', name: 'Burglar\'s Pack', category: 'gear', cost: gp(16), weight: 44.5,
    description: 'Includes a backpack, a bag of 1,000 ball bearings, 10 feet of string, a bell, 5 candles, a crowbar, a hammer, 10 pitons, a hooded lantern, 2 flasks of oil, 5 days of rations, a tinderbox, and a waterskin. The pack also has 50 feet of hempen rope strapped to the side of it.',
  },
  {
    id: 'priests-pack', name: 'Priest\'s Pack', category: 'gear', cost: gp(19), weight: 24,
    description: 'Includes a backpack, a blanket, 10 candles, a tinderbox, an alms box, 2 blocks of incense, a censer, vestments, 2 days of rations, and a waterskin.',
  },
  {
    id: 'scholars-pack', name: 'Scholar\'s Pack', category: 'gear', cost: gp(40), weight: 10,
    description: 'Includes a backpack, a book of lore, a bottle of ink, an ink pen, 10 sheets of parchment, a little bag of sand, and a small knife.',
  },
  {
    id: 'entertainers-pack', name: 'Entertainer\'s Pack', category: 'gear', cost: gp(40), weight: 38,
    description: 'Includes a backpack, a bedroll, 2 costumes, 5 candles, 5 days of rations, a waterskin, and a disguise kit.',
  },
  {
    id: 'diplomats-pack', name: 'Diplomat\'s Pack', category: 'gear', cost: gp(39), weight: 36,
    description: 'Includes a chest, 2 cases for maps and scrolls, a set of fine clothes, a bottle of ink, an ink pen, a lamp, 2 flasks of oil, 5 sheets of paper, a vial of perfume, sealing wax, and soap.',
  },
];

// ---------------------------------------------------------------------------
// Magic items
// ---------------------------------------------------------------------------

const magic: Item[] = [
  {
    id: 'potion-of-greater-healing', name: 'Potion of Greater Healing', category: 'magic', rarity: 'uncommon', weight: 0.5,
    description: 'You regain 4d4 + 4 hit points when you drink this potion. The potion\'s red liquid glimmers when agitated. Drinking or administering a potion takes an action.',
  },
  {
    id: 'bag-of-holding', name: 'Bag of Holding', category: 'magic', rarity: 'uncommon', weight: 15,
    description: 'This bag has an interior space considerably larger than its outside dimensions, roughly 2 feet in diameter at the mouth and 4 feet deep. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. The bag weighs 15 pounds, regardless of its contents. Retrieving an item from the bag requires an action. If the bag is overloaded, pierced, or torn, it ruptures and is destroyed, and its contents are scattered in the Astral Plane. If the bag is turned inside out, its contents spill forth, unharmed, but the bag must be put right before it can be used again. Breathing creatures inside the bag can survive up to a number of minutes equal to 10 divided by the number of creatures (minimum 1 minute), after which time they begin to suffocate. Placing a bag of holding inside an extradimensional space created by a portable hole or similar item instantly destroys both items and opens a gate to the Astral Plane.',
  },
  {
    id: 'cloak-of-protection', name: 'Cloak of Protection', category: 'magic', rarity: 'uncommon', weight: 1,
    description: 'You gain a +1 bonus to AC and saving throws while you wear this cloak. Requires attunement.',
  },
  {
    id: 'boots-of-elvenkind', name: 'Boots of Elvenkind', category: 'magic', rarity: 'uncommon', weight: 1,
    description: 'While you wear these boots, your steps make no sound, regardless of the surface you are moving across. You also have advantage on Dexterity (Stealth) checks that rely on moving silently.',
  },
  {
    id: 'wand-of-magic-missiles', name: 'Wand of Magic Missiles', category: 'magic', rarity: 'uncommon', weight: 1,
    description: 'This wand has 7 charges. While holding it, you can use an action to expend 1 or more of its charges to cast the magic missile spell from it. For 1 charge, you cast the 1st-level version of the spell. You can increase the spell slot level by one for each additional charge you expend. The wand regains 1d6 + 1 expended charges daily at dawn. If you expend the wand\'s last charge, roll a d20. On a 1, the wand crumbles into ashes and is destroyed.',
  },
  {
    id: 'ring-of-protection', name: 'Ring of Protection', category: 'magic', rarity: 'rare', weight: 0,
    description: 'You gain a +1 bonus to AC and saving throws while wearing this ring. Requires attunement.',
  },
  {
    id: 'gauntlets-of-ogre-power', name: 'Gauntlets of Ogre Power', category: 'magic', rarity: 'uncommon', weight: 2,
    description: 'Your Strength score is 19 while you wear these gauntlets. They have no effect on you if your Strength is already 19 or higher. Requires attunement.',
  },
  {
    id: 'flame-tongue', name: 'Flame Tongue', category: 'magic', rarity: 'rare', weight: 3,
    description: 'You can use a bonus action to speak this magic sword\'s command word, causing flames to erupt from the blade. These flames shed bright light in a 40-foot radius and dim light for an additional 40 feet. While the sword is ablaze, it deals an extra 2d6 fire damage to any target it hits. The flames last until you use a bonus action to speak the command word again or until you drop or sheathe the sword. Requires attunement.',
    weapon: { damage: '1d8', damageType: 'slashing', properties: ['versatile'], versatileDamage: '1d10', category: 'martial', kind: 'melee' },
  },
  {
    id: 'sword-plus-1', name: '+1 Weapon', category: 'magic', rarity: 'uncommon', weight: 3,
    description: 'You have a +1 bonus to attack and damage rolls made with this magic weapon. The statistics below assume a longsword; apply the bonus to any weapon of this kind.',
    weapon: { damage: '1d8+1', damageType: 'slashing', properties: ['versatile'], versatileDamage: '1d10+1', category: 'martial', kind: 'melee' },
  },
  {
    id: 'armor-plus-1', name: '+1 Armor', category: 'magic', rarity: 'rare', weight: 20,
    description: 'You have a +1 bonus to AC while wearing this armor. The statistics below assume a chain shirt; apply the bonus to any armor of this kind.',
    armor: { baseAc: 14, dexBonus: 'max2', stealthDisadvantage: false, category: 'medium' },
  },
  {
    id: 'amulet-of-health', name: 'Amulet of Health', category: 'magic', rarity: 'rare', weight: 1,
    description: 'Your Constitution score is 19 while you wear this amulet. It has no effect on you if your Constitution is already 19 or higher. Requires attunement.',
  },
  {
    id: 'cloak-of-elvenkind', name: 'Cloak of Elvenkind', category: 'magic', rarity: 'uncommon', weight: 1,
    description: 'While you wear this cloak with its hood up, Wisdom (Perception) checks made to see you have disadvantage, and you have advantage on Dexterity (Stealth) checks made to hide, as the cloak\'s color shifts to camouflage you. Pulling the hood up or down requires an action. Requires attunement.',
  },
  {
    id: 'bracers-of-defense', name: 'Bracers of Defense', category: 'magic', rarity: 'rare', weight: 1,
    description: 'While wearing these bracers, you gain a +2 bonus to AC if you are wearing no armor and using no shield. Requires attunement.',
  },
  {
    id: 'immovable-rod', name: 'Immovable Rod', category: 'magic', rarity: 'uncommon', weight: 2,
    description: 'This flat iron rod has a button on one end. You can use an action to press the button, which causes the rod to become magically fixed in place. Until you or another creature uses an action to push the button again, the rod doesn\'t move, even if it is defying gravity. The rod can hold up to 8,000 pounds of weight. More weight causes the rod to deactivate and fall. A creature can use an action to make a DC 30 Strength check, moving the fixed rod up to 10 feet on a success.',
  },
  {
    id: 'rope-of-climbing', name: 'Rope of Climbing', category: 'magic', rarity: 'uncommon', weight: 3,
    description: 'This 60-foot length of silk rope weighs 3 pounds and can hold up to 3,000 pounds. If you hold one end of the rope and use an action to speak the command word, the rope animates. As a bonus action, you can command the other end to move toward a destination you choose. That end moves 10 feet on your turn when you first command it and 10 feet on each of your turns until reaching its destination, up to its maximum length away, or until you tell it to stop. You can also tell the rope to fasten itself securely to an object or to unfasten itself, to knot or unknot itself, or to coil itself for carrying. The rope has AC 20 and 20 hit points. It regains 1 hit point every 5 minutes as long as it has at least 1 hit point. If the rope drops to 0 hit points, it is destroyed.',
  },
];

export const equipment: Item[] = [...weapons, ...armor, ...ammunition, ...gear, ...magic];
