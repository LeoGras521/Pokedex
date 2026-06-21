import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from './src/context/FavoritesContext';
import HomeScreen from './src/screens/HomeScreen';
import DetailScreen from './src/screens/DetailScreen';

// La "pile" d'écrans : on empile l'écran détail par-dessus la liste,
// le bouton retour le dépile.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // FavoritesProvider doit envelopper toute l'app pour que tous
    // les écrans aient accès aux favoris.
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            // Style commun à tous les headers
            headerStyle: { backgroundColor: '#e3350d' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Pokédex' }}
          />
          <Stack.Screen
            name="Detail"
            component={DetailScreen}
            // Le titre du header = le nom du Pokémon cliqué (passé en paramètre)
            options={({ route }) => ({
              title:
                route.params.name.charAt(0).toUpperCase() +
                route.params.name.slice(1),
            })}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </FavoritesProvider>
  );
}
