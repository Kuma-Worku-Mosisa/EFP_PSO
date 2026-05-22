import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiRequest } from "../lib/api";

// 1. Interface matching your Prisma User model exactly
interface User {
  id: number;
  fullName: string;
  email: string;
  username: string;
  phone?: string;
  faydaId?: string;
  roles: string[]; // Array of role names from your join table
  initials: string;
  avatar?: string; // client-side field
  photoUrl?: string; // backend field
  agencyName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any, token: string) => void; // Accepts real API response
  updateAvatar: (url: string) => void;
  updateUserProfile: (profile: any) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Load session from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem("efp_user");
    const savedToken = localStorage.getItem("efp_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  // 3. Real Login: Now takes the user object and token from your backend
  const login = (userData: any, authToken: string) => {
    // Generate initials automatically from the real fullName
    const initials = userData.fullName
      ? userData.fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
      : "U";

    const cleanUser: User = {
      id: userData.id,
      fullName: userData.fullName,
      email: userData.email,
      username: userData.username,
      roles: userData.roles || [],
      initials: initials,
      avatar: userData.avatar ?? userData.photoUrl ?? userData.photo_url,
      photoUrl: userData.photoUrl ?? userData.photo_url ?? userData.avatar,
      phone: userData.phone,
      faydaId: userData.faydaId,
      agencyName: userData.agencyName,
    };

    setUser(cleanUser);
    setToken(authToken);

    localStorage.setItem("efp_user", JSON.stringify(cleanUser));
    localStorage.setItem("efp_token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("efp_user");
    localStorage.removeItem("efp_token");
  };

  const updateUserProfile = async (profile: any) => {
    const res = await apiRequest<{
      success: boolean;
      message: string;
      data: any;
    }>("/users/me", {
      method: "PUT",
      body: JSON.stringify(profile),
    });

    const updated = res.data;
    if (!updated) return null;

    const initials = updated.fullName
      ? updated.fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
      : "U";

    const cleanUser: User = {
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      username: updated.username,
      roles: updated.roles || (user?.roles ?? []),
      initials,
      avatar: updated.photoUrl ?? updated.avatar ?? user?.avatar,
      photoUrl: updated.photoUrl ?? updated.avatar ?? user?.photoUrl,
      phone: updated.phone ?? user?.phone,
      faydaId: updated.faydaId ?? user?.faydaId,
      agencyName: updated.agencyName ?? user?.agencyName,
    };

    setUser(cleanUser);
    localStorage.setItem("efp_user", JSON.stringify(cleanUser));

    return cleanUser;
  };

  const updateAvatar = (url: string) => {
    // Persist avatar immediately to UI and then sync via API
    if (user) {
      const optimistic = { ...user, avatar: url };
      setUser(optimistic);
      localStorage.setItem("efp_user", JSON.stringify(optimistic));
      // Fire-and-forget API call to persist
      updateUserProfile({ photoUrl: url }).catch(() => {
        // ignore errors here; user stays updated locally
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        updateAvatar,
        updateUserProfile,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
