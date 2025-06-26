export interface ProjectOptions {
    projectName: string;
    useAuth: boolean;
    features: string[];
    packageManager: 'npm' | 'yarn' | 'pnpm';
}
export interface FeatureChoice {
    name: string;
    value: string;
}
export interface DotNetVersionChoice {
    name: string;
    value: string;
}
export declare const AVAILABLE_FEATURES: FeatureChoice[];
//# sourceMappingURL=types.d.ts.map