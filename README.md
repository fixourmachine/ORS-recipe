# ORS Recipes

A compact, offline-ready web app for scaling oral rehydration solution recipes to the volume you need.

## Features

- Works offline after the first successful load
- Installable as a lightweight app
- Scale recipes from 50 mL to 5 L
- Weight or spoon measurements where supported
- Composition displayed in mmol/L
- Shareable recipe URLs
- Printable one-page recipes
- Locally saved custom recipes
- Versioned recipe updates

## Included recipes

- St Mark’s solution
- WHO reduced-osmolarity ORS
- Dioralyte
- Dioralyte at 8 or 10 sachets per litre
- Dioralyte Relief
- Clinova O.R.S Hydration Tablets
- Pedialyte reference composition
- Pocari Sweat-style glucose recipe

Supported substitutions include:

- Sodium bicarbonate and source-supported trisodium citrate dihydrate variants
- Anhydrous glucose and glucose monohydrate
- Potassium chloride and LoSalt Original, with table salt adjusted automatically

## Install

Open the app in a supported browser and select **Install app**.

On iPhone or iPad, open it in Safari and choose **Share → Add to Home Screen**.

Load the app successfully once before relying on it without a connection.

## Sharing and printing

The current recipe, volume and ingredient choices are encoded in the URL. Use **Share** to send the recipe or save it as a bookmark.

Use **Print** to create a clean paper copy or save the recipe as a PDF.

## Privacy

The app has no analytics, advertising, accounts or upload service. Recipes and preferences are stored locally in the browser.

Shared links intentionally contain the selected recipe data in the URL. Anyone receiving such a link can read that recipe.

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

## Sources

Formulae include links to their primary references, including BIFA, NHS Specialist Pharmacy Service, WHO, electronic Medicines Compendium, Guy’s and St Thomas’, Abbott and Otsuka.

The app keeps published product composition separate from calculated raw-ingredient composition. Unknown pH values remain unreported, and osmotic values are labelled as reported, declared or calculated.
