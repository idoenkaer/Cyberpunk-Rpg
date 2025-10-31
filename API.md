# Cyberpunk RPG API Documentation

This document describes the key API endpoints used in the Cyberpunk RPG project.

## Character Creation

**POST /api/characters**
- Create a new character.
- Request body: `{ name, class, attributes }`
- Response: Newly created character object

**GET /api/characters/{id}**
- Retrieve a character by ID.
- Response: Character object

## Game World

**GET /api/world**
- Get current state of the game world.
- Response: World state object

## Combat

**POST /api/combat/start**
- Start a combat encounter.
- Request body: `{ playerId, enemyId }`
- Response: Combat state object

---

*Expand this documentation as more API endpoints are added.*
