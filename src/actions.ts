import type ModuleInstance from './main.js'

export type ActionsSchema = {
	sample_action: {
		options: {
			address: string
		}
	}
}

export function UpdateActions(self: ModuleInstance): void {
	self.setActionDefinitions({
		sample_action: {
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
				if (!self.VistaClient) {
					console.log('Module did not initialize client properly')
					return
				}
				await self.VistaClient.send(event.options.address, '')
			},
		},
	})
}
