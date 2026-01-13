
# 🌌 ARC Raiders Database

![ARC Raiders Banner](https://cdn.arctracker.io/items/acoustic_guitar.png)  
*A modern, high-performance database and companion app for ARC Raiders.*

[![Built with Astro](https://img.shields.io/badge/Built%20with-Astro-ff5a1f?style=flat-square&logo=astro)](https://astro.build)
[![Calculated with React](https://img.shields.io/badge/Interactive-React-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Styled with Tailwind](https://img.shields.io/badge/Styled%20with-Tailwind%20v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

---

## 🚀 Overview

This project is a complete overhaul of the ARC Raiders database, built to provide a **premium, fast, and responsive** experience for players. It serves as a comprehensive reference for items, crafting recipes, and hideout upgrades.

### ✨ Key Features

*   **🔍 Advanced Item Database**: 
    *   **Instant Search**: Real-time filtering by name and category.
    *   **Smart Filtering**: Browse by specific types (Weapons, Meds, Materials).
    *   **Rarity Visuals**: Color-coded borders and glows (Common to Legendary).
    *   **Compact Mode**: Toggle between detailed cards and a dense grid view.

*   **🛠️ Workshop Companion**: 
    *   Browse crafting recipes for weapons, modifications, and gadgets.
    *   **Categorized View**: Quickly jump between Assault Rifles, SMGs, Tools, etc.
    *   **Ingredient Breakdown**: See exactly what materials you need for each upgrade.

*   **🏠 Hideout Station Tracker**: 
    *   Detailed upgrade paths for all stations (**Weapon Bench**, **Med Station**, **Scrappy**, etc.).
    *   Level-by-level requirement lists.

*   **⚡ Modern Tech Stack**:
    *   **Astro**: For lightning-fast static page loads.
    *   **React**: For rich, interactive UI components.
    *   **Tailwind CSS v4**: For a sleek, maintainable design system.
    *   **Framer Motion**: For smooth, satisfying animations.

---

## 📦 Data Source

Data is automatically sourced and synchronized from the community repository:
`RaidTheory/arcraiders-data`

The project includes a robust **fetch script** (`scripts/update-data.mjs`) that:
1.  Downloads the latest JSON definitions.
2.  Auto-discovers new stations and items.
3.  Optimizes data for the application.

---

## 🛠️ Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/arc-raiders-db.git
    cd arc-raiders-db
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Fetch latest data**
    ```bash
    npm run update-data
    ```

4.  **Start development server**
    ```bash
    npm run dev
    ```

---

## 🎨 Visual Style

The application features a dark, immersive theme inspired by the game's aesthetic:
*   **Deep Space Backgrounds**: Custom radial gradients and ambient lighting.
*   **Glassmorphism**: Translucent UI elements with backdrop blurs.
*   **Neon Accents**: ARC Orange and Rarity colors used strategically for focus.

---

## 🤝 Contributing

Contributions are welcome! If you find a missing item or want to improve the UI:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes.
4.  Open a Pull Request.

---

*Built with ❤️ for the ARC Raiders community.*
