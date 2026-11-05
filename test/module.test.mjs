import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createSocket } from 'node:dgram'
import test from 'node:test'
import { Bundle, Client, Message, Server } from 'node-osc'
import ModuleInstance from '../dist/main.js'

async function waitFor(predicate) {
	for (let i = 0; i < 100; i++) {
		if (predicate()) return
		await new Promise((resolve) => setTimeout(resolve, 10))
	}
	assert.fail('Timed out waiting for OSC update')
}

function createModule() {
	const host = { values: {}, feedbacks: {}, definitions: {}, actions: {}, checked: [], statuses: [] }
	const instance = new ModuleInstance({
		id: 'test',
		_isInstanceContext: true,
		setVariableDefinitions: (definitions) => {
			host.definitions = definitions
		},
		setVariableValues: (values) => {
			Object.assign(host.values, values)
		},
		setFeedbackDefinitions: (feedbacks) => {
			host.feedbacks = feedbacks
		},
		setActionDefinitions: (actions) => {
			host.actions = actions
		},
		setPresetDefinitions: () => {},
		checkFeedbacks: (ids) => host.checked.push(ids),
		updateStatus: (...status) => host.statuses.push(status),
	})
	return { host, instance }
}

test(
	'incoming UDP messages and nested bundles publish variables and reevaluate feedbacks',
	{ timeout: 5000 },
	async (t) => {
		// Synthetic OSC fixtures, not captures of Vista's output.
		const { host, instance } = createModule()
		const target = new Server(0, '127.0.0.1')
		t.after(() => target.close())
		await once(target, 'listening')
		const config = {
			host: '127.0.0.1',
			listenPort: 0,
			sendPort: target.port,
			verbose: false,
			variableMappings: 'cue=/show/cue\nlabel=/show/cue 2\nfader=/show/fader\nflag=/show/flag',
		}
		t.after(() => instance.destroy())
		await instance.init(config)
		await waitFor(() => host.values.osc_listening)
		assert.equal(host.feedbacks.osc_listening.callback(), true)
		assert.equal(host.values.cue, undefined)
		assert.ok(host.definitions.cue)
		const feedback = (variable, comparison, value = '') =>
			host.feedbacks.osc_variable.callback({ options: { variable, comparison, value } })
		assert.equal(feedback('cue', 'ne', '1'), false)
		const sender = new Client('127.0.0.1', instance.VistaClient.listenPort)
		t.after(() => sender.close())
		await sender.send(
			new Bundle(
				new Message('/show/cue', 4, 'Intro'),
				new Bundle(new Message('/show/fader', 0.5), new Message('/show/flag', false)),
			),
		)
		await waitFor(() => host.values.osc_messages_received === 3)
		assert.equal(host.values.cue, 4)
		assert.equal(host.values.label, 'Intro')
		assert.equal(host.values.fader, 0.5)
		assert.equal(host.values.flag, false)
		assert.equal(host.values.osc_last_address, '/show/flag')
		assert.equal(host.values.osc_last_value, false)
		assert.equal(feedback('cue', 'num_eq', '4'), true)
		assert.equal(feedback('flag', 'off'), true)
		assert.equal(feedback('fader', 'gte', '0.5'), true)
		assert.ok(host.checked.some((ids) => ids.includes('osc_variable')))
		await sender.send('/show/cue', 5)
		await waitFor(() => host.values.cue === 5)
		assert.equal(host.values.label, undefined)
		// Sending a command never guesses at the resulting Vista state.
		const command = once(target, 'message')
		await host.actions.gmFader.callback({ options: { level: 20 } })
		assert.deepEqual((await command)[0], ['/V3/console/EX/1/gmFader', '0.2'])
		assert.equal(host.values.fader, 0.5)
		const raw = createSocket('udp4')
		t.after(() => new Promise((resolve) => raw.close(resolve)))
		await new Promise((resolve, reject) =>
			raw.send(Buffer.from('not OSC'), instance.VistaClient.listenPort, '127.0.0.1', (error) =>
				error ? reject(error) : resolve(),
			),
		)
		await sender.send('/show/cue', 6, 'Next')
		await waitFor(() => host.values.cue === 6)
		assert.equal(host.values.osc_listening, true)
		await sender.send(new Message('/show/cue'))
		await waitFor(() => host.values.cue === undefined)
		assert.equal(host.values.osc_last_value, undefined)
		assert.equal(feedback('cue', 'ne', '6'), false)
		await instance.configUpdated({ ...config, host: '', variableMappings: 'replacement=/show/cue' })
		assert.equal(host.values.osc_listening, false)
		assert.equal(host.values.osc_messages_received, 0)
		assert.equal(host.values.cue, undefined)
		assert.equal(host.values.fader, undefined)
		assert.equal(host.values.osc_last_value, undefined)
		assert.equal(host.definitions.cue, undefined)
		assert.ok(host.definitions.replacement)
		assert.equal(host.feedbacks.osc_listening.callback(), false)
		assert.equal(feedback('cue', 'num_eq', '5'), false)
	},
)

test(
	'reconnect, socket failures and destroy clear received state; old configurations need no mappings',
	{ timeout: 5000 },
	async (t) => {
		const { host, instance } = createModule()
		t.after(() => instance.destroy())
		const config = { host: '127.0.0.1', sendPort: 8000, listenPort: 0, verbose: false }
		await instance.init(config)
		await waitFor(() => host.values.osc_listening)
		assert.equal(Object.keys(host.definitions).length, 4)
		await instance.configUpdated({ ...config, variableMappings: 'cue=/show/cue' })
		await waitFor(() => host.values.osc_listening)
		const sender = new Client('127.0.0.1', instance.VistaClient.listenPort)
		t.after(() => sender.close())
		await sender.send('/show/cue', 2)
		await waitFor(() => host.values.cue === 2)
		instance.VistaClient.emit('status', { status: 'connection_failure', msg: 'Test socket failure' })
		assert.equal(host.values.cue, undefined)
		assert.equal(host.values.osc_listening, false)
		assert.equal(host.values.osc_messages_received, 0)
		await instance.configUpdated({ ...config, variableMappings: 'cue=/show/cue' })
		await waitFor(() => host.values.osc_listening)
		assert.equal(host.values.cue, undefined)
		assert.equal(host.values.osc_messages_received, 0)
		const newSender = new Client('127.0.0.1', instance.VistaClient.listenPort)
		t.after(() => newSender.close())
		await newSender.send('/show/cue', 3)
		await waitFor(() => host.values.cue === 3)
		await instance.destroy()
		assert.equal(host.values.osc_listening, false)
		assert.equal(host.values.cue, undefined)
	},
)

test('OSC from a different target IP cannot update variables', { timeout: 5000 }, async (t) => {
	const { host, instance } = createModule()
	t.after(() => instance.destroy())
	await instance.init({
		host: '127.0.0.2',
		sendPort: 8000,
		listenPort: 0,
		verbose: false,
		variableMappings: 'cue=/show/cue',
	})
	await waitFor(() => host.values.osc_listening)
	const sender = new Client('127.0.0.1', instance.VistaClient.listenPort)
	t.after(() => sender.close())
	await sender.send('/show/cue', 5)
	await new Promise((resolve) => setTimeout(resolve, 50))
	assert.equal(host.values.osc_messages_received, 0)
	assert.equal(host.values.cue, undefined)
})
