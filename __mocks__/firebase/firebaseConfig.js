// __mocks__/firebase/firebaseConfig.js
import { serverTimestamp } from "firebase/database";

export const auth = {
    currentUser: { uid: "test-user-id" },
};

export const mockSet = jest.fn(() => Promise.resolve());
export const mockGet = jest.fn(() => Promise.resolve({ exists: () => false }));
export const db = {
    // Mock serverTimestamp as a function
    serverTimestamp: jest.fn(() => "mocked_timestamp"),
    ref: jest.fn(() => ({})),
    get: mockGet,
    set: mockSet,
    update: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
};

export const fs = {};
export const firebaseApp = {};
console.log("✅ Firebase mock loaded");
