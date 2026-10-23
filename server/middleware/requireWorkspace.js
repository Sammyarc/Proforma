import { User } from "../models/user.model.js";
import { verifyToken } from "./verifyToken.js";

export const requireWorkspace = [
  verifyToken,
  async (req, res, next) => {
    try {
      const account = await User.findById(req.user.id).select(
        "isVerified isDeleted tier createdAt",
      );
      if (!account || account.isDeleted)
        return res
          .status(401)
          .json({ message: "Please sign in to an active account." });
      if (!account.isVerified)
        return res
          .status(403)
          .json({ message: "Verify your email before using your workspace." });
      req.account = account;
      next();
    } catch {
      res
        .status(503)
        .json({ message: "Unable to verify your account. Please try again." });
    }
  },
];
