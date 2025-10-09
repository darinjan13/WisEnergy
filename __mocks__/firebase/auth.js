// __mocks__/firebase/auth.js
export const getAuth = jest.fn(() => ({
    currentUser: null,
}));

export const initializeAuth = jest.fn(() => ({}));

export const getReactNativePersistence = jest.fn(() => ({}));

export const signInWithEmailAndPassword = jest.fn(() => Promise.resolve({ user: { uid: 'mockUID' } }));

export const createUserWithEmailAndPassword = jest.fn(() => Promise.resolve({ user: { uid: 'mockUID' } }));

export const signOut = jest.fn(() => Promise.resolve());

// ✅ new addition — simulate auth state subscription
export const onAuthStateChanged = jest.fn((auth, callback) => {
    const mockUser = null; // or `{ uid: 'mockUID' }` if you want a logged-in state
    callback(mockUser);
    return jest.fn(); // unsubscribe function
});
