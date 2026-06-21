// Service API : centralise tous les appels réseau vers la PokéAPI.
// Les écrans n'ont pas besoin de connaître les URLs, ils appellent
// simplement ces fonctions.

const BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Récupère une "page" de Pokémon.
 * L'API renvoie : { count, next, previous, results: [{ name, url }] }
 */
export async function fetchPokemonList(offset = 0, limit = 20) {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Récupère la liste COMPLÈTE des noms de Pokémon en un seul appel.
 * Utilisé par la recherche : on télécharge tous les noms une fois
 * (données légères : juste name + url) pour pouvoir filtrer sur
 * l'ensemble des Pokémon, et pas seulement ceux déjà affichés.
 */
export async function fetchAllPokemonNames() {
  const response = await fetch(`${BASE_URL}/pokemon?limit=100000&offset=0`);
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * Récupère les détails complets d'un Pokémon (types, stats, taille, poids...).
 * Accepte un id (25) ou un nom ("pikachu").
 */
export async function fetchPokemonDetails(idOrName) {
  const response = await fetch(`${BASE_URL}/pokemon/${idOrName}`);
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * L'endpoint liste ne donne pas l'id du Pokémon directement,
 * mais il se trouve à la fin de son URL :
 * "https://pokeapi.co/api/v2/pokemon/25/" -> 25
 */
export function getPokemonId(url) {
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
}

/**
 * Construit l'URL de l'image officielle d'un Pokémon à partir de son id.
 * Les images sont hébergées sur le dépôt GitHub officiel de la PokéAPI.
 */
export function getPokemonImageUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
