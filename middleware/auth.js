import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // normalize the field name regardless of what was signed
    req.user = {
      userId: decoded.userId || decoded.id || decoded._id
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
