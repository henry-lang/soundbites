import dotenv from 'dotenv'
import { is } from 'typescript-is'
dotenv.config()

interface Environment {
    SERVER_PORT: number,
    RUN_HTTPS: string,
    DB_URL: string,
    JWT_SECRET: string,
    HTTPS_SERVER_PORT: number,
    PRIVKEY_PATH: string,
    FULLCHAIN_PATH: string,
}

function onExit(): never {
    console.log("Config is not valid. Exiting!")
    console.log(process.env)
    process.exit();
}

export const env = is<Environment>(process.env) ? process.env : onExit()