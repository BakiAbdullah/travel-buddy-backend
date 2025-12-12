import { z } from "zod";

const createAdmin = z.object({
  password: z.string({
    error: "Password is required",
  }),
  admin: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
    contactNumber: z.string({
      error: "Contact Number is required!",
    }),
  }),
});
const createUser = z.object({
  password: z.string({
    error: "Password is required",
  }),
  user: z.object({
    name: z.string({
      error: "Name is required!",
    }),
    email: z.string({
      error: "Email is required!",
    }),
  }),
});



export const userValidation = {
  createAdmin,
  createUser,
};
