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
import * as fs from 'fs'
import * as pathjs from 'path'

const NODE_MODULES_PATH = './node_modules/'

interface IOptions {
	/**
	 * The path to the node_modules directory.
	 * @default './node_modules/'
	 */
	nodeModulesPath?: string
	/**
	 * Glob patterns to ignore.
	 */
	ignore?: string[]
}

async function disableNodeModulesIssues() {
	let foundFilesThatWerentIgnored = false
	async function recurse(path: string) {
		const names = await fs.promises.readdir(path)
		for (const name of names) {
			if (name.startsWith('.')) continue
			const childPath = pathjs.join(path, name)
			const stat = fs.statSync(childPath)
			if (stat.isDirectory()) {
				await recurse(childPath)
			} else {
				if (childPath.endsWith('.ts')) {
					const content = await fs.promises.readFile(childPath, 'utf-8')
					if (content.startsWith('// @ts-nocheck\n')) continue
					const newContent = '// @ts-nocheck\n' + content
					await fs.promises.writeFile(childPath, newContent)
					foundFilesThatWerentIgnored = true
				}
			}
		}
	}

	console.log('⛔ Disabling TypeScript issues in all node_modules...')
	if (foundFilesThatWerentIgnored) {
		console.log('⚠️ Found some files that were not ignored before this patch run.')
		console.log(
			'\tPlease restart the TS language server to update the problems view. (F1 + "TypeScript: Restart TS server" in VSCode)'
		)
	}
	await recurse(NODE_MODULES_PATH)
	console.log('✅ Disabled TypeScript issues in all node_modules')
}

export default function esbuildPlugin(): Plugin {
	return {
		name: 'node-modules-vscode-problems-patch',
		async setup() {
			await disableNodeModulesIssues()
		},
	}
}

if (require.main === module) {
	disableNodeModulesIssues()
}
