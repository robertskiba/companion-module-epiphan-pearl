const { Regex } = require('@companion-module/base')

// noinspection JSUnusedGlobalSymbols
/**
 * Creates the configuration fields for web config.
 *
 * @access public
 * @since 1.0.0
 * @returns {Array} the config fields
 */
const get_config_fields = () => {
	return [
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
