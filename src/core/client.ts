import EventEmitter from 'node:events'
import { createModuleLogger } from '@companion-module/base'
import type { ModuleConfig } from '../config.js'
import { Client, Server } from 'node-osc'
import type { statusMap } from '../main.js'

const clientLogger = createModuleLogger('Client')

/** Server/client for communication with Chroma-Q Vista over OSC */
export class VistaClient extends EventEmitter<{ status: [{ status: keyof typeof statusMap; msg?: string }] }> {
	host = ''
	listenPort = 9000
	sendPort = 8000
	#verbose = false
	#client?: Client
	#server?: Server

	/** Initializes server and client connections. Call after config is initialized. */
	async connect(config: ModuleConfig): Promise<void> {
		await this.destroy()

		this.host = config.host
		this.listenPort = config.listenPort
		this.sendPort = config.sendPort
		this.#verbose = config.verbose

		if (!this.host || this.host === '') {
			this.emit('status', { status: 'bad_config', msg: 'No host IP provided' })
			return
		}

		this.#server = new Server(this.listenPort, '0.0.0.0', () => {
			this.emit('status', { status: 'ok' })
		})

		this.#server.on('message', (msg) => {
			if (this.#verbose) clientLogger.info(`Received message: ${msg}`)
		})

		this.#server.on('error', (error) => {
			clientLogger.error(`OSC client error: ${error.message}`)
			this.emit('status', { status: 'connection_failure', msg: error })
		})

		this.#client = new Client(this.host, this.sendPort)
	}

	/** Closes server and client connections */
	async destroy(): Promise<void> {
		const client = this.#client
		const server = this.#server
		this.#client = undefined
		this.#server = undefined

		await Promise.all([client?.close(), server?.close()])
			.then(() => this.emit('status', { status: 'disconnected' }))
			.catch(() =>
				this.emit('status', { status: 'connection_failure', msg: 'Failed to destroy client and/or server sockets' }),
			)
	}

	/** Sends OSC command to Vista */
	async send(address: string, args: string[]): Promise<void> {
		if (!this.#client) {
			clientLogger.error('Connection not established')
			return
		}

		try {
			if (this.#verbose) {
				clientLogger.info(`Sending OSC: ${address} -- ${args}`)
			}
			await this.#client.send(address, args)
		} catch (err) {
			clientLogger.error(`Error sending message: address - ${address}, args - ${args}, error - ${err}`)
		}
	}
}
