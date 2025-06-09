import AuthContainer from './auth/AuthContainer'
import Weather from './auth/Weather'
import './auth/Auth.css'
import './App.css'

import { ExampleVersion1000CultureNeutralPublicKeyTokenNullService as AuthService } from "./generated/client";
import {configureAuth} from "zest-framework/AuthContext.tsx";

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
        <h1>Weather Forecast App</h1>
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App