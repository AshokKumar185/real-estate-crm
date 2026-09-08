import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const getJwtSecret = () => process.env.JWT_SECRET ?? "development-only-secret";

export const authenticateUser = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return null;
  }

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), {
    expiresIn: "8h",
  });
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
