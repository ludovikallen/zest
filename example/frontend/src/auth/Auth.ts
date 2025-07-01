import { ExampleVersion1000CultureNeutralPublicKeyTokenNull as AuthService } from "../generated/client";
import { configureAuth } from "@ludovikallen/zest/AuthContext.tsx";

const auth = configureAuth(AuthService);

export const useAuth = auth.useAuth;
export const AuthProvider = auth.AuthProvider;
