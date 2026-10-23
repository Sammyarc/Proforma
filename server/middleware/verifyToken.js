import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Retrieve token from cookies
    const token = req.cookies?.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (
      typeof decoded.userId !== "string" ||
      !/^[a-f0-9]{24}$/i.test(decoded.userId)
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid session" });
    }

    // Attach the user ID to the request object
    req.user = { id: decoded.userId };

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Session expired or invalid. Please sign in again.",
      });
  }
};
