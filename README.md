## Workspace Setup

Install [pnpm](https://pnpm.io/installation) if you haven't already. Make sure pnpm's version is at least 10.0.0.

```
pnpm install
```

## Development

```
pnpm dev
```

It will start a development server and open a Chrome browser instance for extension development.

### Libraries

We leverage several libraries to build the UI:

- [WXT](https://wxt.dev/), the extension framework.
- [React 19](https://react.dev/). [React Compiler](https://react.dev/learn/react-compiler) is also used to handle memoization automatically so no need for `useMemo`, `useCallback`, `memo`, etc.
- [tailwindcss](https://tailwindcss.com/) for styling. Check all kinds of utilities in [docs](https://tailwindcss.com/docs).
- [shadcn](https://ui.shadcn.com/) for UI components. Refer to the document of each comopnent for instructions. Installed UI components are located in `common/components/ui`.
- [React Router](https://reactrouter.com/start/library/routing) for routing. We're using the library mode of React Router, so please refer to the documents under the Library section.

#### React Devtools

To use React Devtools, use the following command:

```
# To debug React in popup
pnpm react-devtools:popup
# To debug React dashboard
pnpm react-devtools:dashboard
```

### Entry Points

- `entrypoints/popup` for the popup.
- `entrypoints/dashboard` for the standalone dashboard page.
- `entrypoints/background` for the background script.
