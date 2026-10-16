import type { CompanionActionDefinitions } from '@companion-module/base'
import { createModuleLogger } from '@companion-module/base'
import type ModuleInstance from './main.js'

const actionsLogger = createModuleLogger('Actions')

type NoOptions = { options: Record<string, never> }

export type ActionsSchema = {
	custom_message: {
		options: {
			address: string
		}
	}
	actionGridButton: {
		options: {
			actionGrid: number
			row: number
			col: number
		}
	}
	gmFader: {
		options: {
			level: number
		}
	}
	playbackButton: {
		options: {
			panel: number
			bank: number
			row: number
			col: number
		}
	}
	playbackFader: {
		options: {
			level: number
			panel: number
			col: number
		}
	}
	softkey: {
		options: {
			softkey: number
		}
	}
	spbPlay: NoOptions
	spbPauseBack: NoOptions
	spbPrev: NoOptions
	spbNext: NoOptions
	spbSkipToStart: NoOptions
	spbSkipToEnd: NoOptions
	highlight: NoOptions
	tapTempo: NoOptions
	stopFX: NoOptions
	lampOff: NoOptions
	lampOn: NoOptions
	reset: NoOptions
	solo: NoOptions
	quickUpdate: NoOptions
	update: NoOptions
	clearAllFeatures: NoOptions
	clearClose: NoOptions
	closeClip: NoOptions
	clearProgrammer: NoOptions
	releaseAllFeatures: NoOptions
	armTimecode: NoOptions
	saveShow: NoOptions
}

export function UpdateActions(self: ModuleInstance): void {
	const actions: CompanionActionDefinitions<ActionsSchema> = {
		custom_message: {
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
				const address = event.options.address
				if (!self.VistaClient) {
					console.log('Module did not initialize client properly')
					return
				}
				await self.VistaClient.send(address, [''])
			},
		},

		actionGridButton: {
			name: 'Action Grid: Trigger Button',
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
			callback: async (event) => {
				const address = `/V3/actionGrid/${event.options.actionGrid}/button/row/${event.options.row}/col/${event.options.col}`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		// Console
		gmFader: {
			name: 'Console: Grandmaster fader',
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
			callback: async (event) => {
				const level = Number(event.options.level)
				if (Number.isNaN(level)) {
					actionsLogger.error(`Invalid level: ${level}`)
					return
				}

				await self.VistaClient?.send(`/V3/console/EX/1/gmFader`, [(level / 100).toString()])
			},
		},

		playbackButton: {
			name: 'Console: Playback button',
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
			callback: async (event) => {
				const address = `/V3/console/EX/1/playbackButton/panel/${event.options.panel}/bank/${event.options.bank}/row/${event.options.row}/col/${event.options.col}`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		playbackFader: {
			name: 'Console: Playback fader',
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
			callback: async (event) => {
				const address = `/V3/console/EX/1/playbackFader/panel/${event.options.panel}/col/${event.options.col}`
				const level = Number(event.options.level)
				if (Number.isNaN(level)) {
					actionsLogger.error(`Invalid level: ${level}`)
					return
				}
				await self.VistaClient?.send(address, [(level / 100).toString()])
			},
		},

		spbPlay: {
			name: 'Console: Play',
			options: [],
			callback: async () => {
				const address = `/V3/console/EX/1/spbPlay`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		spbPauseBack: {
			name: 'Console: Pause/Back',
			options: [],
			callback: async () => {
				const address = `/V3/console/EX/1/spbPauseBack`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		spbPrev: {
			name: 'Console: Skip backward',
			options: [],
			callback: async () => {
				const address = `/V3/console/EX/1/spbSkipBack`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		spbNext: {
			name: 'Console: Skip forward',
			options: [],
			callback: async () => {
				const address = `/V3/console/EX/1/spbSkipForward`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		spbSkipToStart: {
			name: 'Console: Skip to start',
			options: [],
			callback: async () => {
				const address = `/V3/console/EX/1/spbSkipToStart`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		spbSkipToEnd: {
			name: 'Console: Skip to end',
			options: [],
			callback: async () => {
				const address = `/V3/console/EX/1/spbSkipToEnd`
				await self.VistaClient?.send(address, ['true'])
				setTimeout(() => {
					void self.VistaClient?.send(address, ['false'])
				}, 20)
			},
		},

		// Global
		softkey: {
			name: 'Softkey',
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
			callback: async (event) => {
				const address = `/V3/global/softkey/number/${event.options.softkey}`
				await self.VistaClient?.send(address, [''])
			},
		},

		highlight: {
			name: 'Toggle Highlight',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/highlight', ['']),
		},

		tapTempo: {
			name: 'FX: Tap tempo for selected FX',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/tapFxRate', ['']),
		},

		stopFX: {
			name: 'FX: Stop all FX',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/stopAllFx', ['']),
		},

		lampOff: {
			name: 'Macro: Lamp Off',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/lampOffMacro', ['']),
		},

		lampOn: {
			name: 'Macro: Lamp On',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/lampOnMacro', ['']),
		},

		reset: {
			name: 'Macro: Reset',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/resetMacro', ['']),
		},

		solo: {
			name: 'Toggle Solo',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/solo', ['']),
		},

		quickUpdate: {
			name: 'Programmer: Quick Update',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/quickUpdate', ['']),
		},

		update: {
			name: 'Programmer: Update',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/update', ['']),
		},

		clearAllFeatures: {
			name: 'Clear: All features',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/clearAllFeatures', ['']),
		},

		clearClose: {
			name: 'Clear: Clear/Close',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/clearClose', ['']),
		},

		closeClip: {
			name: 'Cuelist: Close Cuelist',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/closeClip', ['']),
		},

		clearProgrammer: {
			name: 'Clear: Clear programmer',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/clearProgrammer', ['']),
		},

		releaseAllFeatures: {
			name: 'Release: All features',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/releaseAllFeatures', ['']),
		},

		armTimecode: {
			name: 'Arm timecode cuelists',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/armTimecodeCuelists', ['']),
		},

		saveShow: {
			name: 'General: Save Show',
			options: [],
			callback: async () => await self.VistaClient?.send('/V3/global/save', ['']),
		},
	}

	self.setActionDefinitions(actions)
}
