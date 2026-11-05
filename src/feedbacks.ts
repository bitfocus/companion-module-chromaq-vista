import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type ModuleInstance from './main.js'
import { compareValue, type Comparison } from './core/state.js'

export type FeedbacksSchema = {
	osc_listening: { type: 'boolean'; options: Record<string, never> }
	osc_variable: { type: 'boolean'; options: { variable: string; comparison: Comparison; value: string } }
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	const feedbacks: CompanionFeedbackDefinitions<FeedbacksSchema> = {
		osc_listening: {
			type: 'boolean',
			name: 'OSC: Receiver listening',
			description: 'The local OSC receiver is ready. This does not confirm that Vista is online or sending data.',
			defaultStyle: { bgcolor: 0x00aa00, color: 0xffffff },
			options: [],
			callback: () => self.state.listening,
		},
		osc_variable: {
			type: 'boolean',
			name: 'OSC: Variable value',
			description: 'Compare a mapped OSC variable. Add mappings in connection settings. Unknown values never match.',
			defaultStyle: { bgcolor: 0x00aa00, color: 0xffffff },
			options: [
				{
					type: 'dropdown',
					id: 'variable',
					label: 'Variable',
					choices: self.state.mappings.map(({ id }) => ({ id, label: id })),
					allowCustom: true,
					default: self.state.mappings[0]?.id ?? '',
				},
				{
					type: 'dropdown',
					id: 'comparison',
					label: 'Comparison',
					default: 'eq',
					choices: [
						{ id: 'eq', label: 'Text equals' },
						{ id: 'ne', label: 'Text does not equal' },
						{ id: 'num_eq', label: 'Number equals (tolerance 0.000001)' },
						{ id: 'gt', label: 'Number greater than' },
						{ id: 'gte', label: 'Number greater than or equal' },
						{ id: 'lt', label: 'Number less than' },
						{ id: 'lte', label: 'Number less than or equal' },
						{ id: 'on', label: 'On (true or 1)' },
						{ id: 'off', label: 'Off (false or 0)' },
						{ id: 'known', label: 'Value received' },
					],
				},
				{
					type: 'textinput',
					id: 'value',
					label: 'Value to compare (ignored for On, Off, and Value received)',
					default: '1',
				},
			],
			callback: ({ options }) =>
				compareValue(self.state.values.get(options.variable), options.comparison, options.value),
		},
	}
	self.setFeedbackDefinitions(feedbacks)
}
