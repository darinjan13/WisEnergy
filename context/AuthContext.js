// import { Redirect } from "expo-router";
// import { useContext, createContext, useState, useEffect } from "react";
// import { Text, SafeAreaView } from "react-native";

// const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//     const [loading, setLoading] = useState(false);
//     const [session, setSession] = useState(false);
//     const [user, setUser] = useState(false);

//     useEffect(() => {
//         console.log(session);
//     }, [session])

//     const signin = async ({ email, password }) => {
//         let myEmail = "darinjan13@gmail.com";
//         let myPassword = "1234567";
//         if (email == myEmail && password == myPassword) {
//             setSession(true);
//             setUser(email);
//             <Redirect href="(tabs)" />
//         }
//     };
//     const signout = async () => { };

//     const contextData = { session, user, signin, signout };
//     return (
//         <AuthContext.Provider value={contextData}>
//             {loading ? (
//                 <SafeAreaView>
//                     <Text>Loading..</Text>
//                 </SafeAreaView>
//             ) : (
//                 children
//             )}
//         </AuthContext.Provider>
//     );
// };

// const useAuth = () => {
//     return useContext(AuthContext);
// };

// export { useAuth, AuthContext, AuthProvider };