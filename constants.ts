// constants.ts
import type { Archetype, Faction } from './types';

export const ARCHETYPES: Archetype[] = ['Runner', 'Netrunner', 'Street Samurai', 'Corporate Drone'];

export const FACTIONS: Faction[] = ['Corporate Enforcers', 'Hacker Collective', 'Street Ronin', 'Police'];

export const INITIAL_PROMPT = "You are a master storyteller for a dark, gritty, cyberpunk text-based adventure game. Generate the very first scene for the player. The scene should be a single, descriptive paragraph. Introduce the player's character based on their chosen archetype and faction, and set a compelling scene in a futuristic city. End the scene with a clear, immediate situation the player needs to react to. Do not offer choices yet.";

export const STORY_CONTINUATION_PROMPT = `Based on the previous scene and the player's choice, continue the story. Generate the next scene as a single, descriptive paragraph. Introduce a new situation, a character, or a complication. The tone should be consistent with a dark cyberpunk world. End the scene with a new situation the player needs to react to.`;

export const NPC_GENERATION_PROMPT = `Generate a non-player character (NPC) that the player encounters in this scene. Provide a name, a one-sentence physical description, and a simple dialogue tree with an opening line and two distinct choices for the player. The NPC should fit the cyberpunk theme.`;
