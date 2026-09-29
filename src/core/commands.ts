import type { SomeCompanionActionInputField } from '@companion-module/base'

export interface VistaCommands {
	id: string
	name: string
	osc: string
	description?: string
	args?: string[] | ((options: Record<string, unknown>) => string[])
	options?: SomeCompanionActionInputField<string>[]
	requiresButtonUnpress?: boolean
}

export const COMMANDS: VistaCommands[] = [
	// Action Grid
	{
		id: 'actionGridButton',
		name: 'Action Grid: Trigger Button',
		osc: '/V3/actionGrid/${actionGrid}/button/row/${row}/col/${col}',
		options: [
			{
				id: 'actionGrid',
				type: 'number',
				label: 'Action Grid',
				min: 1,
				max: 100,
				default: 1,
			},
			{
				id: 'row',
				type: 'number',
				label: 'Row',
				min: 1,
				max: 100,
				default: 1,
			},
			{
				id: 'col',
				type: 'number',
				label: 'Column',
				min: 1,
				max: 100,
				default: 1,
			},
		],
		args: ['true'],
	},
	// Console
	{
		id: 'gmFader',
		name: 'Console: Grandmaster fader',
		osc: '/V3/console/EX/1/gmFader',
		options: [
			{
				id: 'level',
				type: 'number',
				label: 'Fader position',
				min: 0,
				max: 100,
				default: 100,
			},
		],
		args: (options: Record<string, unknown>): string[] => {
			const level = Number(options.level)

			if (Number.isNaN(level)) throw new Error(`Invalid level: ${options.level}`)

			return [(level / 100).toString()]
		},
	},
	{
		id: 'playbackButton',
		name: 'Console: Playback button',
		osc: '/V3/console/EX/1/playbackButton/panel/${panel}/bank/${bank}/row/${row}/col/${col}',
		description:
			'Trigger a console playback button. WARNING: sending an out-of-range request has been known to crash Vista.',
		options: [
			{
				id: 'panel',
				type: 'number',
				label: 'panel',
				min: 0,
				max: 10,
				default: 0,
			},
			{
				id: 'bank',
				type: 'number',
				label: 'bank',
				min: 0,
				max: 100,
				default: 0,
			},
			{
				id: 'row',
				type: 'number',
				label: 'Row',
				min: 0,
				max: 11,
				default: 0,
			},
			{
				id: 'col',
				type: 'number',
				label: 'Column',
				min: 0,
				max: 59,
				default: 0,
			},
		],
		args: ['true'],
		requiresButtonUnpress: true,
	},
	{
		id: 'playbackFader',
		name: 'Console: Playback fader',
		osc: '/V3/console/EX/1/playbackFader/panel/${panel}/col/${col}',
		description:
			'Adjusts the level of a console playback fader. WARNING: sending an out-of-range request has been known to crash Vista.',
		options: [
			{
				id: 'level',
				type: 'number',
				label: 'Fader position',
				min: 0,
				max: 100,
				default: 100,
			},
			{
				id: 'panel',
				type: 'number',
				label: 'panel',
				min: 0,
				max: 10,
				default: 0,
			},
			{
				id: 'col',
				type: 'number',
				label: 'Column',
				min: 0,
				max: 100,
				default: 0,
			},
		],
		args: (options: Record<string, unknown>): string[] => {
			const level = Number(options.level)

			if (Number.isNaN(level)) throw new Error(`Invalid level: ${options.level}`)

			return [(level / 100).toString()]
		},
	},
	{
		id: 'spbPlay',
		name: 'Console: Play',
		osc: '/V3/console/EX/1/spbPlay',
		args: ['true'],
		requiresButtonUnpress: true,
	},
	{
		id: 'spbPauseBack',
		name: 'Console: Pause/Back',
		osc: '/V3/console/EX/1/spbPauseBack',
		args: ['true'],
		requiresButtonUnpress: true,
	},
	{
		id: 'spbPrev',
		name: 'Console: Skip backward',
		osc: '/V3/console/EX/1/spbSkipBack',
		args: ['true'],
		requiresButtonUnpress: true,
	},
	{
		id: 'spbNext',
		name: 'Console: Skip forward',
		osc: '/V3/console/EX/1/spbSkipForward',
		args: ['true'],
		requiresButtonUnpress: true,
	},
	{
		id: 'spbSkipToStart',
		name: 'Console: Skip to start',
		osc: '/V3/console/EX/1/spbSkipToStart',
		args: ['true'],
		requiresButtonUnpress: true,
	},
	{
		id: 'spbSkipToEnd',
		name: 'Console: Skip to end',
		osc: '/V3/console/EX/1/spbSkipToEnd',
		args: ['true'],
		requiresButtonUnpress: true,
	},
	// Global
	{
		id: 'softkey',
		name: 'Softkey',
		osc: '/V3/global/softkey/number/${softkey}',
		options: [
			{
				id: 'softkey',
				type: 'number',
				label: 'Softkey number',
				min: 1,
				max: 12,
				default: 1,
			},
		],
	},
	{
		id: 'highlight',
		name: 'Toggle Highlight',
		osc: '/V3/global/highlight',
	},
	{
		id: 'tapTempo',
		name: 'FX: Tap tempo for selected FX',
		osc: '/V3/global/tapFxRate',
	},
	{
		id: 'stopFX',
		name: 'FX: Stop all FX',
		osc: '/V3/global/stopAllFx',
	},
	{
		id: 'lampOff',
		name: 'Macro: Lamp Off',
		osc: '/V3/global/lampOffMacro',
	},
	{
		id: 'lampOn',
		name: 'Macro: Lamp On',
		osc: '/V3/global/lampOnMacro',
	},
	{
		id: 'reset',
		name: 'Macro: Reset',
		osc: '/V3/global/resetMacro',
	},
	{
		id: 'solo',
		name: 'Toggle Solo',
		osc: '/V3/global/solo',
	},
	{
		id: 'quickUpdate',
		name: 'Programmer: Quick Update',
		osc: '/V3/global/quickUpdate',
	},
	{
		id: 'update',
		name: 'Programmer: Update',
		osc: '/V3/global/update',
	},
	{
		id: 'clearAllFeatures',
		name: 'Clear: All features',
		osc: '/V3/global/clearAllFeatures',
	},
	{
		id: 'clearClose',
		name: 'Clear: Clear/Close',
		osc: '/V3/global/clearClose',
	},
	{
		id: 'closeClip',
		name: 'Cuelist: Close Cuelist',
		osc: '/V3/global/closeClip',
	},
	{
		id: 'clearProgrammer',
		name: 'Clear: Clear programmer',
		osc: '/V3/global/clearProgrammer',
	},
	{
		id: 'releaseAllFeatures',
		name: 'Release: All features',
		osc: '/V3/global/releaseAllFeatures',
	},
	{
		id: 'armTimecode',
		name: 'Arm timecode cuelists',
		osc: '/V3/global/armTimecodeCuelists',
	},
	{
		id: 'saveShow',
		name: 'General: Save Show',
		osc: '/V3/global/save',
	},
]
