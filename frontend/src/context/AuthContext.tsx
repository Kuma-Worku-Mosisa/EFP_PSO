import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// 1. Interface matching your Prisma User model exactly
interface User {
  id: number;
  fullName: string;
  email: string;
  username: string;
  roles: string[]; // Array of role names from your join table
  initials: string;
  avatar?: string;
  agencyName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: any, token: string) => void; // Accepts real API response
  updateAvatar: (url: string) => void;
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
      avatar: userData.avatar,
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

  const updateAvatar = (url: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: url };
      setUser(updatedUser);
      localStorage.setItem("efp_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        updateAvatar,
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
