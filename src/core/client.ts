import EventEmitter from 'node:events'
import { createModuleLogger } from '@companion-module/base'
import type { ModuleConfig } from '../config.js'
import { Client, Server } from 'node-osc'

const clientLogger = createModuleLogger('Client')

/** Server/client for communication with Chroma-Q Vista over OSC */
export class VistaClient extends EventEmitter {
	host: string
	listenPort: number
	sendPort: number
	#verbose: boolean
	#client: Client | undefined
	#server: Server | undefined

	constructor(config: ModuleConfig) {
		super()
		this.host = config.host
		this.listenPort = config.listenPort
		this.sendPort = config.sendPort
		this.#verbose = config.verbose
		this.#client = undefined
		this.#server = undefined
	}

	/** Initializes server and client connections. Call after config is initialized. */
	connect(): void {
		this.#server = new Server(this.listenPort, '0.0.0.0', () => {
			this.emit('status', { status: 'ok' })
		})

		this.#server.on('message', (msg) => {
			this.#receiveMessage(msg)
		})

		this.#server.on('error', (error) => {
			this.emit('status', { status: 'connection_failure', msg: error })
		})

		this.#client = new Client(this.host, this.sendPort)
	}

	/** Closes server and client connections */
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

	/** Updates config for VistaClient, then restarts client and server connections */
	async updateConifg(config: ModuleConfig): Promise<void> {
		this.host = config.host
		this.listenPort = config.listenPort
		this.sendPort = config.sendPort
		this.#verbose = config.verbose

		await this.destroy().then(() => {
			this.connect()
		})
	}

	/** Sends OSC command to Vista */
	async send(address: string, args: string[]): Promise<void> {
		if (!this.#client) {
			console.log('Connection not established')
			return
		}

		await this.#client.send(address, args, (err: any) => {
			if (this.#verbose) {
				clientLogger.info(`Sending OSC: ${address} -- ${args}`)
			}
			if (err) {
				clientLogger.error(`Error sending message: address - ${address}, args - ${args}, error - ${err}`)
			}
		})
	}

	/**
	 * Function for receiving messages from Vista.
	 * Only prints to log. May be utilized in future releases.
	 */
	#receiveMessage(message: string): void {
		clientLogger.info(`Received message: ${message}`)
	}
}
