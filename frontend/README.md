# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

- Diseño: mobile first
- Colores: light and dark mode con un switch p cambiar
- CRUD completo de listas como items
    WIP:
      TodoItems: 
      - PUT (falta checkbox)
      - POST
      - DELETE
      - GET all by list id

      - Falta: Get by list item id (buscar un item dentro de una lista)

      Todolist:
      - GET all todo lists
      - DELETE 
      - POST
      - PUT
      - GET by Id

- Drag and drop de items dentro de una lista (orden) y guardar en el navegador ese orden
- Tests (no todo pero algo)
- Funcionalidad de los checks para eso necesito (v)
- Optimistic updates: CONTEXT!!!!!!!!
-Input validations

- Si uso IA, exportar los prompt

- NTH: paginación
- NTH: Error toasts.