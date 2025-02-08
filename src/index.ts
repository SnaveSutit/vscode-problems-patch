/**!
 *
 * node-modules-vscode-problems-patch
 *
 * Patches the problems view to hide node_module typescript issues
 *
 * LICENSE
 *
 * MIT License
 *
 * Copyright (c) 2025 Titus Evans
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { Plugin } from 'esbuild'
import { glob } from 'glob'
import * as fs from 'fs'
import { fileURLToPath } from 'url'

const DEFAULT_GLOB = '**/node_modules/**/*.ts'

interface IOptions {
	// I had to use a weird unicode character to prevent the default
	// glob from being interpreted as the end of the comment
	/**
	 * The path to the node_modules directory.
	 *
	 * Defaults to **&#8205;/node_modules/**&#8205;/*.ts
	 */
	nodeModulesGlob?: string
	/**
	 * Glob patterns to ignore.
	 * @default undefined
	 */
	ignore?: string[]
	/**
	 * The text to add to the top of the file to disable TypeScript issues.
	 * @default `// @ts-nocheck\n`
	 */
	comment?: string
	/**
	 * Whether to suppress unimportant logs.
	 */
	quiet?: boolean
}

async function disableNodeModulesIssues(options?: IOptions) {
	const {
		nodeModulesGlob = DEFAULT_GLOB,
		ignore,
		comment = '// @ts-no-check\n',
		quiet,
	} = options ?? {}

	const paths = await glob(nodeModulesGlob, { ignore })

	let filesThatWerentIgnored = 0
	!quiet && console.log('⛔ Disabling TypeScript issues in all node_modules...')
	for (const path of paths) {
		const content = await fs.promises.readFile(path, 'utf-8')
		if (content.startsWith(comment)) continue
		// Add the comment
		const newContent = comment + content
		await fs.promises.writeFile(path, newContent)
		filesThatWerentIgnored++
	}

	if (filesThatWerentIgnored > 0) {
		console.log(
			`⚠️ Found ${filesThatWerentIgnored} file(s) that were not ignored before this patch run.`
		)
		console.log(
			'\tPlease restart the TS language server to update the problems view. (F1 + "TypeScript: Restart TS server" in VSCode)'
		)
	}
	!quiet && console.log('✅ Disabled TypeScript issues in all node_modules')
}

export default function esbuildPlugin(options?: IOptions): Plugin {
	return {
		name: 'node-modules-vscode-problems-patch',
		async setup() {
			await disableNodeModulesIssues(options)
		},
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	disableNodeModulesIssues()
}
