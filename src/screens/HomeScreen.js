import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  fetchAllPokemonNames,
  fetchPokemonList,
  getPokemonId,
} from '../api/pokeapi';
import ErrorView from '../components/ErrorView';
import PokemonCard from '../components/PokemonCard';
import SearchBar from '../components/SearchBar';
import { useFavorites } from '../context/FavoritesContext';

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

  // --- Favoris ---
  // On lit les favoris depuis le Context partagé
  const { favorites, isFavorite } = useFavorites();
  // showFavoritesOnly : filtre "n'afficher que mes favoris"
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

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
  // Le scroll infini ne sert que pour la navigation normale (ni recherche, ni favoris)
  const isBrowsing = !isSearching && !showFavoritesOnly;

  // Données affichées, par ordre de priorité :
  //  - favoris uniquement : la liste des favoris (éventuellement re-filtrée par nom)
  //  - recherche          : la liste complète filtrée par nom
  //  - sinon              : la liste paginée habituelle
  // useMemo évite de recalculer à chaque rendu inutilement.
  const displayedData = useMemo(() => {
    // Source de départ selon le mode
    let source;
    if (showFavoritesOnly) {
      source = favorites;
    } else if (isSearching) {
      // Repli sur la liste paginée si la liste complète n'est pas encore prête
      source = allPokemons.length > 0 ? allPokemons : pokemons;
    } else {
      source = pokemons;
    }
    // Filtre par nom si une recherche est en cours
    if (isSearching) {
      const q = query.trim().toLowerCase();
      return source.filter((p) => p.name.includes(q));
    }
    return source;
  }, [showFavoritesOnly, favorites, isSearching, query, allPokemons, pokemons]);

  // --- Rendu conditionnel : chargement / erreur / succès ---
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e3350d" />
        <Text style={styles.loadingText}>Chargement des Pokémon...</Text>
      </View>
    );
  }

  // En cas d'erreur au chargement initial : message + bouton réessayer
  if (error) {
    return <ErrorView message={error} onRetry={loadPokemons} />;
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher un Pokémon..."
      />
      {/* Filtre favoris : bascule entre "tous" et "mes favoris" */}
      <Pressable
        onPress={() => setShowFavoritesOnly((v) => !v)}
        style={({ pressed }) => [
          styles.filterButton,
          showFavoritesOnly && styles.filterButtonActive,
          pressed && styles.filterButtonPressed,
        ]}
      >
        <Text style={[styles.filterText, showFavoritesOnly && styles.filterTextActive]}>
          {showFavoritesOnly
            ? `★ Favoris (${favorites.length})`
            : '☆ Voir mes favoris'}
        </Text>
      </Pressable>
      <FlatList
        data={displayedData}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            isFavorite={isFavorite(item.id)}
            // Au clic : on empile l'écran Detail en lui passant id et name
            onPress={() => navigation.navigate('Detail', { id: item.id, name: item.name })}
          />
        )}
        // --- Scroll infini (uniquement en navigation normale) ---
        onEndReached={isBrowsing ? loadMorePokemons : null}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore && isBrowsing ? (
            <ActivityIndicator
              size="small"
              color="#e3350d"
              style={styles.footerLoader}
            />
          ) : null
        }
        // Message affiché quand il n'y a rien à montrer (recherche ou favoris vides)
        ListEmptyComponent={
          showFavoritesOnly ? (
            <Text style={styles.emptyText}>Aucun favori pour l'instant.</Text>
          ) : isSearching ? (
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
  filterButton: {
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e3350d',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e3350d',
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterText: {
    color: '#e3350d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
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
