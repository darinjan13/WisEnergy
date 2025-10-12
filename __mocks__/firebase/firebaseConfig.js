// ✅ Jest mock for firebase/firebaseConfig
export const auth = {
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
};

export const db = {
    ref: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
};

export const fs = {};
export const firebaseApp = {};
console.log("✅ Firebase mock loaded");
