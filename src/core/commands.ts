import type { SomeCompanionActionInputField } from '@companion-module/base'

export interface VistaCommands {
	id: string
	name: string
	osc: string
	description?: string
	options?: SomeCompanionActionInputField<string>[]
}

export const COMMANDS: VistaCommands[] = [
	{
		id: 'highlight',
		name: 'Toggle Highlight',
		osc: '/V3/global/highlight',
	},
	{
		id: 'lampOff',
		name: 'Lamp Off Macro',
		osc: '/V3/global/lampOffMacro',
	},
	{
		id: 'lampOn',
		name: 'Lamp On Macro',
		osc: '/V3/global/lampOnMacro',
	},
	{
		id: 'solo',
		name: 'Toggle Solo',
		osc: '/V3/global/solo',
	},
	{
		id: 'quickUpdate',
		name: 'Quick Update',
		osc: '/V3/global/quickUpdate',
	},
	{
		id: 'clearProgrammer',
		name: 'Clear Programmer',
		osc: '/V3/global/clearProgrammer',
	},
]
