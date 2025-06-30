import AuthContainer from './auth/AuthContainer'
import TodoPage from './components/TodoPage'
import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'
import { useAuth, AuthProvider } from './auth/Auth'

function AppContent() {
    const { state } = useAuth();

    return state.isAuthenticated ? <TodoPage /> : <AuthContainer />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <ThemeToggle />
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Example App</h1>
              <p className="t#t-muted-foreground">Welcome to your todo application</p>
            </div>
            <AppContent />
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;