import type { ModuleSchema } from './main.js'
import type ModuleInstance from './main.js'
import type { CompanionPresetDefinitions, CompanionPresetSection } from '@companion-module/base'

export function UpdatePresets(self: ModuleInstance): void {
	const structure: CompanionPresetSection[] = [
		{
			id: 'console',
			name: 'Console',
			definitions: [
				{
					id: 'pbKeys',
					name: 'Playback Keys',
					description: 'Control default cuelist playback',
					type: 'simple',
					presets: ['spbPlay', 'spbPause'],
				},
			],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {}
	presets['spbPlay'] = {
		type: 'simple',
		name: 'Play',
		style: {
			text: 'Play',
			size: 'auto',
			color: 0xffffff,
			bgcolor: 0x000000,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'spbPlay',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets['spbPause'] = {
		type: 'simple',
		name: 'Pause/Back',
		style: {
			text: 'Pause/Back',
			size: 'auto',
			color: 0xffffff,
			bgcolor: 0x000000,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'spbPauseBack',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	self.setPresetDefinitions(structure, presets)
}
