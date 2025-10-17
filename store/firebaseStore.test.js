import { act } from 'react-dom/test-utils';
import { useDeviceStore } from './firebaseStore';

// Mock the service functions so they don't touch the real database
jest.mock('../services/firebaseDevicesService', () => ({
    updateDeviceNickname: jest.fn(() => Promise.resolve()),
    deleteDevice: jest.fn(() => Promise.resolve()),
    setUserDevices: jest.fn(devices => devices.filter(d => d.owner === 'user1')),
    setUnpairedDevices: jest.fn(devices => devices.filter(d => d.status === 'unpaired')),
}));

describe('Device Store State Logic', () => {
    beforeEach(() => {
        useDeviceStore.setState({
            devices: [
                { id: '1', device_nickname: 'Fan', owner: 'user1', status: 'paired' },
                { id: '2', device_nickname: 'TV', owner: '', status: 'unpaired' }
            ],
            userDevices: [{ id: '1', device_nickname: 'Fan', owner: 'user1', status: 'paired' }],
            unpairedDevices: [{ id: '2', device_nickname: 'TV', owner: '', status: 'unpaired' }]
        });
    });

    it('updates device nickname', async () => {
        await act(async () => {
            await useDeviceStore.getState().updateDeviceNickname('1', 'Aircon');
        });
        const devices = useDeviceStore.getState().devices;
        expect(devices.find(d => d.id === '1').device_nickname).toBe('Aircon');
    });

    it('unpairs a device on delete', async () => {
        await act(async () => {
            await useDeviceStore.getState().deleteDevice('1');
        });
        const devices = useDeviceStore.getState().devices;
        expect(devices.find(d => d.id === '1').status).toBe('unpaired');
        expect(devices.find(d => d.id === '1').owner).toBe('');
    });
});
