import { createContext, useContext, useState, useEffect } from "react";
import * as React from "react";

type AuthState<TUser> = Readonly<{
    loading: boolean;
    user?: TUser;
    error?: any;
    isAuthenticated: boolean;
}>;

interface AuthService<TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> {
    getManageInfo: () => Promise<({
            data: TUser;
            error: undefined;
        } | {
            data: undefined;
            error: TUserError;
        } & {
            request: Request;
            response: Response;
        })>;
    postLogin: (params: { query: { useCookies: boolean }, body: { email: string, password: string } }) => Promise<({
            data: TLogin;
            error: undefined;
        } | {
            data: undefined;
            error: TLoginError;
        } & {
            request: Request;
            response: Response;
        })>;
    postRegister: (params: { body: { email: string, password: string } }) => Promise<({
            data: TRegister;
            error: undefined;
        } | {
            data: undefined;
            error: TRegisterError;
        } & {
            request: Request;
            response: Response;
        })>;
    postLogout: () => Promise<({
            data: TLogout;
            error: undefined;
        } | {
            data: undefined;
            error: TLogoutError;
        } & {
            request: Request;
            response: Response;
        })>;
}

interface Authentication<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> {
    state: AuthState<TUser>
    login: (email: string, password: string) => Promise<({
            data: TLogin;
            error: undefined;
        } | {
            data: undefined;
            error: TLoginError;
        } & {
            request: Request;
            response: Response;
        })>;
    register: (email: string, password: string) => Promise<({
            data: TRegister;
            error: undefined;
        } | {
            data: undefined;
            error: TRegisterError;
        } & {
            request: Request;
            response: Response;
        })>;
    logout: () => Promise<({
            data: TLogout;
            error: undefined;
        } | {
            data: undefined;
            error: TLogoutError;
        } & {
            request: Request;
            response: Response;
        })>;
}

const AuthContext = createContext<Authentication<any, any, any, any, any, any, any>>({
    state: {loading: true, isAuthenticated: false},
    login: async () => {
        throw new Error('AuthContext not initialized')
    },
    register: async () => {
        throw new Error('AuthContext not initialized')
    },
    logout: async () => {
        throw new Error('AuthContext not initialized')
    },
});

interface AuthProviderProps<TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> extends React.PropsWithChildren {
    authService: AuthService<TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>;
}

export type AuthHook<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> = () => Authentication<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>;

interface AuthModule<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> {
    AuthProvider: React.FC<React.PropsWithChildren>;
    useAuth: AuthHook<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>;
}

export function useAuth<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>(): Authentication<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> {
    return useContext(AuthContext) as Authentication<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>;
}

export function configureAuth<TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>(
    authService: AuthService<TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>
): AuthModule<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> {
    function PreconfiguredAuthProvider({ children }: React.PropsWithChildren) {
        return (
            <AuthProvider<TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError> authService={authService}>
                {children}
            </AuthProvider>
        );
    }

    return {
        AuthProvider: PreconfiguredAuthProvider,
        useAuth: useAuth as AuthHook<TUser, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>,
    };
}

const AuthProvider = <TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>({ children, authService }: AuthProviderProps<TUser, TUserError, TLogin, TLoginError, TRegister, TRegisterError, TLogout, TLogoutError>) => {
    const [state, setState] = useState<AuthState<TUser>>({
        loading: true,
        isAuthenticated: false
    });

    const checkAuthStatus = async () => {
        const response = await authService.getManageInfo();

        if (response.data) {
            setState((prevState) => ({
                ...prevState,
                user: response.data,
                loading: false,
                isAuthenticated: true,
                error: undefined
            }));
        } else {
            setState((prevState) => ({
                ...prevState,
                user: undefined,
                loading: false,
                isAuthenticated: false,
                error: response.error
            }));
        }
    };

    useEffect(() => {
        checkAuthStatus().catch(() => {
            // Ignored
        })
    }, [authService]);

    const login = async (email: string, password: string) => {
        try {
            return await authService.postLogin({
                query: {
                    useCookies: true
                },
                body: {
                    email,
                    password,
                },
            });
        } finally {
            await checkAuthStatus();
        }
    };

    const register = async (email: string, password: string)=> {
        return await authService.postRegister({
            body: {
                email,
                password,
            }
        });
    };

    const logout = async () => {
        try {
            return await authService.postLogout();
        } finally {
            await checkAuthStatus();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                state,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};