import { hasPro } from "../services/billing.js";
// Explicit allowlist: new model fields are private unless intentionally exposed.
export function publicUser(user) {
  if (!user) return null;
  const source = user.toObject ? user.toObject() : user;
  const keys = [
    "_id",
    "email",
    "name",
    "tier", "proStartedAt", "proExpiresAt",
    "isVerified",
    "isGoogleUser",
    "profileImage",
    "businessName",
    "city",
    "country",
    "state",
    "phoneNumber",
    "logoUrl",
    "createdAt",
    "lastLogin",
    "notifications",
  ];
  const result = Object.fromEntries(
    keys
      .filter((key) => source[key] !== undefined)
      .map((key) => [key, source[key]]),
  );
  if (source.tier !== undefined) result.tier = hasPro(source) ? "pro" : "free";
  return result;
}
