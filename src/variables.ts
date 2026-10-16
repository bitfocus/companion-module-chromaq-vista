import type { CompanionVariableDefinitions } from '@companion-module/base'
import type ModuleInstance from './main.js'

export type VariablesSchema = Record<string, never>

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables: CompanionVariableDefinitions<VariablesSchema> = {}
	self.setVariableDefinitions(variables)
}
