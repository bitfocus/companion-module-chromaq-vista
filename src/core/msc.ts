export type MscCommand = 'go' | 'stop' | 'resume'
export type MscOptions = { command: MscCommand; cue: string; cuelist: string }
export type MscSettings = { mscEnabled?: boolean; midiPort?: string; deviceId?: number; commandFormat?: number }
const commands = { go: 0x01, stop: 0x02, resume: 0x03 }
function byte(value: number, label: string): number {
	if (!Number.isInteger(value) || value < 0 || value > 127) throw new Error(`${label} must be an integer from 0 to 127`)
	return value
}
/** Vista TBJLT196: ASCII numeric cue, optional NUL and ASCII numeric cuelist. */
export function buildMsc(settings: MscSettings, options: MscOptions): number[] {
	const command = commands[options.command]
	if (!Object.hasOwn(commands, options.command)) throw new Error('Unsupported MSC command')
	const cue = options.cue.trim()
	const cuelist = options.cuelist.trim()
	for (const [label, value] of [
		['Cue', cue],
		['Cuelist', cuelist],
	]) {
		if (value && !/^\d+(\.\d+)*$/.test(value))
			throw new Error(`${label} must contain only numeric sections separated by periods`)
	}
	// MSC requires a cue when a cuelist is supplied; no unverified empty-cue extension.
	if (cuelist && !cue) throw new Error('A cue number is required when specifying a cuelist')
	return [
		0xf0,
		0x7f,
		byte(settings.deviceId ?? 1, 'Device ID'),
		0x02,
		byte(settings.commandFormat ?? 1, 'Command format'),
		command,
		...Buffer.from(cue, 'ascii'),
		...(cuelist ? [0, ...Buffer.from(cuelist, 'ascii')] : []),
		0xf7,
	]
}
export interface MidiOutput {
	getPortCount(): number
	getPortName(index: number): string
	openPort(index: number): void
	closePort(): void
	sendMessage(message: number[]): void
}
/** Factory injection keeps lifecycle tests independent of MIDI hardware. */
export class MscOutput {
	#output?: MidiOutput
	#settings: MscSettings = {}
	constructor(private readonly factory: () => MidiOutput) {}
	get isOpen(): boolean {
		return this.#output !== undefined
	}
	ports(): string[] {
		const output = this.factory()
		try {
			return Array.from({ length: output.getPortCount() }, (_, i) => output.getPortName(i))
		} finally {
			output.closePort()
		}
	}
	configure(settings: MscSettings): void {
		this.close()
		this.#settings = { ...settings }
		if (!settings.mscEnabled) return
		buildMsc(settings, { command: 'go', cue: '', cuelist: '' })
		const output = this.factory()
		try {
			const matches = Array.from({ length: output.getPortCount() }, (_, i) => i).filter(
				(i) => output.getPortName(i) === settings.midiPort,
			)
			if (matches.length !== 1) throw new Error('Select an available, uniquely named MIDI output port and save again')
			output.openPort(matches[0])
			this.#output = output
		} catch (error) {
			output.closePort()
			throw error
		}
	}
	send(options: MscOptions): void {
		if (!this.#output) throw new Error('MSC output is disabled or its port is unavailable; save settings to reconnect')
		const message = buildMsc(this.#settings, options)
		try {
			this.#output.sendMessage(message)
		} catch (error) {
			this.close()
			throw error
		}
	}
	close(): void {
		const output = this.#output
		this.#output = undefined
		output?.closePort()
	}
}
