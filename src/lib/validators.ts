import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 karaktera"),
  email: z.string().email("Unesite validnu email adresu"),
  password: z.string().min(6, "Lozinka mora imati najmanje 6 karaktera"),
})

export const loginSchema = z.object({
  email: z.string().email("Unesite validnu email adresu"),
  password: z.string().min(1, "Unesite lozinku"),
})

export const groupSchema = z.object({
  name: z.string().min(1, "Naziv grupe je obavezan"),
  description: z.string().optional(),
  type: z.enum(["APARTMENT", "TRIP", "PROJECT", "OTHER"]),
})

export const expenseSchema = z.object({
  title: z.string().min(1, "Naziv troška je obavezan"),
  description: z.string().optional(),
  amount: z.number().positive("Iznos mora biti pozitivan"),
  currency: z.enum(["RSD", "EUR"]).default("RSD"),
  date: z.string().or(z.date()),
  category: z.enum(["FOOD", "TRANSPORT", "UTILITIES", "ENTERTAINMENT", "SHOPPING", "OTHER"]),
  splitType: z.enum(["EQUAL", "UNEQUAL"]),
  splits: z.array(z.object({
    userId: z.string(),
    amount: z.number(),
  })).optional(),
})

export const inviteSchema = z.object({
  email: z.string().email("Unesite validnu email adresu"),
})

export const settlementSchema = z.object({
  receiverId: z.string(),
  amount: z.number().positive("Iznos mora biti pozitivan"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type GroupInput = z.infer<typeof groupSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type InviteInput = z.infer<typeof inviteSchema>
export type SettlementInput = z.infer<typeof settlementSchema>
