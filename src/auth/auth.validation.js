const { z } = require("zod");

const emailSchema = z.email("Invalid email format").toLowerCase().trim();
const passwordSchema = z
  .string()
  .min(8, "Password muast be at least 8 character")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
