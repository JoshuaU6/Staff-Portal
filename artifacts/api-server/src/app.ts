import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const allowedOrigins: (string | RegExp)[] = [
  "https://mtc-staff-portal.onrender.com",
  "https://delightful-contentment-production-6741.up.railway.app",
  "https://portal.mtc-groups.com",
  "https://www.mtc-groups.com",
  "https://mtc-groups.com",
  "http://localhost:3000",
  /\.onrender\.com$/,
  /\.railway\.app$/,
  /\.vercel\.app$/,
];

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(",").forEach((o) => allowedOrigins.push(o.trim()));
}

app.use(cors({ credentials: true, origin: allowedOrigins }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
    authorizedParties: [
      "https://portal.mtc-groups.com",
      "https://www.mtc-groups.com",
      "https://mtc-groups.com",
      "https://mtc-staff-portal.onrender.com",
      "https://delightful-contentment-production-6741.up.railway.app",
      "http://localhost:3000",
      ...(process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
        : []),
    ],
  })),
);

app.use("/api", router);

export default app;