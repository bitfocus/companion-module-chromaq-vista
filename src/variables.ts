import type { CompanionVariableDefinitions } from '@companion-module/base'
import type ModuleInstance from './main.js'

// export type VariablesSchema = null

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const variables: CompanionVariableDefinitions = {}
	self.setVariableDefinitions(variables)
}
