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
					description: 'Controls default cuelist playback',
					type: 'simple',
					presets: ['spbPlay', 'spbPause', 'spbPrev', 'spbNext', 'spbSkipToStart', 'spbSkipToEnd'],
				},
			],
		},
	]

	const presets: CompanionPresetDefinitions<ModuleSchema> = {}
	presets['spbPlay'] = {
		type: 'simple',
		name: 'Play',
		style: {
			text: '▶ Play',
			size: '24',
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
			text: '⏸ Pause',
			size: '24',
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
	presets['spbPrev'] = {
		type: 'simple',
		name: 'Previous',
		style: {
			text: '⏮ Prev',
			size: '24',
			color: 0xffffff,
			bgcolor: 0x000000,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'spbPrev',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets['spbNext'] = {
		type: 'simple',
		name: 'Next',
		style: {
			text: '⏭ Next',
			size: '24',
			color: 0xffffff,
			bgcolor: 0x000000,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'spbNext',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets['spbSkipToStart'] = {
		type: 'simple',
		name: 'Skip to beginning',
		style: {
			text: '⏮\nStart',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'spbSkipToStart',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}
	presets['spbSkipToEnd'] = {
		type: 'simple',
		name: 'Skip to end',
		style: {
			text: '⏭\nEnd',
			size: '18',
			color: 0xffffff,
			bgcolor: 0x000000,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'spbSkipToEnd',
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
