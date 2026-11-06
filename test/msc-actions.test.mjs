import test from 'node:test'
import assert from 'node:assert/strict'
// eslint-disable-next-line n/no-unpublished-import
import { UpdateActions } from '../dist/actions.js'

test('individual MSC cards show guidance, relevant inputs and dispatch a fixed command', async () => {
	let actions
	const sent = []
	const self = {
		config: { mscDeviceId: 0, verbose: false },
		log() {},
		setActionDefinitions(a) {
			actions = a
		},
		sendMsc(o) {
			sent.push([o.command, o.cue, o.cuelist])
		},
		mscOutput: {
			send(_id, ...args) {
				sent.push(args)
				return []
			},
		},
	}
	UpdateActions(self)
	const expected = ['go', 'stop', 'resume']
	for (const command of expected) {
		const action = actions[`msc_${command}`]
		assert.ok(action.description.length > 20)
		assert.equal(action.options[0].type, 'static-text')
		assert.ok(action.options[0].value.length > 20)
		assert.equal(
			action.options.some((o) => o.id === 'command'),
			false,
		)
		const none = ['allOff', 'restore', 'reset'].includes(command)
		const list = ['openCuelist', 'closeCuelist', 'startClock', 'stopClock'].includes(command)
		const fields = action.options.filter((o) => o.type === 'textinput')
		assert.deepEqual(
			fields.map((o) => o.id),
			none ? [] : list ? ['cuelist'] : ['cue', 'cuelist'],
		)
		for (const field of fields) assert.equal(field.minLength, list ? 1 : 0)
		await action.callback({ options: { cue: none || list ? 'stale' : '34.5', cuelist: none ? 'stale' : '12' } })
		assert.deepEqual(sent.at(-1), [command, none || list ? '' : '34.5', none ? '' : '12'])
	}
	assert.ok(actions.msc, 'old saved buttons still have their original action definition')
})
