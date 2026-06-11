import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { getPokemonImageUrl } from '../api/pokeapi';

/**
 * Carte réutilisable affichant un Pokémon (image + numéro + nom).
 * Props :
 *  - pokemon : { id, name }
 *  - onPress : fonction appelée au clic (servira pour la navigation)
 */
export default function PokemonCard({ pokemon, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <Image
        source={{ uri: getPokemonImageUrl(pokemon.id) }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.number}>N°{String(pokemon.id).padStart(3, '0')}</Text>
      <Text style={styles.name}>{pokemon.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    // Ombre légère (elevation pour Android, shadow* pour iOS)
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardPressed: {
    opacity: 0.7,
  },
  image: {
    width: 90,
    height: 90,
  },
  number: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#333',
  },
});
