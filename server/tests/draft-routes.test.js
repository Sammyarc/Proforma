import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import router from "../routes/drafts.routes.js";
import Draft from "../models/draft.model.js";
import Attachment from "../models/attachment.model.js";
import Delivery from "../models/delivery.model.js";
import Client from "../models/client.model.js";
import { User } from "../models/user.model.js";
test("draft and PDF routes enforce ownership, versions, authentication and frozen state", async (t) => {
  process.env.JWT_SECRET = "draft-isolated-test-secret";
  t.mock.method(Client, "exists", async (filter) => {
    assert.equal(filter.userId, "aaaaaaaaaaaaaaaaaaaaaaaa");
    assert.equal(filter.archived, false);
    return null;
  });
  const owner = "aaaaaaaaaaaaaaaaaaaaaaaa",
    id = "cccccccccccccccccccccccc";
  const record = {
    _id: id,
    userId: owner,
    revision: 1,
    lifecycle: "draft",
    data: {
      companyName: "Studio",
      clientName: "Client",
      clientAddress: "client@example.com",
      invoiceNumber: "INV-1",
      invoiceDate: "2026-10-23",
      dueDate: "2026-11-23",
      items: [{ description: "Design", quantity: 1, rate: 10 }],
    },
  };
  const query = (value) => ({
    select: async () => value,
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  });
  t.mock.method(User, "findById", (userId) =>
    query({ _id: userId, isVerified: true }),
  );
  t.mock.method(Draft, "findOne", (filter) =>
    query(
      filter.userId === owner &&
        (filter.revision === undefined || filter.revision === record.revision)
        ? record
        : null,
    ),
  );
  t.mock.method(Draft, "findOneAndUpdate", async (filter) =>
    filter.userId === owner &&
    filter.revision === record.revision &&
    record.lifecycle === "draft"
      ? { ...record, revision: ++record.revision }
      : null,
  );
  t.mock.method(Delivery, "findOne", () => query(null));
  t.mock.method(Attachment, "findOne", (filter) =>
    query(
      filter.userId === owner
        ? { content: Buffer.from("%PDF-1.7\n%%EOF"), filename: "invoice.pdf" }
        : null,
    ),
  );
  t.mock.method(Attachment, "create", async (value) => {
    assert.equal(value.userId, owner);
    assert.equal(value.revision, record.revision);
    return { _id: id };
  });
  const app = express();
  app.use(express.json(), cookieParser(), router);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const cookie = (userId) =>
    `token=${jwt.sign({ userId }, process.env.JWT_SECRET)}`;
  const request = (path, options = {}, user = owner) =>
    fetch(base + path, {
      ...options,
      headers: { cookie: cookie(user), ...options.headers },
    });
  assert.equal((await fetch(base + `/drafts/${id}`)).status, 401);
  assert.equal(
    (await request(`/drafts/${id}`, {}, "bbbbbbbbbbbbbbbbbbbbbbbb")).status,
    404,
  );
  assert.equal(
    (await request(`/documents/${id}`, {}, "bbbbbbbbbbbbbbbbbbbbbbbb")).status,
    404,
  );
  assert.equal(
    (await request(`/documents/${id}`)).headers.get("cache-control"),
    "private, no-store",
  );
  const save = (revision) =>
    request(`/drafts/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ revision, data: record.data, userId: "forged" }),
    });
  const invalidClient = await request(`/drafts/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      revision: 1,
      data: { ...record.data, clientId: "bbbbbbbbbbbbbbbbbbbbbbbb" },
    }),
  });
  assert.equal(invalidClient.status, 400);
  assert.equal((await save(1)).status, 200);
  assert.equal((await save(1)).status, 409);
  const upload = (revision) => {
    const form = new FormData();
    form.append("revision", String(revision));
    form.append(
      "file",
      new Blob(["%PDF-1.7\n%%EOF"], { type: "application/pdf" }),
      "invoice.pdf",
    );
    return request(`/drafts/${id}/attachment`, { method: "POST", body: form });
  };
  assert.equal((await upload(1)).status, 409);
  assert.equal((await upload(2)).status, 201);
  record.lifecycle = "locked";
  assert.equal((await save(2)).status, 409);
});
