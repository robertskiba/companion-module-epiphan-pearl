const os = require('os')

// use global fetch provided by Node 18+
const fetchFunc = global.fetch

/** Address a Pearl falls back to when it gets no address via DHCP, also the default in the config */
const PEARL_FALLBACK_ADDRESS = '192.168.255.250'
/** Addresses checked on either side of a center address, a normal /24 network is covered in full */
const NEARBY_SCAN_RADIUS = 510
/** Number of addresses checked at the same time */
const BATCH_SIZE = 64
/** Timeout for one address, a Pearl on the local network answers within a few milliseconds */
const PROBE_TIMEOUT = 500

/**
 * Check whether a Pearl answers at the given address.
 *
 * Every Pearl asks for a login, also without an admin password (the user name is always required),
 * and names its model and serial number in the login request, e.g. 'Basic realm="Pearl-2 TSH500540"'
 * (checked on a Pearl-2 with firmware 4.24.6). So a Pearl can be recognized without credentials.
 *
 * @param {string} ip
 * @param {number} port
 * @returns {Promise<{address: string, port: number, model: string, serial: string} | undefined>}
 */
async function probePearl(ip, port) {
	try {
		const response = await fetchFunc(`http://${ip}:${port}/admin/`, {
			signal: AbortSignal.timeout(PROBE_TIMEOUT),
			redirect: 'manual',
		})
		// the body is not needed, only the login request in the headers
		response.body?.cancel().catch(() => {})
		const realm = /realm="([^"]*)"/i.exec(response.headers.get('www-authenticate') ?? '')?.[1]
		if (!realm || !/pearl|epiphan/i.test(realm)) return undefined
		// e.g. 'Pearl-2 TSH500540' or 'Pearl Mini TSH123456': the serial number is the last word
		const words = realm.trim().split(/\s+/)
		const serial = words.length > 1 ? words.pop() : ''
		return { address: ip, port, model: words.join(' '), serial }
	} catch {
		// not reachable or timed out, the expected result for almost every address
		return undefined
	}
}

const ipToInt = (ip) => ip.split('.').reduce((n, part) => n * 256 + Number(part), 0)
const intToIp = (n) => [24, 16, 8, 0].map((shift) => Math.floor(n / 2 ** shift) % 256).join('.')
const isIPv4 = (value) => /^(\d{1,3})(\.\d{1,3}){3}$/.test(value) && value.split('.').every((p) => Number(p) <= 255)

/** Addresses around a center address, the center first */
function nearbyAddresses(centerIp) {
	const center = ipToInt(centerIp)
	const addresses = [centerIp]
	for (let offset = 1; offset <= NEARBY_SCAN_RADIUS; offset++) {
		for (const candidate of [center - offset, center + offset]) {
			if (candidate < 0 || candidate > 0xffffffff) continue
			// skip the network and broadcast addresses of a /24 network
			const last = candidate % 256
			if (last === 0 || last === 255) continue
			addresses.push(intToIp(candidate))
		}
	}
	return addresses
}

/** The own address on every local, non-internal IPv4 interface */
function localInterfaceAddresses() {
	const addresses = []
	for (const ifaceList of Object.values(os.networkInterfaces())) {
		for (const iface of ifaceList ?? []) {
			if (iface.family !== 'IPv4' && iface.family !== 4) continue
			if (iface.internal || addresses.includes(iface.address)) continue
			// link-local addresses (no DHCP server) are not a network a Pearl is configured in
			if (iface.address.startsWith('169.254.')) continue
			addresses.push(iface.address)
		}
	}
	return addresses
}

/**
 * Search the network for Pearls. Checked in this order:
 *   1. the fallback address of a Pearl without DHCP
 *   2. the neighborhood of the configured address, if it is an IPv4 address: finds a Pearl which got
 *      a new address via DHCP, also in networks which are only reachable through a router
 *   3. the neighborhood of this computer's own address on each network interface
 *
 * @param {Object} options
 * @param {string} [options.configuredHost] - the address from the config
 * @param {number[]} [options.ports] - HTTP ports to check, default 80
 * @param {function(): boolean} [options.isCancelled] - stops the scan, e.g. when the connection is removed
 * @param {function(Object[]): void} [options.onFound] - called with all Pearls found so far, as soon as
 *   one is found, so they can be offered before the whole network has been searched
 * @returns {Promise<{address: string, port: number, model: string, serial: string}[]>}
 */
async function scanForPearls({ configuredHost, ports = [80], isCancelled = () => false, onFound } = {}) {
	const found = []
	const checked = new Set()

	const checkAll = async (addresses) => {
		const pairs = []
		for (const ip of addresses) {
			for (const port of ports) {
				const key = `${ip}:${port}`
				if (checked.has(key)) continue
				checked.add(key)
				pairs.push([ip, port])
			}
		}
		for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
			if (isCancelled()) return
			const results = await Promise.all(pairs.slice(i, i + BATCH_SIZE).map(([ip, port]) => probePearl(ip, port)))
			const newlyFound = results.filter(Boolean)
			if (newlyFound.length > 0) {
				found.push(...newlyFound)
				onFound?.([...found])
			}
		}
	}

	await checkAll([PEARL_FALLBACK_ADDRESS])
	// 127.x.x.x is this computer itself (loopback), there is no network of Pearls around it
	if (configuredHost && isIPv4(configuredHost) && !configuredHost.startsWith('127.')) {
		await checkAll(nearbyAddresses(configuredHost))
	}
	for (const ownIp of localInterfaceAddresses()) await checkAll(nearbyAddresses(ownIp))

	return found
}

module.exports = { scanForPearls, probePearl, PEARL_FALLBACK_ADDRESS }
