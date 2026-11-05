import type { MscSettings } from './core/msc.js'
import { Regex, type SomeCompanionConfigField } from '@companion-module/base'

export type ModuleConfig = MscSettings & {
	oscEnabled?: boolean
	host: string
	sendPort: number
	listenPort: number
	verbose: boolean
}

export function GetConfigFields(ports: string[] = []): SomeCompanionConfigField[] {
	return [
		{ type: 'checkbox', id: 'oscEnabled', label: 'Enable OSC', default: true, width: 6 },
		{ type: 'checkbox', id: 'mscEnabled', label: 'Enable MIDI Show Control output', default: false, width: 6 },
		{
			type: 'dropdown',
			id: 'midiPort',
			label: 'MIDI output port (save to refresh ports)',
			default: '',
			width: 12,
			choices: [{ id: '', label: 'Select a MIDI output port' }, ...ports.map((port) => ({ id: port, label: port }))],
		},
		{
			type: 'number',
			id: 'deviceId',
			label: 'MSC device ID (decimal; 127 = broadcast)',
			min: 0,
			max: 127,
			default: 1,
			width: 6,
		},
		{
			type: 'number',
			id: 'commandFormat',
			label: 'MSC command format (decimal; Vista uses 1 = Lighting)',
			min: 0,
			max: 127,
			default: 1,
			width: 6,
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'sendPort',
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 8000,
		},
		{
			type: 'number',
			id: 'listenPort',
			label: 'Listen Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 9000,
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Enable verbose logging',
			default: false,
			width: 4,
		},
	]
}
