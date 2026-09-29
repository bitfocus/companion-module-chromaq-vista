import type { CompanionActionDefinitions, CompanionOptionValues } from '@companion-module/base'
import { COMMANDS } from './core/commands.js'
import type ModuleInstance from './main.js'

type VistaActionSchema = {
	options: CompanionOptionValues
}

export type ActionsSchema = Record<string, VistaActionSchema>

function resolveAddress(template: string, options: Record<string, unknown>): string {
	return template.replace(/\$\{(\w+)\}/g, (_, key) => {
		const value = options[key]

		if (value === undefined || value === null) {
			throw new Error(`Missing OSC parameter: ${key}`)
		}

		if (typeof value === 'string') return value
		if (typeof value === 'number') return value.toString()
		if (typeof value === 'boolean') return value ? 'true' : 'false'

		throw new Error(`Invalid OSC parameter type for "${key}"`)
	})
}

export function UpdateActions(self: ModuleInstance): void {
	const actions: CompanionActionDefinitions<ActionsSchema> = {}

	actions[`sample_action`] = {
		name: 'Custom: Send message without arguments',
		options: [
			{
				id: 'address',
				type: 'textinput',
				label: 'OSC Address',
				default: '',
			},
		],
		callback: async (event) => {
			const address = event.options.address as string
			if (!self.VistaClient) {
				console.log('Module did not initialize client properly')
				return
			}
			await self.VistaClient.send(address, [''])
		},
	}

	for (const c of COMMANDS) {
		actions[c.id] = {
			name: c.name,
			description: c.description,
			options: c.options ?? [],

			callback: async (event) => {
				if (!self.VistaClient) {
					console.log('Module did not initialize client properly')
					return
				}

				const address = resolveAddress(c.osc, event.options)
				let args: string[]
				if (typeof c.args === 'function') {
					args = c.args(event.options)
				} else {
					args = c.args ?? ['']
				}

				await self.VistaClient.send(address, args)

				if (c.requiresButtonUnpress) {
					setTimeout(() => {
						if (!self.VistaClient) {
							console.log('Module did not initialize client properly')
							return
						}
						void self.VistaClient.send(address, ['false'])
					}, 20)
				}
			},
		}
	}
	self.setActionDefinitions(actions)
}
