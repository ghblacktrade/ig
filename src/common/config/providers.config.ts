import { registerAs } from '@nestjs/config';

export const papara = registerAs('papara', () => ({
    baseUrl: process.env.PAPARA_BASE_URL!,
    apiKey: process.env.PAPARA_API_KEY!,
}));


export const decard = registerAs('decard', () => ({
    baseUrl: process.env.DECARD_BASE_URL!,
    apiKey: process.env.DECARD_API_KEY!,
    secret: process.env.DECARD_API_SECRET!,
}));