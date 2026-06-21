import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchPokemonDetails, getPokemonImageUrl } from '../api/pokeapi';
import TypeBadge from '../components/TypeBadge';
import { useFavorites } from '../context/FavoritesContext';

// Traduction des noms de statistiques renvoyés par l'API
const STAT_NAMES_FR = {
  hp: 'PV',
  attack: 'Attaque',
  defense: 'Défense',
  'special-attack': 'Att. Spé.',
  'special-defense': 'Déf. Spé.',
  speed: 'Vitesse',
};

// Valeur max d'une stat de base (sert à calculer la largeur des barres)
const STAT_MAX = 255;

export default function DetailScreen({ route }) {
  // Les paramètres passés par navigation.navigate('Detail', { id, name })
  const { id, name } = route.params;

  // On récupère les fonctions de favoris depuis le Context partagé
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(id);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPokemonDetails(id);
        setDetails(data);
      } catch (e) {
        setError('Impossible de charger ce Pokémon.\nVérifie ta connexion internet.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e3350d" />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* --- En-tête : image, numéro, nom --- */}
      <Image
        source={{ uri: getPokemonImageUrl(details.id) }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.number}>N°{String(details.id).padStart(3, '0')}</Text>
      <Text style={styles.name}>{details.name}</Text>

      {/* --- Bouton favori --- */}
      <Pressable
        onPress={() => toggleFavorite({ id: details.id, name: details.name })}
        style={({ pressed }) => [
          styles.favButton,
          favorite && styles.favButtonActive,
          pressed && styles.favButtonPressed,
        ]}
      >
        <Text style={[styles.favIcon, favorite && styles.favTextActive]}>
          {favorite ? '★' : '☆'}
        </Text>
        <Text style={[styles.favText, favorite && styles.favTextActive]}>
          {favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </Text>
      </Pressable>

      {/* --- Types --- */}
      <View style={styles.typesRow}>
        {details.types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </View>

      {/* --- Caractéristiques physiques --- */}
      {/* L'API renvoie la taille en décimètres et le poids en hectogrammes */}
      <View style={styles.physicalRow}>
        <View style={styles.physicalItem}>
          <Text style={styles.physicalValue}>{details.height / 10} m</Text>
          <Text style={styles.physicalLabel}>Taille</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.physicalItem}>
          <Text style={styles.physicalValue}>{details.weight / 10} kg</Text>
          <Text style={styles.physicalLabel}>Poids</Text>
        </View>
      </View>

      {/* --- Statistiques --- */}
      <Text style={styles.sectionTitle}>Statistiques</Text>
      {details.stats.map((s) => (
        <View key={s.stat.name} style={styles.statRow}>
          <Text style={styles.statName}>
            {STAT_NAMES_FR[s.stat.name] ?? s.stat.name}
          </Text>
          <Text style={styles.statValue}>{s.base_stat}</Text>
          <View style={styles.statBarBackground}>
            <View
              style={[
                styles.statBarFill,
                { width: `${(s.base_stat / STAT_MAX) * 100}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
    color: '#c0392b',
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
  },
  number: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#333',
  },
  favButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e3350d',
    backgroundColor: '#fff',
  },
  favButtonActive: {
    backgroundColor: '#e3350d',
  },
  favButtonPressed: {
    opacity: 0.7,
  },
  favIcon: {
    fontSize: 18,
    color: '#e3350d',
    marginRight: 8,
  },
  favText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#e3350d',
  },
  favTextActive: {
    color: '#fff',
  },
  typesRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  physicalRow: {
    flexDirection: 'row',
    marginTop: 24,
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  physicalItem: {
    alignItems: 'center',
  },
  physicalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  physicalLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  separator: {
    width: 1,
    height: 36,
    backgroundColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  statName: {
    width: 80,
    fontSize: 13,
    color: '#666',
  },
  statValue: {
    width: 40,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginRight: 10,
  },
  statBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#e3350d',
  },
});
