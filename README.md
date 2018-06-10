# Deep Browser Extension

An extension to add leads to DEEP.

## Installation

### Setup dependencies

1. Create `src/vendor` directory and clone `react-store` in it.
```bash
$ git clone https://github.com/toggle-corp/react-store src/vendor/react-store
```
2. Copy `_user-imports-sample.scss` to `_user-imports.scss` in the stylesheets directory of react-store.
```bash
$ cp vendor/react-store/stylesheets/_user-imports-sample.scss vendor/react-store/stylesheets/_user-imports.scss
```
3. Install node modules using `npm` or `yarn`.
```bash
$ yarn install
```

### Start browser extension in development mode

Use the `start` command of `npm` or `yarn` to start the development server.

```bash
yarn start
```

The build folder now contains the extension.

### Install to chrome

1. Go to the extensions page in the Chrome.
```
chrome://extensions/
```
2. Make sure `Developer mode` is turned on.
3. Click on `Load unpacked` extension.
4. Navigate to and select the directory `<browser-extension>/build`.
5. Enjoy the extension.

### Configuring deep client to work with browser extension

Open the `<client>/src/utils/browserExtension.js` file and modify the `extensionId` variable to match your
extension id provided by chrome. You can go to `chrome://extensions/` to view your extension id.

### Configuring browser extension to work on localhost

1. Open the browser extension on chrome.
2. Click on the settings icon.
3. Select `localhost` from the dropdown.

Note: the localhost option is only available when you are running the browser extension in development mode.

### Build browser extension

You can use `npm` or `yarn` to build the extension.

```bash
$ yarn build
```
