export declare const unifiedConfig: () => {
    app: {
        nodeEnv: string;
        port: number;
        frontendOrigins: string[];
    };
    auth: {
        jwtSecret: string;
        accessTokenTtl: string;
        refreshTokenTtlDays: number;
    };
    database: {
        url: string;
    };
    redis: {
        url: string | undefined;
    };
};
export type UnifiedConfig = ReturnType<typeof unifiedConfig>;
