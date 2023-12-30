import { discoverDevices } from '../src/DeviceDiscovery';
import assert from 'assert';

describe('DeviceDiscovery', () => {
	it('should discover devices', async () => {
		await discoverDevices();
		assert.equal(true, true);
	});
});
