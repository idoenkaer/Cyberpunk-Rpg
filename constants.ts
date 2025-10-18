// constants.ts
import type { Archetype, ArchetypeData, Faction, Skill } from './types';

export const FACTIONS: Faction[] = [
    'Corporate Enforcers',
    'Hacker Collective',
    'Street Ronin',
    'Police',
];

export const ARCHETYPES: ArchetypeData[] = [
    { 
        name: 'Runner', 
        description: 'Masters of movement and improvisation. Runners excel at getting in and out of tight spots quickly, relying on agility and street smarts.',
        baseStats: { hp: 100, attack: 10, defense: 8 }
    },
    { 
        name: 'Netrunner', 
        description: 'Digital ghosts who manipulate the net. They can hack systems, control drones, and fry enemy cybernetics from a distance.',
        baseStats: { hp: 80, attack: 8, defense: 6 }
    },
    { 
        name: 'Street Samurai', 
        description: 'Honorable warriors of the concrete jungle. They live by a code of steel and chrome, mastering cybernetically enhanced combat.',
        baseStats: { hp: 120, attack: 15, defense: 10 }
    },
    { 
        name: 'Corporate Drone', 
        description: 'A cog in the megacorp machine. They leverage their connections, wealth, and insider knowledge to get ahead.',
        baseStats: { hp: 90, attack: 7, defense: 7 }
    },
    { 
        name: 'Techie', 
        description: 'Brilliant mechanics and engineers. They can build, repair, and modify anything from a weapon to a cyberdeck.',
        baseStats: { hp: 90, attack: 9, defense: 9 }
    },
    { 
        name: 'Fixer', 
        description: 'Information and contraband brokers. Fixers know everyone and can pull the right strings to get the job done... for a price.',
        baseStats: { hp: 100, attack: 10, defense: 7 }
    },
];

export const SKILL_TREES: Record<Archetype, Skill[]> = {
    'Runner': [
        { name: 'Adrenaline Rush', description: 'Temporarily boost defense in a tight spot.', effect: 'defense +5 for 1 turn' },
        { name: 'Streetwise', description: 'Find better deals and information in the city.', effect: 'better shop prices' },
    ],
    'Netrunner': [
        { name: 'System Shock', description: 'Short-circuit an enemy\'s cybernetics, dealing damage.', effect: 'deal 10 damage' },
        { name: 'Black Ice', description: 'Create a defensive program that damages attackers.', effect: 'counter-attack damage' },
    ],
    'Street Samurai': [
        { name: 'Blade Dance', description: 'Unleash a flurry of attacks with a bladed weapon.', effect: '2x attack' },
        { name: 'Second Wind', description: 'Recover a small amount of health during combat.', effect: 'heal 15 hp' },
    ],
    'Corporate Drone': [
        { name: 'Hostile Takeover', description: 'Use corporate jargon to confuse and weaken an enemy.', effect: 'enemy attack -5' },
        { name: 'Insider Trading', description: 'Gain extra credits from completed jobs.', effect: '+20% credits' },
    ],
    'Techie': [
        { name: 'Jury-Rig', description: 'Temporarily overcharge a weapon for increased damage.', effect: 'attack +5 for 1 turn' },
        { name: 'Scavenger', description: 'Find extra components and items in the world.', effect: 'higher item drop rate' },
    ],
    'Fixer': [
        { name: 'Call in a Favor', description: 'Get a one-time assist from a powerful contact.', effect: 'skip a fight' },
        { name: 'Grease Palms', description: 'Bribe your way past certain obstacles.', effect: 'bribe option' },
    ],
};
