const { Regex } = require('@companion-module/base')

// noinspection JSUnusedGlobalSymbols
/**
 * Creates the configuration fields for web config.
 *
 * @access public
 * @since 1.0.0
 * @param {{address: string, port: number, model: string, serial: string}[]} [foundDevices] - result
 *   of the network scan, undefined as long as no scan has completed
 * @returns {Array} the config fields
 */
const get_config_fields = (foundDevices) => {
	return [
		// Shown as soon as a scan has completed, also without results, so "No Pearl found" is visible
		// here and not only in the log. Selecting an entry applies its address, see configUpdated().
		...(foundDevices !== undefined
			? [
					{
						type: 'dropdown',
						id: 'foundDevices',
						label: 'Found Pearl Devices',
						tooltip:
							'Filled in automatically when the Pearl can not be reached: the module then searches the local network once for Pearls. Select an entry to use its address.',
						width: 12,
						default: '',
						choices:
							foundDevices.length > 0
								? [
										{ id: '', label: 'Select a found device...' },
										...foundDevices.map((d) => ({
											id: `${d.address}:${d.port}`,
											label: `${d.address}${d.port !== 80 ? ':' + d.port : ''} (${[d.model, d.serial].filter(Boolean).join(' ')})`,
										})),
									]
								: [{ id: '', label: 'No Pearl found' }],
					},
				]
			: []),
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP or hostname',
			width: 6,
			default: '192.168.255.250',
			// hostnames are allowed too, e.g. <serial number>.local, the name a Pearl announces on the network
			regex: Regex.HOSTNAME,
			tooltip: 'IP address or hostname of the Pearl, e.g. 192.168.1.20 or <serial number>.local',
		},
		{
			type: 'textinput',
			id: 'host_port',
			label: 'Target Port',
			width: 6,
			default: '80',
			regex: Regex.PORT,
		},
		{
			type: 'textinput',
			id: 'username',
			label: 'Username',
			width: 6,
			default: 'admin',
		},
		{
			type: 'textinput',
			id: 'password',
			label: 'Password',
			width: 6,
			default: '',
		},
		{
			type: 'number',
			id: 'pollfreq',
			label: 'Feedback polling frequency in seconds',
			width: 6,
			default: 10,
			min: 1,
			max: 300,
		},
		{
			type: 'checkbox',
			id: 'verbose',
			label: 'Enable verbose logging',
			default: false,
		},
	]
}

module.exports = { get_config_fields }
