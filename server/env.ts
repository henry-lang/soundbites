import dotenv from 'dotenv'
import z from 'zod'
dotenv.config()

const envSchema =  z.object({
    SERVER_PORT: z.coerce.number(),
    RUN_HTTPS: z.coerce.boolean(),
    DB_URL: z.string().nonempty(),
    JWT_SECRET: z.string().nonempty(),
    HTTPS_SERVER_PORT: z.coerce.number(),
    PRIVKEY_PATH: z.string().nonempty(),
    FULLCHAIN_PATH: z.string().nonempty(),
})

envSchema.parse(process.env)

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> {}
    }
}