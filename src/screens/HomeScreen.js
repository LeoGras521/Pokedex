import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  fetchAllPokemonNames,
  fetchPokemonList,
  getPokemonId,
} from '../api/pokeapi';
import PokemonCard from '../components/PokemonCard';
import SearchBar from '../components/SearchBar';

const PAGE_SIZE = 20;

// React Navigation passe automatiquement la prop "navigation"
// à tous les écrans déclarés dans le Stack.Navigator
export default function HomeScreen({ navigation }) {
  // --- État de l'écran ---
  // pokemons    : les données affichées dans la liste
  // loading     : vrai pendant le chargement initial (affiche le spinner)
  // loadingMore : vrai pendant le chargement d'une page supplémentaire
  // hasMore     : faux quand l'API n'a plus de Pokémon à donner
  // error       : message d'erreur si l'appel réseau échoue
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // --- État de la recherche ---
  // query       : le texte tapé dans la barre de recherche
  // allPokemons : la liste complète des noms (chargée une fois) pour
  //               pouvoir chercher parmi TOUS les Pokémon
  const [query, setQuery] = useState('');
  const [allPokemons, setAllPokemons] = useState([]);

  // Transforme les résultats bruts { name, url } en { id, name }
  const mapResults = (results) =>
    results.map((p) => ({
      id: getPokemonId(p.url),
      name: p.name,
    }));

  // Charge la première page de Pokémon depuis l'API
  const loadPokemons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPokemonList(0, PAGE_SIZE);
      setPokemons(mapResults(data.results));
      // data.next vaut null quand on a atteint la dernière page
      setHasMore(data.next !== null);
    } catch (e) {
      setError('Impossible de charger les Pokémon.\nVérifie ta connexion internet.');
    } finally {
      setLoading(false);
    }
  };

  // Charge la page suivante (appelée quand on approche du bas de la liste)
  const loadMorePokemons = async () => {
    // Garde-fou : ne rien faire si un chargement est déjà en cours
    // ou s'il n'y a plus rien à charger (sinon appels en double !)
    if (loading || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      // L'offset = le nombre de Pokémon déjà affichés
      const data = await fetchPokemonList(pokemons.length, PAGE_SIZE);
      // On AJOUTE à la liste existante au lieu de la remplacer
      setPokemons((prev) => [...prev, ...mapResults(data.results)]);
      setHasMore(data.next !== null);
    } catch (e) {
      // Échec silencieux : l'utilisateur pourra re-déclencher en scrollant
    } finally {
      setLoadingMore(false);
    }
  };

  // Charge en arrière-plan la liste complète des noms (pour la recherche)
  const loadAllNames = async () => {
    try {
      const data = await fetchAllPokemonNames();
      setAllPokemons(mapResults(data.results));
    } catch (e) {
      // Pas bloquant : si ça échoue, la recherche filtrera la liste déjà chargée
    }
  };

  // useEffect avec [] : s'exécute UNE seule fois, au montage de l'écran
  useEffect(() => {
    loadPokemons();
    loadAllNames();
  }, []);

  // Mode recherche actif dès qu'on a tapé quelque chose
  const isSearching = query.trim().length > 0;

  // Données affichées :
  //  - en recherche : on filtre la liste complète par nom
  //  - sinon        : la liste paginée habituelle
  // useMemo évite de refiltrer à chaque rendu : le calcul n'est refait
  // que si query, allPokemons ou pokemons changent réellement.
  const displayedData = useMemo(() => {
    if (!isSearching) return pokemons;
    const q = query.trim().toLowerCase();
    // Repli sur la liste paginée si la liste complète n'est pas encore prête
    const source = allPokemons.length > 0 ? allPokemons : pokemons;
    return source.filter((p) => p.name.includes(q));
  }, [isSearching, query, allPokemons, pokemons]);

  // --- Rendu conditionnel : chargement / erreur / succès ---
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e3350d" />
        <Text style={styles.loadingText}>Chargement des Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un Pokémon..."
      />
      <FlatList
        data={displayedData}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            // Au clic : on empile l'écran Detail en lui passant id et name
            onPress={() => navigation.navigate('Detail', { id: item.id, name: item.name })}
          />
        )}
        // --- Scroll infini (désactivé pendant une recherche) ---
        onEndReached={isSearching ? null : loadMorePokemons}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && !isSearching ? (
            <ActivityIndicator
              size="small"
              color="#e3350d"
              style={styles.footerLoader}
            />
          ) : null
        }
        // Message affiché quand la recherche ne donne aucun résultat
        ListEmptyComponent={
          isSearching ? (
            <Text style={styles.emptyText}>Aucun Pokémon trouvé.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  list: {
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    color: '#c0392b',
    fontSize: 16,
  },
  footerLoader: {
    marginVertical: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 40,
  },
});
