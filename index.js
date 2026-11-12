// index.js

import { env } from "#config";
import { startServer } from "#server";

startServer({
    port: env.APP_PORT,
    appName: env.APP_NAME,
    appUrl: env.APP_URL,
});