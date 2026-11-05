import type { CompanionVariableDefinitions } from '@companion-module/base'
import type ModuleInstance from './main.js'
import { diagnosticVariables, type OscValue } from './core/state.js'

export type VariablesSchema = Record<string, OscValue | undefined>

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables: CompanionVariableDefinitions<VariablesSchema> = { ...diagnosticVariables }
	for (const mapping of self.state.mappings) {
		variables[mapping.id] = { name: `${mapping.address} (argument ${mapping.argument})` }
	}
	self.setVariableDefinitions(variables)
}

export function UpdateVariableValues(self: ModuleInstance): void {
	const values: VariablesSchema = {
		osc_listening: self.state.listening,
		osc_messages_received: self.state.messagesReceived,
		osc_last_address: self.state.lastAddress,
		osc_last_value: self.state.lastValue,
	}
	for (const mapping of self.state.mappings) values[mapping.id] = self.state.values.get(mapping.id)
	self.setVariableValues(values)
}
