import { VerifyAuthToken, standardResponse } from "../helper/helper.js";

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.Authentication;

    if (!token) {
      return res
        .status(401)
        .json(standardResponse(401, "Authentication required"));
    }

    const decoded = VerifyAuthToken(token, process.env.loginSecret);

    if (!decoded) {
      return res
        .status(403)
        .json(standardResponse(403, "Invalid or expired token"));
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.log("Auth error:", err);
    return res
      .status(401)
      .json(standardResponse(401, "Unauthorized"));
  }
};
