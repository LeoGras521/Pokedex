import { StyleSheet, TextInput, View } from 'react-native';

/**
 * Barre de recherche réutilisable (composant contrôlé).
 * Props :
 *  - value      : le texte actuel (vient de l'état du parent)
 *  - onChangeText : fonction appelée à chaque frappe
 *  - placeholder : texte grisé affiché quand le champ est vide
 */
export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Rechercher...'}
        placeholderTextColor="#999"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f2f2f2',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
});
