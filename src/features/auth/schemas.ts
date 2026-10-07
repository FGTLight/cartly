import { z } from 'zod'

const email = z.email('Enter a valid email address').trim().toLowerCase()

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
})

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your name')
      .max(80, 'Use at most 80 characters'),
    email,
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
