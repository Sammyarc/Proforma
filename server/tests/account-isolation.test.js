import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import Invoice from "../models/invoice.model.js";
import InvoiceLog from "../models/invoice.log.js";
import Usage from "../models/usage.model.js";
import invoiceRoutes from "../routes/invoice.routes.js";
import settingsRoutes from "../routes/settings.routes.js";
import { publicUser } from "../utils/publicUser.js";

const owner = "aaaaaaaaaaaaaaaaaaaaaaaa";
const other = "bbbbbbbbbbbbbbbbbbbbbbbb";
const invoiceId = "cccccccccccccccccccccccc";
function query(value) {
  const result = {
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  for (const method of ["select", "sort", "skip", "limit", "lean"])
    result[method] = () => result;
  return result;
}

test("private routes reject anonymous access and isolate two accounts", async (t) => {
  process.env.JWT_SECRET = "isolated-test-secret-not-production";
  t.mock.method(Usage, "findById", async id => ({ _id: id, count: 1, invoices: [] }));
  let verified = true,
    deleted = false;
  const reads = [],
    writes = [];
  t.mock.method(User, "findById", (id) => {
    reads.push(id);
    return query({
      _id: id,
      email: "owner@example.test",
      isVerified: verified,
      isDeleted: deleted,
      createdAt: new Date(),
      save: async () => writes.push(id),
    });
  });
  t.mock.method(User, "findByIdAndUpdate", (id, update) => {
    writes.push(id);
    return query({
      _id: id,
      email: "owner@example.test",
      password: "hidden",
      resetPasswordToken: "hidden",
      ...update.$set,
    });
  });
  t.mock.method(Invoice, "find", (filter) => {
    reads.push(filter.userId);
    return query([{ userId: filter.userId }]);
  });
  t.mock.method(Invoice, "countDocuments", (filter) => {
    reads.push(filter.userId);
    return query(1);
  });
  t.mock.method(InvoiceLog, "countDocuments", (filter) => {
    reads.push(filter.userId);
    return query(1);
  });
  t.mock.method(Invoice, "aggregate", (pipeline) => {
    reads.push(pipeline[0].$match.userId);
    return query([]);
  });
  for (const method of ["findOne", "findOneAndDelete"]) {
    t.mock.method(Invoice, method, (filter) => {
      reads.push(filter.userId);
      // This record belongs to account B and must not be returned to account A.
      return query(
        filter._id === invoiceId && filter.userId === other
          ? { _id: invoiceId, userId: other }
          : null,
      );
    });
  }
  const app = express();
  app.use(express.json(), cookieParser());
  app.use("/invoices", invoiceRoutes);
  app.use("/settings", settingsRoutes);
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
  const token = jwt.sign({ userId: owner }, process.env.JWT_SECRET);
  async function request(path, method = "GET", body, session = token) {
    return fetch(origin + path, {
      signal: AbortSignal.timeout(5000),
      method,
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Cookie: `token=${session}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  for (const path of [
    "/invoices/invoices",
    "/invoices/count",
    "/invoices/invoices/stats/overview",
    "/invoices/invoices/stats/summary",
    "/invoices/invoices/clients",
  ]) {
    assert.equal((await request(path, "GET", undefined, null)).status, 401);
    const response = await request(path + `?userId=${other}`);
    assert.equal(response.status, 200, path);
  }
  assert.equal(
    (await request(`/invoices/invoices/${invoiceId}?userId=${other}`)).status,
    404,
  );
  assert.equal(
    (await request(`/invoices/invoices/${invoiceId}?userId=${other}`, "DELETE"))
      .status,
    404,
  );
  assert.equal(
    (
      await request(
        `/invoices/invoices/${invoiceId}`,
        "DELETE",
        undefined,
        null,
      )
    ).status,
    401,
  );
  assert.equal((await request("/invoices/invoices/not-an-id")).status, 400);
  assert.equal((await request("/invoices/invoices?limit=999999")).status, 400);
  assert.equal(
    (await request("/invoices/invoices?status[$ne]=paid")).status,
    400,
  );
  assert.equal(
    (await request("/settings/soft-delete", "PATCH", undefined, null)).status,
    401,
  );
  assert.equal(
    (await request(`/settings/soft-delete?userId=${other}`, "PATCH")).status,
    200,
  );
  const update = await request("/settings/user-settings", "PUT", {
    userId: other,
    city: "",
    tier: "pro",
  });
  assert.equal(update.status, 200);
  const safe = await update.json();
  assert.equal(safe.city, "");
  assert.equal(safe.password, undefined);
  assert.equal(safe.resetPasswordToken, undefined);
  assert.equal(safe.tier, undefined);
  assert.equal(
    (
      await request("/settings/user-settings", "PUT", {
        email: "attacker@example.test",
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("/invoices/invoices", "GET", undefined, "invalid")).status,
    401,
  );
  const expired = jwt.sign({ userId: owner }, process.env.JWT_SECRET, {
    expiresIn: -1,
  });
  assert.equal(
    (await request("/invoices/invoices", "GET", undefined, expired)).status,
    401,
  );
  verified = false;
  assert.equal((await request("/invoices/invoices")).status, 403);
  verified = true;
  deleted = true;
  assert.equal((await request("/invoices/invoices")).status, 401);
  assert(reads.length > 10);
  assert(
    reads.every((id) => id === owner),
    "No query may read another account's records",
  );
  assert(writes.length >= 2);
  assert(
    writes.every((id) => id === owner),
    "No mutation may target another account",
  );
});

test("public account serialization excludes all authentication and provider secrets", () => {
  const result = publicUser({
    _id: owner,
    name: "Owner",
    password: "hash",
    verificationToken: "123456",
    resetPasswordToken: "secret",
    paypal: { accessToken: "secret" },
    newPrivateField: "secret",
  });
  assert.deepEqual(result, { _id: owner, name: "Owner" });
});
