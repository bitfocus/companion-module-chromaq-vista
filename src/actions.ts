import type { CompanionActionDefinitions, CompanionOptionValues } from '@companion-module/base'
import { COMMANDS } from './core/commands.js'
import type ModuleInstance from './main.js'

type VistaActionSchema = {
	options: CompanionOptionValues
}

export type ActionsSchema = Record<string, VistaActionSchema>

export function UpdateActions(self: ModuleInstance): void {
	const actions: CompanionActionDefinitions<ActionsSchema> = {}

	actions[`sample_action`] = {
		name: 'Send custom message without args',
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
			await self.VistaClient.send(address, '')
		},
	}

	for (const c of COMMANDS) {
		actions[c.id] = {
			name: c.name,

			options: c.options ?? [],

			callback: async () => {
				if (!self.VistaClient) {
					console.log('Module did not initialize client properly')
					return
				}
				await self.VistaClient.send(c.osc, '')
			},
		}
	}
	self.setActionDefinitions(actions)
}
