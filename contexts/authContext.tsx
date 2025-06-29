import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<UserType>(null)
    const router = useRouter()

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            console.log("firebaseUser: ", firebaseUser);
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                });
                updateUserData(firebaseUser.uid)
                router.replace("/(tabs)");
            } else {
                setUser(null)
                router.replace("/(auth)/welcome")
            }
        })
        return () => {
            unsub()
        }
    }, [])



    const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error: any) {
        let msg = error.message;

        if (
            (msg.includes("(auth/invalid-credential)") && (msg = "Böyle bir kullanıcı bulunamadı!")) ||
            (msg.includes("(auth/email-already-in-use)") && (msg = "Bu e-posta adresi zaten kullanılıyor")) ||
            (msg.includes("wrong-password") && (msg = "Şifre yanlış")) ||
            (msg.includes("user-not-found") && (msg = "Kullanıcı bulunamadı")) ||
            (msg.includes("too-many-requests") && (msg = "Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin")) ||
            (msg.includes("network-request-failed") && (msg = "İnternet bağlantınızı kontrol edin")) ||
            (msg.includes("invalid-email") && (msg = "Geçersiz e-posta adresi"))
        ) {
            return { success: false, msg };
        }

        return { success: false, msg };
    }
};

    const register = async (email: string, password: string, name: string) => {
        try {
            let response = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(firestore, "users", response?.user?.uid), {
                name,
                email,
                uid: response?.user?.uid,
            });
            return { success: true };

        } catch (error: any) {
            let msg = error.message;
            if (msg.includes("user-not-found")) {
                msg = "Böyle bir kullanıcı bulunamadı";
            }
            return { success: false, msg };
        }
    }

    const updateUserData = async (uid: string) => {
        try {
            const docRef = doc(firestore, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const userData: UserType = {
                    uid: data?.uid,
                    email: data?.email || null,
                    name: data?.name || null,
                    image: data?.image || null,
                }
                setUser({ ...userData });
            }


        } catch (error: any) {

            let msg = error.message;
            console.log(msg);
        }
    }
    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        updateUserData
    };
    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );


};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
};