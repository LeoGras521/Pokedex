import { StyleSheet, Text, View } from 'react-native';

// Couleurs officielles des 18 types Pokémon
const TYPE_COLORS = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

// Traduction française des noms de types renvoyés par l'API (en anglais)
const TYPE_NAMES_FR = {
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  electric: 'Électrik',
  grass: 'Plante',
  ice: 'Glace',
  fighting: 'Combat',
  poison: 'Poison',
  ground: 'Sol',
  flying: 'Vol',
  psychic: 'Psy',
  bug: 'Insecte',
  rock: 'Roche',
  ghost: 'Spectre',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  steel: 'Acier',
  fairy: 'Fée',
};

/**
 * Badge coloré affichant un type de Pokémon.
 * Props :
 *  - type : nom anglais du type renvoyé par l'API (ex: "fire")
 */
export default function TypeBadge({ type }) {
  return (
    <View style={[styles.badge, { backgroundColor: TYPE_COLORS[type] ?? '#777' }]}>
      <Text style={styles.text}>{TYPE_NAMES_FR[type] ?? type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
