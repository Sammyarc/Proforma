import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import axios from "axios";
import { User } from "../models/user.model.js";

test("PayPal state is account-bound, expiring, single-use, and cannot choose a redirect", async (t) => {
  Object.assign(process.env, {
    JWT_SECRET: "test-session",
    ENCRYPTION_SECRET: "11".repeat(32),
    PAYPAL_CLIENT_ID: "test-client",
    PAYPAL_SECRET: "test-secret",
    PAYPAL_API_URL: "https://api-m.sandbox.paypal.com",
    BACKEND_URL: "https://api.example.test",
    FRONTEND_URL: "https://app.example.test",
  });
  const { default: routes } = await import("../routes/paypal.routes.js");
  const owner = "aaaaaaaaaaaaaaaaaaaaaaaa",
    other = "bbbbbbbbbbbbbbbbbbbbbbbb";
  let stateRecord,
    providerCalls = 0;
  const mutations = [];
  t.mock.method(User, "findById", () => ({
    select: async () => ({ isVerified: true, isDeleted: false }),
  }));
  t.mock.method(User, "findByIdAndUpdate", async (id, update) => {
    mutations.push(id);
    if (update.$set?.paypalOAuthState) stateRecord = { id, ...update.$set };
    return { _id: id };
  });
  t.mock.method(User, "findOneAndUpdate", async (filter) => {
    if (
      !stateRecord ||
      stateRecord.id !== filter._id ||
      stateRecord.paypalOAuthState !== filter.paypalOAuthState ||
      stateRecord.paypalOAuthExpiresAt <= filter.paypalOAuthExpiresAt.$gt
    )
      return null;
    stateRecord = null;
    return { _id: filter._id };
  });
  t.mock.method(axios, "post", async () => {
    providerCalls++;
    return {
      data: {
        access_token: "test-access",
        refresh_token: "test-refresh",
        expires_in: 3600,
      },
    };
  });
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/paypal", routes);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = (path, user = owner, method = "GET") =>
    fetch(origin + path, {
      signal: AbortSignal.timeout(5000),
      redirect: "manual",
      method,
      headers: user
        ? {
            Cookie: `token=${jwt.sign({ userId: user }, process.env.JWT_SECRET)}`,
          }
        : {},
    });
  assert.equal((await request("/paypal/connect", null, "POST")).status, 401);
  const response = await request("/paypal/connect", owner, "POST");
  assert.equal(response.status, 200);
  const url = new URL((await response.json()).url);
  assert.equal(url.hostname, "www.sandbox.paypal.com");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://api.example.test/paypal/callback",
  );
  const state = url.searchParams.get("state");
  assert.match(state, /^[a-f0-9]{64}$/);
  assert.notEqual(stateRecord.paypalOAuthState, state);
  const callback = `/paypal/callback?code=test&state=${state}&redirect=https://attacker.example`;
  assert.equal((await request(callback, other)).status, 400);
  assert.equal(providerCalls, 0);
  const success = await request(callback);
  assert.equal(success.status, 302);
  assert.equal(
    success.headers.get("location"),
    "https://app.example.test/dashboard/settings?tab=connections",
  );
  assert.equal((await request(callback)).status, 400);
  assert.equal(providerCalls, 1);
  const second = new URL(
    (await (await request("/paypal/connect", owner, "POST")).json()).url,
  );
  stateRecord.paypalOAuthExpiresAt = new Date(0);
  assert.equal(
    (
      await request(
        `/paypal/callback?code=test&state=${second.searchParams.get("state")}`,
      )
    ).status,
    400,
  );
  assert.equal((await request("/paypal/disconnect", null, "POST")).status, 401);
  assert.equal(
    (await request(`/paypal/disconnect?userId=${other}`, owner, "POST")).status,
    200,
  );
  assert(mutations.every((id) => id === owner));
});
