export class InputError extends Error {
  status = 400;
}
const text = (value, max = 200) => {
  if (typeof value !== "string" || value.length > max)
    throw new InputError("Invoice text is invalid or too long.");
  return value.trim();
};
const scaled = (value, max) => {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value)))
    throw new InputError(
      "Use non-negative numbers with at most two decimal places.",
    );
  const number = Number(value);
  if (!Number.isFinite(number) || number > max)
    throw new InputError("Invoice amount exceeds the supported limit.");
  return Math.round(number * 100);
};
export function normalizeInvoice(input, complete = false) {
  if (
    !input ||
    !Array.isArray(input.items) ||
    input.items.length < 1 ||
    input.items.length > 100
  )
    throw new InputError("Add between 1 and 100 invoice items.");
  const data = {};
  if (input.clientId) {
    if (
      typeof input.clientId !== "string" ||
      !/^[a-f0-9]{24}$/.test(input.clientId)
    )
      throw new InputError("Invalid client.");
    data.clientId = input.clientId;
  }
  data.clientBillingAddress = text(input.clientBillingAddress ?? "", 1000);
  for (const key of [
    "companyName",
    "companyAddress",
    "clientName",
    "clientAddress",
    "invoiceNumber",
    "invoiceDate",
    "dueDate",
  ])
    data[key] = text(input[key] ?? "", key === "clientAddress" ? 254 : 200);
  for (const key of ["notes", "terms"])
    data[key] = text(input[key] ?? "", 4000);
  data.theme = ["studio", "minimal", "clay"].includes(input.theme)
    ? input.theme
    : "studio";
  data.currency = "USD";
  if (input.currency && input.currency !== "USD")
    throw new InputError("Only USD is currently supported.");
  data.logo = text(input.logo ?? "", 2800000);
  if (
    data.logo &&
    !/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data.logo) &&
    !/^https:\/\//.test(data.logo)
  )
    throw new InputError("Use a PNG/JPG logo or an HTTPS image URL.");
  data.items = input.items.map((item) => ({
    description: text(item.description ?? "", 500),
    quantity: scaled(item.quantity === "" ? 0 : item.quantity, 100000) / 100,
    rate: scaled(item.rate === "" ? 0 : item.rate, 1000000) / 100,
  }));
  data.tax = scaled(input.tax === "" ? 0 : (input.tax ?? 0), 100) / 100;
  data.subtotalMinor = data.items.reduce(
    (sum, item) =>
      sum +
      Math.round(
        (Math.round(item.quantity * 100) * Math.round(item.rate * 100)) / 100,
      ),
    0,
  );
  data.taxMinor = Math.round(
    (data.subtotalMinor * Math.round(data.tax * 100)) / 10000,
  );
  data.totalMinor = data.subtotalMinor + data.taxMinor;
  if (!Number.isSafeInteger(data.totalMinor) || data.totalMinor > 10000000000)
    throw new InputError("Invoice total exceeds the supported limit.");
  if (complete) {
    if (
      !["companyName", "clientName", "invoiceNumber"].every(
        (key) => data[key],
      ) ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.clientAddress)
    )
      throw new InputError(
        "Add your business, invoice number, client name, and a valid client email.",
      );
    for (const key of ["invoiceDate", "dueDate"]) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(data[key]) ||
        Number.isNaN(Date.parse(data[key])) ||
        new Date(data[key]).toISOString().slice(0, 10) !== data[key]
      )
        throw new InputError("Choose valid invoice and due dates.");
    }
    if (
      data.dueDate < data.invoiceDate ||
      !data.totalMinor ||
      data.items.some((item) => !item.description || item.quantity <= 0)
    )
      throw new InputError(
        "Check item descriptions, quantities, total, and due date.",
      );
    if (
      /[\r\n]/.test(data.invoiceNumber + data.companyName + data.clientAddress)
    )
      throw new InputError("Invoice headers cannot contain line breaks.");
  }
  return data;
}
export function validatePdf(file) {
  if (
    !file ||
    file.mimetype !== "application/pdf" ||
    file.size > 4 * 1024 * 1024 ||
    file.buffer.subarray(0, 5).toString() !== "%PDF-" ||
    !file.buffer.subarray(-2048).toString().includes("%%EOF")
  )
    throw new InputError("Upload a complete PDF up to 4 MB.");
}
export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
