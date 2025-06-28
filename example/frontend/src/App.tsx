import AuthContainer from './auth/AuthContainer'
import Weather from './auth/Weather'
import './auth/Auth.css'
import './App.css'

import { ExampleVersion1000CultureNeutralPublicKeyTokenNull as AuthService } from "./generated/client";
import {configureAuth} from "@ludovikallen/zest/AuthContext.tsx";

const auth = configureAuth(AuthService);

export const useAuth = auth.useAuth;
export const AuthProvider = auth.AuthProvider;

function AppContent() {
    const { state } = useAuth();

    return state.isAuthenticated ? <Weather /> : <AuthContainer />;
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <h1>Example App</h1>
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App