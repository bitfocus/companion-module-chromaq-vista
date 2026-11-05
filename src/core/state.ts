export type OscValue = string | number | boolean

export type VariableMapping = {
	id: string
	address: string
	argument: number
}

export const diagnosticVariables = {
	osc_listening: { name: 'OSC receiver is listening (does not confirm Vista is online)' },
	osc_messages_received: { name: 'OSC messages received since reconnect' },
	osc_last_address: { name: 'Last received OSC address' },
	osc_last_value: { name: 'First argument of the last received OSC message' },
}

/** One mapping per line: variable_id=/osc/address [1-based argument number]. */
export function parseVariableMappings(input = ''): { mappings: VariableMapping[]; errors: string[] } {
	const mappings: VariableMapping[] = []
	const errors: string[] = []
	const ids = new Set([...Object.keys(diagnosticVariables), '__proto__', 'constructor', 'prototype'])
	for (const [index, raw] of input.split(/\r?\n/).entries()) {
		const line = raw.trim()
		if (!line || line.startsWith('#')) continue
		const match = /^([a-zA-Z0-9_]+)\s*=\s*(\/[^\s,[\]{}*?]*)\s*(?:\s([1-9]\d*))?$/.exec(line)
		if (!match) {
			errors.push(
				`Line ${index + 1}: use variable_id=/osc/address, optionally followed by an argument number (1 or higher)`,
			)
			continue
		}
		const [, id, address, argumentText] = match
		const argument = Number(argumentText ?? 1)
		if (!Number.isSafeInteger(argument) || argument > 64) {
			errors.push(`Line ${index + 1}: argument number must be between 1 and 64`)
		} else if (ids.has(id)) {
			errors.push(`Line ${index + 1}: duplicate or reserved variable ID "${id}"`)
		} else {
			ids.add(id)
			mappings.push({ id, address, argument })
		}
	}
	return { mappings, errors }
}

export function isOscValue(value: unknown): value is OscValue {
	return (
		typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))
	)
}

export type Comparison = 'eq' | 'ne' | 'num_eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'on' | 'off' | 'known'

function numericValue(value: OscValue): number | undefined {
	if (typeof value === 'boolean' || (typeof value === 'string' && value.trim() === '')) return undefined
	const result = Number(value)
	return Number.isFinite(result) ? result : undefined
}

/** Unknown/unsupported values never activate a feedback, including "not equal". */
export function compareValue(actual: OscValue | undefined, comparison: Comparison, expected: string): boolean {
	if (actual === undefined) return false
	if (comparison === 'known') return true
	if (comparison === 'eq') return String(actual) === expected
	if (comparison === 'ne') return String(actual) !== expected
	if (comparison === 'on') return actual === true || actual === 1 || actual === '1' || actual === 'true'
	if (comparison === 'off') return actual === false || actual === 0 || actual === '0' || actual === 'false'
	const left = numericValue(actual)
	const right = numericValue(expected)
	if (left === undefined || right === undefined) return false
	switch (comparison) {
		case 'num_eq':
			return Math.abs(left - right) <= 0.000001
		case 'gt':
			return left > right
		case 'gte':
			return left >= right
		case 'lt':
			return left < right
		case 'lte':
			return left <= right
		default:
			return false
	}
}

export class VistaState {
	mappings: VariableMapping[] = []
	values = new Map<string, OscValue>()
	listening = false
	messagesReceived = 0
	lastAddress = ''
	lastValue: OscValue | undefined

	reset(): void {
		this.values.clear()
		this.listening = false
		this.messagesReceived = 0
		this.lastAddress = ''
		this.lastValue = undefined
	}

	receive(address: string, args: unknown[]): void {
		this.messagesReceived++
		this.lastAddress = address
		this.lastValue = isOscValue(args[0]) ? args[0] : undefined
		for (const mapping of this.mappings) {
			if (mapping.address !== address) continue
			const value = args[mapping.argument - 1]
			if (isOscValue(value)) this.values.set(mapping.id, value)
			else this.values.delete(mapping.id)
		}
	}
}
