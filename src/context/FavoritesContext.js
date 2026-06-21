import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

// Clé sous laquelle on stocke les favoris dans le stockage du téléphone
const STORAGE_KEY = '@pokedex_favorites';

// Le Context : une "boîte" partagée accessible par tous les écrans,
// sans avoir à passer les favoris en props d'écran en écran.
const FavoritesContext = createContext(null);

/**
 * Le Provider enveloppe l'application et fournit :
 *  - favorites      : tableau d'objets { id, name } mis en favori
 *  - isFavorite(id) : true si ce Pokémon est en favori
 *  - toggleFavorite(pokemon) : ajoute ou retire des favoris
 */
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  // Tant que le chargement initial n'est pas fini, on n'écrit pas dans
  // le stockage (sinon on écraserait les favoris avec un tableau vide).
  const [loaded, setLoaded] = useState(false);

  // 1) Au démarrage : on relit les favoris sauvegardés sur l'appareil
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        // AsyncStorage ne stocke que du texte : on reconvertit le JSON
        if (json !== null) {
          setFavorites(JSON.parse(json));
        }
      } catch (e) {
        // En cas d'erreur de lecture, on démarre simplement sans favoris
      } finally {
        setLoaded(true);
      }
    };
    loadFavorites();
  }, []);

  // 2) À chaque modification des favoris : on les ré-enregistre
  useEffect(() => {
    if (!loaded) return; // on attend d'avoir lu l'existant
    // On transforme le tableau en texte JSON pour le stockage
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, loaded]);

  const isFavorite = (id) => favorites.some((p) => p.id === id);

  const toggleFavorite = (pokemon) => {
    setFavorites((prev) => {
      if (prev.some((p) => p.id === pokemon.id)) {
        // Déjà favori -> on le retire
        return prev.filter((p) => p.id !== pokemon.id);
      }
      // Pas encore favori -> on l'ajoute
      return [...prev, { id: pokemon.id, name: pokemon.name }];
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Petit hook pratique : useFavorites() au lieu de useContext(FavoritesContext)
export function useFavorites() {
  return useContext(FavoritesContext);
}
