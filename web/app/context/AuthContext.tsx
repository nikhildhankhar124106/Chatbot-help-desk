"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = "unibot_auth_user";
const LOCAL_STORAGE_USERS_KEY = "unibot_registered_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check whether Firebase API key is real or placeholder
  const isRealFirebaseConfig = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("Dummy")
  );

  useEffect(() => {
    // 1. Check local session storage first
    try {
      const storedSession = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setUser(parsed);
        setToken("local_token_" + parsed.uid);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Could not load local session:", e);
    }

    // 2. If real Firebase config is available, listen to Firebase Auth
    if (isRealFirebaseConfig) {
      try {
        const unsubscribe = onAuthStateChanged(
          auth,
          async (firebaseUser) => {
            if (firebaseUser) {
              try {
                const idToken = await firebaseUser.getIdToken();
                setToken(idToken);
                const u: AuthUser = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName,
                  photoURL: firebaseUser.photoURL,
                };
                setUser(u);
                try {
                  localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(u));
                } catch {}
              } catch (e) {
                console.error("Failed to get Firebase token:", e);
              }
            } else {
              setUser(null);
              setToken(null);
            }
            setLoading(false);
          },
          (error) => {
            console.warn("Firebase Auth Notice:", error?.message);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (e) {
        console.warn("Firebase Auth setup notice:", e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [isRealFirebaseConfig]);

  const saveLocalSession = (u: AuthUser) => {
    setUser(u);
    setToken("local_token_" + u.uid);
    try {
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(u));
    } catch {}
  };

  const loginWithGoogle = async () => {
    if (isRealFirebaseConfig) {
      try {
        await signInWithPopup(auth, googleProvider);
        return;
      } catch (err: any) {
        console.warn("Firebase Google login failed, using local session:", err?.message);
      }
    }

    // Local fallback for seamless development/testing without Firebase setup
    const localUser: AuthUser = {
      uid: "google_" + Date.now(),
      email: "student@unibot.ai",
      displayName: "UniBot Student",
      photoURL: null,
    };
    saveLocalSession(localUser);
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (isRealFirebaseConfig) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return;
      } catch (err: any) {
        // If it's not an invalid API key, let normal invalid credential errors bubble
        if (!err?.message?.includes("api-key")) {
          throw err;
        }
      }
    }

    // Local fallback: verify against local registered users or create session
    try {
      const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      const storedUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const found = storedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (found) {
        if (found.password && found.password !== password) {
          throw new Error("Invalid password. Please check your credentials.");
        }
        const u: AuthUser = {
          uid: found.uid || "local_" + Date.now(),
          email: found.email,
          displayName: found.displayName || found.name || email.split("@")[0],
          photoURL: null,
        };
        saveLocalSession(u);
        return;
      }
    } catch (e: any) {
      if (e.message?.includes("Invalid password")) throw e;
    }

    // If not found in stored users, create fresh session
    const localUser: AuthUser = {
      uid: "local_" + Date.now(),
      email,
      displayName: email.split("@")[0],
      photoURL: null,
    };
    saveLocalSession(localUser);
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    if (isRealFirebaseConfig) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name });
          const idToken = await userCredential.user.getIdToken(true);
          setToken(idToken);
          const u: AuthUser = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name,
            photoURL: userCredential.user.photoURL,
          };
          saveLocalSession(u);
          return;
        }
      } catch (err: any) {
        // If it's a real Firebase error like email-already-in-use, throw it
        if (!err?.message?.includes("api-key")) {
          throw err;
        }
      }
    }

    // Fallback: save to localStorage registered users & immediately log in
    const newUser = {
      uid: "user_" + Date.now(),
      email,
      password,
      name,
      displayName: name,
    };

    try {
      const storedUsersRaw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      const storedUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      storedUsers.push(newUser);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(storedUsers));
    } catch {}

    const authUser: AuthUser = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: name,
      photoURL: null,
    };
    saveLocalSession(authUser);
  };

  const logout = async () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    } catch {}
    setUser(null);
    setToken(null);
    if (isRealFirebaseConfig) {
      try {
        await signOut(auth);
      } catch {}
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
