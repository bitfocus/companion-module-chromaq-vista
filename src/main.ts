import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, UpdateVariableValues, type VariablesSchema } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions, type ActionsSchema } from './actions.js'
import { UpdateFeedbacks, type FeedbacksSchema } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { VistaClient } from './core/client.js'
import { parseVariableMappings, VistaState } from './core/state.js'

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
	config!: ModuleConfig // Setup in init()
	VistaClient: VistaClient | undefined
	state = new VistaState()

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.configureVariables()

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updatePresets() // export Presets
		this.updateVariableDefinitions() // export variable definitions
		this.publishState()

		this.VistaClient = new VistaClient()

		this.VistaClient.on('status', (status) => {
			this.updateStatus(statusMap[status.status], status.msg)
			if (status.status === 'ok') this.state.listening = true
			else this.state.reset()
			this.publishState()
		})

		this.VistaClient.on('message', (address, args) => {
			this.state.receive(address, args)
			this.publishState()
		})

		await this.VistaClient.connect(this.config)
	}
	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		if (this.VistaClient) await this.VistaClient.destroy()
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.setVariableValues(Object.fromEntries(this.state.mappings.map(({ id }) => [id, undefined])))
		this.config = config
		this.state.reset()
		this.configureVariables()
		this.updateVariableDefinitions()
		this.updateFeedbacks()
		this.publishState()
		if (this.VistaClient) await this.VistaClient.connect(config)
	}

	private configureVariables(): void {
		const { mappings, errors } = parseVariableMappings(this.config.variableMappings)
		this.state.mappings = mappings
		for (const error of errors) this.log('warn', `OSC variables: ${error}`)
	}

	private publishState(): void {
		UpdateVariableValues(this)
		this.checkFeedbacks('osc_listening', 'osc_variable')
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
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
