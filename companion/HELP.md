## Epiphan Pearl Recorder/Streamer

Should work with all Epiphan Pearl models. Firmware 4.24.1 or newer is recommended: the module then uses the Pearl REST API v2.0 automatically. With older firmware the module uses the older API and shows a warning recommending a firmware update.

If the Pearl is not reachable, the module retries the connection every 10 seconds.

**Finding the Pearl on the network**

If the Pearl can not be reached at the configured address, or no valid address is set, the module searches the network once for Pearls. Found devices are listed with model and serial number under **Found Pearl Devices** at the top of the connection settings, select one to use its address. The search covers the network around the configured address and the networks of the Companion computer, and takes up to about a minute; found Pearls appear as soon as they are found. No username or password is needed for the search.

**Available commands**

- Change channel layout
- Start/Stop channel recording/streaming
- Start/Stop recorder recording
- Get/Set Content Metadata - title, author, filename prefix
- Get/Set layout data
- Insert marker
- Reboot/shutdown system

**Variables (selection)**

- Storage per drive (`main` = internal drive, `external` = USB drive): state, total/used/free in GB and %, estimated remaining recording time (hh:mm, calculated from the bitrate of the running recordings, empty while nothing is recorded)
- Per channel: name, active layout, input signal, resolution, fps, bitrate
- Per recorder: state and duration, per stream: state, duration, reconnections and error
- System: firmware, uptime, CPU load and temperature with warnings, device name and location
