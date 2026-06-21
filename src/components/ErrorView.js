import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Affichage d'erreur réutilisable avec un bouton "Réessayer".
 * Props :
 *  - message : le texte d'erreur à afficher
 *  - onRetry : fonction appelée quand on appuie sur "Réessayer"
 */
export default function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Réessayer</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    color: '#c0392b',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e3350d',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
