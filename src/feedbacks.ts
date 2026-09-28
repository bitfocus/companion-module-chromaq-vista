import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type ModuleInstance from './main.js'

export type FeedbacksSchema = any

export function UpdateFeedbacks(self: ModuleInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}
	self.setFeedbackDefinitions(feedbacks)
}
