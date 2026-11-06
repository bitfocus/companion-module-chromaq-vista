import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { MscOutput, type MscOptions } from './core/msc.js'
import { VistaClient } from './core/client.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export const statusMap: Record<string, InstanceStatus> = {
	connecting: InstanceStatus.Connecting,
	ok: InstanceStatus.Ok,
	disconnected: InstanceStatus.Disconnected,
	bad_config: InstanceStatus.BadConfig,
	connection_failure: InstanceStatus.ConnectionFailure,
}

export { UpgradeScripts }

export default class ModuleInstance extends InstanceBase<ModuleSchema> {
	mscOutput?: MscOutput
	midiPorts: string[] = []
	private mscError?: string
	private oscStatus: { status: keyof typeof statusMap; msg?: string } = { status: 'disconnected' }
	config!: ModuleConfig // Setup in init()
	VistaClient: VistaClient | undefined

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions

		this.VistaClient = new VistaClient()

		this.VistaClient.on('status', (status) => {
			this.oscStatus = status
			this.reportStatus()
		})

		await this.connectOutputs()
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.mscOutput?.close()
		if (this.VistaClient) await this.VistaClient.destroy()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		await this.connectOutputs()
	}

	private reportStatus(): void {
		if (this.mscError) this.updateStatus(InstanceStatus.ConnectionFailure, this.mscError)
		else if (this.config.oscEnabled !== false) this.updateStatus(statusMap[this.oscStatus.status], this.oscStatus.msg)
		else if (this.config.mscEnabled) this.updateStatus(InstanceStatus.Ok, 'MIDI output open (no Vista acknowledgement)')
		else this.updateStatus(InstanceStatus.BadConfig, 'Enable OSC or MSC output')
	}
	private async connectOutputs(): Promise<void> {
		this.mscError = undefined
		try {
			// Native MIDI is optional at runtime; an unavailable driver must not break OSC.
			if (!this.mscOutput) {
				const { Output } = await import('@julusian/midi')
				this.mscOutput = new MscOutput(() => new Output())
			}
			this.midiPorts = this.mscOutput.ports()
			this.mscOutput.configure(this.config)
		} catch (error) {
			this.mscOutput?.close()
			if (this.config.mscEnabled) this.mscError = `MSC: ${String(error)}`
			else this.log('debug', `MIDI ports unavailable: ${String(error)}`)
		}
		if (this.config.oscEnabled !== false) await this.VistaClient?.connect(this.config)
		else await this.VistaClient?.destroy()
		this.reportStatus()
	}
	sendMsc(options: MscOptions): void {
		try {
			if (!this.mscOutput) throw new Error('MIDI output unavailable')
			this.mscOutput.send(options)
		} catch (error) {
			this.log('error', `MSC send failed: ${String(error)}`)
			if (this.config.mscEnabled && !this.mscOutput?.isOpen) {
				this.mscError = `MSC: ${String(error)}`
				this.reportStatus()
			}
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields(this.midiPorts)
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updatePresets(): void {
		UpdatePresets(this)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this)
	}
}
