# MTG Judge Companion Web App

Web application to quickly and clearly consult the official *Magic: The Gathering* rules.

## Objective

Allow players to search for any rule from the official document immediately using a simple and effective search engine.

---

## Technologies Used

- **Framework**: [Astro](https://astro.build/)
- **Interface**: [React](https://reactjs.org/) for interactive components
- **Database**: JSON file generated from the official document (will be loaded on the client)

---

## Interface Structure

### Main Screen (`/`)

- **Visible and centered search bar**
  - Allows searching by:
    - Rule number (e.g. `603`)
    - Keywords (e.g. `damage`, `stack`, `triggered`)
  - Real-time results with partial matches
  - No suggestions or advanced autocomplete

- **List of main sections**
  - Quick access by category (optional):

  Use [index_rules.txt](requirements/index_rules.txt) to load sections and subsections. It's important to use prefix number because later would help to find rules

---

## Search Results

- Matches are shown by number or content
  - Rule number
  - Fragment with match
- When clicked, access the reading view

---

## Rule View

- Clear and formatted text
- Hierarchically indented subrules
- Read-only
- Navigation by number not included (no next/previous)

---

## Glossary Screen (`/glossary`)

- **Dedicated glossary search interface**
  - Allows searching for Magic terms and definitions
  - Real-time filtering of glossary entries
  - Search by term name or definition content

- **Alphabetical term listing**
  - Terms displayed in alphabetical order
  - Each term shows its complete definition
  - Clean, readable formatting for quick reference

- **Term details**
  - Full definition text for each glossary term
  - Related cross-references where applicable
  - Optimized for quick lookup during gameplay

---

## Data

- Rules will be loaded in a `rules.json` file
- The structure will be optimized for client-side search
- Glossary data will be loaded in `glossary.json` file

---

## Notes

- Additional features like favorites, history, or offline mode are not included
- The application is designed to be lightweight, fast, and usable during a game
- Responsive is a must in all screens
