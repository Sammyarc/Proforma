import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import router, { clientInput } from "../routes/clients.routes.js";
import Client from "../models/client.model.js";
import Invoice from "../models/invoice.model.js";
import { User } from "../models/user.model.js";
import { normalizeInvoice } from "../services/invoiceData.js";
test("client validation normalizes email, rejects invalid values, and preserves invoice snapshots", () => {
  assert.equal(
    clientInput({ name: " Client ", email: " CLIENT@EXAMPLE.COM " }).email,
    "client@example.com",
  );
  for (const input of [
    { name: "", email: "a@b.com" },
    { name: "Bad\nname", email: "a@b.com" },
    { name: "Client", email: "invalid" },
    { name: "Client", email: "a@b.com", notes: "a".repeat(4001) },
  ])
    assert.throws(() => clientInput(input));
  const data = normalizeInvoice({
    clientId: "cccccccccccccccccccccccc",
    clientName: "Original name",
    clientBillingAddress: "Lagos",
    items: [{ description: "Work", quantity: 1, rate: 100 }],
  });
  assert.equal(data.clientId, "cccccccccccccccccccccccc");
  assert.equal(data.clientBillingAddress, "Lagos");
});
test("client CRUD, archives, conflicts and history remain scoped to the session", async (t) => {
  process.env.JWT_SECRET = "isolated-client-tests";
  const owner = "aaaaaaaaaaaaaaaaaaaaaaaa",
    other = "bbbbbbbbbbbbbbbbbbbbbbbb",
    id = "cccccccccccccccccccccccc";
  let record;
  const filters = [];
  const query = (value) => {
    const q = {
      then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
    };
    for (const key of ["select", "sort", "skip", "limit"]) q[key] = () => q;
    return q;
  };
  t.mock.method(User, "findById", (userId) =>
    query({ _id: userId, isVerified: true }),
  );
  t.mock.method(Client, "create", async (value) => {
    if (record) throw Object.assign(new Error(), { code: 11000 });
    record = { ...value, _id: id, revision: 1, archived: false };
    return record;
  });
  t.mock.method(Client, "findOne", (filter) =>
    query(
      record?.userId === filter.userId && filter._id === id ? record : null,
    ),
  );
  t.mock.method(Client, "findOneAndUpdate", async (filter, update) => {
    if (filter.userId !== record.userId || filter.revision !== record.revision)
      return null;
    record = { ...record, ...update.$set, revision: record.revision + 1 };
    return record;
  });
  t.mock.method(Client, "find", (filter) => {
    filters.push(filter);
    return query(
      record &&
        filter.userId === record.userId &&
        record.archived === filter.archived
        ? [record]
        : [],
    );
  });
  t.mock.method(Client, "countDocuments", async () => 1);
  t.mock.method(Invoice, "find", (filter) => {
    filters.push(filter);
    return query([{ _id: "invoice", clientName: "Historical name" }]);
  });
  t.mock.method(Invoice, "countDocuments", async () => 1);
  const app = express();
  app.use(express.json(), cookieParser(), router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, method = "GET", body, userId = owner) =>
    fetch(base + path, {
      method,
      headers: {
        "content-type": "application/json",
        cookie: `token=${jwt.sign({ userId }, process.env.JWT_SECRET)}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  assert.equal((await fetch(base + "/")).status, 401);
  let response = await request("/", "POST", {
    name: "Client",
    email: "Client@example.com",
    userId: other,
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).client.userId, owner);
  assert.equal(
    (await request("/", "POST", { name: "Other", email: "client@example.com" }))
      .status,
    409,
  );
  assert.equal((await request(`/${id}`, "GET", undefined, other)).status, 404);
  assert.equal(
    (await request(`/${id}/invoices`, "GET", undefined, other)).status,
    404,
  );
  assert.equal(
    (await request(`/${id}`, "PATCH", { revision: 1, archived: true }, other))
      .status,
    409,
  );
  assert.equal(
    (
      await request(`/${id}`, "PATCH", {
        revision: 1,
        name: "Edited",
        email: "new@example.com",
      })
    ).status,
    200,
  );
  assert.equal(
    (await request(`/${id}`, "PATCH", { revision: 1, archived: true })).status,
    409,
  );
  assert.equal(
    (await request(`/${id}`, "PATCH", { revision: 2, archived: true })).status,
    200,
  );
  assert.equal(
    (await (await request("/?archived=false")).json()).clients.length,
    0,
  );
  assert.equal(
    (await (await request("/?archived=true")).json()).clients.length,
    1,
  );
  assert.equal(
    (await request(`/${id}`, "PATCH", { revision: 3, archived: false })).status,
    200,
  );
  const history = await (await request(`/${id}/invoices`)).json();
  assert.equal(history.invoices[0].clientName, "Historical name");
  assert.equal(filters.at(-1).userId, owner);
  assert.equal(filters.at(-1).$or[0].clientId, id);
  assert.equal((await request("/?page=-1")).status, 400);
  await request("/?search=%5B");
  assert.equal(filters.at(-1).$or[0].name.$regex, "\\[");
});
