# Pokédex Mobile — React Native (Expo)

Application mobile permettant d'explorer l'univers des Pokémon, développée en
React Native avec Expo. Les données proviennent de la [PokéAPI](https://pokeapi.co),
une API publique et gratuite (aucune clé requise).

## Fonctionnalités

- **Liste des Pokémon** : affichage en grille (image + numéro + nom) depuis la PokéAPI.
- **Scroll infini** : les Pokémon se chargent au fur et à mesure du défilement (pagination).
- **Écran détail** : image, types, statistiques (PV, attaque, défense...) et
  caractéristiques physiques (taille, poids).
- **Recherche** : filtrage par nom parmi **tous** les Pokémon (pas seulement ceux affichés).
- **Favoris** : ajout/retrait de favoris, conservés même après fermeture de l'app
  (persistance locale via AsyncStorage), avec un filtre « Voir mes favoris ».
- **Gestion des erreurs** : message clair et bouton « Réessayer » en cas de problème réseau.

## Prérequis

- [Node.js](https://nodejs.org) (version 18 ou supérieure)
- L'application **Expo Go** installée sur ton téléphone
  ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) /
  [iOS](https://apps.apple.com/app/expo-go/id982107779)),
  ou un émulateur Android / simulateur iOS.

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/LeoGras521/Pokedex.git
cd Pokedex

# 2. Installer les dépendances
npm install
```

## Lancer l'application

```bash
npx expo start
```

Un QR code s'affiche dans le terminal :

- **Sur téléphone** : scanne le QR code avec l'app **Expo Go**
  (Android : depuis l'app Expo Go ; iOS : avec l'appareil photo).
- **Sur émulateur Android** : appuie sur la touche `a` dans le terminal.
- **Sur simulateur iOS** (macOS uniquement) : appuie sur la touche `i`.

> L'application et le téléphone doivent être sur le **même réseau Wi-Fi**.

## Structure du projet

```
Pokedex/
├── App.js                        # Point d'entrée : navigation + provider favoris
└── src/
    ├── api/
    │   └── pokeapi.js            # Tous les appels réseau vers la PokéAPI
    ├── components/               # Composants réutilisables
    │   ├── PokemonCard.js        # Carte d'un Pokémon dans la liste
    │   ├── SearchBar.js          # Barre de recherche
    │   ├── TypeBadge.js          # Badge coloré d'un type
    │   └── ErrorView.js          # Affichage d'erreur + bouton réessayer
    ├── context/
    │   └── FavoritesContext.js   # État global des favoris + persistance
    └── screens/
        ├── HomeScreen.js         # Écran liste (recherche, scroll infini, favoris)
        └── DetailScreen.js       # Écran détail d'un Pokémon
```

## Technologies utilisées

- **React Native** + **Expo** (SDK 56)
- **React Navigation** (native-stack) pour la navigation entre écrans
- **AsyncStorage** pour la persistance locale des favoris
- **fetch** + **async/await** pour les appels réseau
- **Context API** + **hooks** (useState, useEffect, useMemo) pour la gestion d'état
