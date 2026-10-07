# ORS Recipes

A compact, offline-ready calculator for scaling and adapting oral rehydration solution recipes using the ingredients and volume you have.

**[Open ORS Recipes](https://fixourmachine.github.io/ORS-recipe/)**

## Features

- Works offline after the first successful load
- Installable as a lightweight app
- Scales recipes from 50 mL to 5 L
- Weight or spoon measurements where supported
- Composition displayed in mmol/L
- Shareable recipe URLs
- Clean printable recipes
- Locally saved custom recipes
- Versioned recipe updates

## Included recipes

- St Mark’s solution
- WHO reduced-osmolarity ORS
- Home-made "Dioralyte" style drink
- Home-made "O.R.S. tablet" style drink
- Home-made "Pedialyte" style drink
- Home-made "Pocari Sweat" style glucose drink

Supported ingredient choices include:

- Sodium bicarbonate and source-supported trisodium citrate dihydrate variants, as availability varies across geographies
- Anhydrous glucose and glucose monohydrate
- Potassium chloride and LoSalt Original, with table salt adjusted automatically, for people who can't access potassium chloride

## Install

Open the app and select **Install app** when your browser offers it.

On iPhone or iPad, open it in Safari and choose **Share → Add to Home Screen**.

Load the app successfully once before relying on it without a connection.

## Sharing and printing

The selected recipe, volume and ingredient choices are encoded in the URL. Use **Share** to send a recipe or save it as a bookmark.

Use **Print** to make a clean paper copy or save the recipe as a PDF.

## Privacy

The app has no analytics, advertising, accounts or upload service. Recipes and preferences are stored locally in the browser.

Shared links intentionally contain the selected recipe data in the URL. Anyone receiving a shared link can read that recipe.

## Running locally

```sh
npm start
```

Then open:

```text
http://127.0.0.1:4173
```

## Validation

```sh
npm test
npm run test:release
npm run test:updates
```

These checks cover calculations, substitutions, sharing, printing, responsive layouts, recipe updates and offline operation.

## Sources and calculation notes

Formulae include links to their primary references, including BIFA, NHS Specialist Pharmacy Service, WHO, electronic Medicines Compendium, Guy’s and St Thomas’, Abbott and Otsuka.

Published product composition is kept separate from calculated raw-ingredient composition. Unknown pH values remain unreported, and osmotic values are identified as reported, declared or calculated.
