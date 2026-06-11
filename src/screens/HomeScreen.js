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

export default function HomeScreen() {
  // --- État de l'écran ---
  // pokemons : les données affichées dans la liste
  // loading  : vrai pendant le chargement initial (affiche le spinner)
  // error    : message d'erreur si l'appel réseau échoue
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charge la première page de Pokémon depuis l'API
  const loadPokemons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPokemonList(0, PAGE_SIZE);
      // On transforme { name, url } en { id, name } plus pratique à utiliser
      const items = data.results.map((p) => ({
        id: getPokemonId(p.url),
        name: p.name,
      }));
      setPokemons(items);
    } catch (e) {
      setError('Impossible de charger les Pokémon.\nVérifie ta connexion internet.');
    } finally {
      setLoading(false);
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
        renderItem={({ item }) => <PokemonCard pokemon={item} />}
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
});
