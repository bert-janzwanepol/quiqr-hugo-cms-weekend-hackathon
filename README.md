# quiqr-hugo-cms-weekend-hackathon

## Disclaimer

This project is just a fun weekend experiment, in no way ment to be feature-complete, backwards-, or api-compatible, fully tested, or a replacement for the existing [Quiqr Desktop](https://github.com/quiqr/quiqr-desktop) project.

This project does not use any code from the existing Quiqr Desktop app.
Right now we just read and display existing [Quiqr Desktop](https://github.com/quiqr/quiqr-desktop) config files.

### Notable packages/deviations from the existing Quiqr Desktop app

- [electron-vite](https://github.com/electron-vite/electron-vite-react)
- [@TanStack/router](https://github.com/TanStack/router)
- [@TanStack/react-query](https://github.com/TanStack/query/tree/main/packages/react-query)
- [@egoist/tipc](https://github.com/egoist/tipc) for typesafe ipc calls
- [Typescript](https://github.com/microsoft/TypeScript)
- [zod](https://github.com/colinhacks/zod) instead of [joi](https://github.com/hapijs/joi)
- [shadcn-ui/ui](https://github.com/shadcn-ui/ui)

## Project Setup

This project assumes you use `pnpm` instead of `npm`.  
If you do not want to install `pnpm`, please replace `pnpm` with `npm` or `yarn` in the `package.json` scripts.

We also assume you have worked with Quiqr CMS before and have some existing Quiqr sites in the appropriate directories:
e.g. /home/username/Quiqr/sites, because config/filepath validations are non-existent right now.

### Install

```bash
$ pnpm install
```

### Development

```bash
$ pnpm dev
```

### Build

#### Note: if you are on linux, you need wine to build windows

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
