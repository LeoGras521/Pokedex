import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchPokemonList, getPokemonId } from '../api/pokeapi';
import PokemonCard from '../components/PokemonCard';

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

  // useEffect avec [] : s'exécute UNE seule fois, au montage de l'écran
  useEffect(() => {
    loadPokemons();
  }, []);

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
      <FlatList
        data={pokemons}
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
        // --- Scroll infini ---
        onEndReached={loadMorePokemons}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color="#e3350d"
              style={styles.footerLoader}
            />
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
});
