# VSCode Problems Patch

This tool adds a comment to the top of every `.ts` and `.d.ts` file in your project's `./node_modules` directory to prevent VSCode from showing problems from these files.

_Note that this will prevent the TypeScript compiler from checking these files for type errors when compiling your project._

## Usage

### CLI

```bash
npx node-modules-vscode-problems-patch
```

### ESBuild Plugin

You can import the `node-modules-vscode-problems-patch` package and use it as an ESBuild plugin in your build script.

```javascript
import * as esbuild from 'esbuild'
import vscodeProblemsPatchPlugin from 'node-modules-vscode-problems-patch'

await esbuild.build({
	// ...
	plugins: [vscodeProblemsPatchPlugin()],
	// ...
})
```

## Contributing

### Setup

-   Clone the repository
-   Run `yarn install`
-   Run `yarn dev`

### Testing

-   Run `yarn start` to run the local build
