import EventEmitter from 'node:events'
import { createModuleLogger } from '@companion-module/base'
import type { ModuleConfig } from '../config.js'
import { Client, Server } from 'node-osc'

const clientLogger = createModuleLogger('client')

export class VistaClient extends EventEmitter {
	host: string
	port: number
	#verbose: boolean
	#client: Client | undefined
	#server: Server | undefined

	constructor(config: ModuleConfig) {
		super()
		this.host = config.host
		this.port = config.port
		this.#verbose = config.verbose
		this.#client = new Client(config.host, config.port)
		this.#server = undefined
	}

	connect(): void {
		this.#server = new Server(this.port, '0.0.0.0', () => {
			this.emit('status', { status: 'ok' })
		})

		this.#server.on('message', (msg) => {
			this.#receiveMessage(msg)
		})

		this.#client = new Client(this.host, this.port)
	}

	async destroy(): Promise<void> {
		if (this.#server) {
			await this.#server.close()
			this.#server = undefined
		}
		if (this.#client) {
			await this.#client.close()
			this.#client = undefined
		}
	}

	async updateConifg(config: ModuleConfig): Promise<void> {
		this.host = config.host
		this.port = config.port
		this.#verbose = config.verbose

		await this.destroy()
		this.#client = new Client(config.host, config.port)
	}

	async send(address: string, args: string): Promise<void> {
		if (!this.#client) {
			console.log('Connection not established')
			return
		}

		await this.#client.send(address, args, (err: any) => {
			if (this.#verbose) {
				clientLogger.info(`Sending OSC: ${address} -- ${args}`)
			}
			if (this.#verbose && err) {
				clientLogger.error(`Error sending message: address - ${address}, args - ${args}, error - ${err}`)
			}
		})
	}

	#receiveMessage(message: string): void {
		clientLogger.info(`Received message: ${message}`)
	}
}
