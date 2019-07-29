# Deep Browser Extension

An extension to add leads to DEEP.

## Installation

### Setup dependencies

1. Create `src/vendor` directory and clone `react-store` in it.

        $ git clone https://github.com/toggle-corp/react-store src/vendor/react-store

2. Install node modules using `npm` or `yarn`.

        $ yarn install

### Start browser extension in development mode

Use the `start` command of `npm` or `yarn` to start the development server.

        $ yarn start

The `<deep-browser-extension>/build/` folder now contains the extension.

### Add extension to Chrome

1. Go to the extensions page. `chrome://extensions/`
2. Make sure `Developer mode` is enabled.
3. Click on `Load unpacked` extension.
4. Navigate to and select the directory `<deep-browser-extension>/build/`.
5. Click `Open` and enjoy the extension.

## Configuration for development

### Setup extension

1. Open the browser extension.
2. Click on the `Settings` icon.
3. Select `Localhost` on `Server` field.

> The `Localhost` option is only available when you are running the browser
> extension in development mode.

### Setup deep client

1. Open `<deep>/.env` file.
2. Add new entry `REACT_APP_BROWSER_EXTENSION_ID=<extension-id-on-chrome>`

> You can go to `chrome://extensions/` to view your extension id.

## Building

You can use `npm` or `yarn` to build the extension.

```bash
$ yarn build
```
