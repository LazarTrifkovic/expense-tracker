export type GroupType = "APARTMENT" | "TRIP" | "PROJECT" | "OTHER"
export type Category = "FOOD" | "TRANSPORT" | "UTILITIES" | "ENTERTAINMENT" | "SHOPPING" | "OTHER"
export type SplitType = "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES"
export type Currency = "RSD" | "EUR"
export type UserRole = "USER" | "BOSS" | "TATA" | "SYSTEM_ADMIN"

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  USER: "Korisnik",
  BOSS: "Šef",
  TATA: "Tata",
  SYSTEM_ADMIN: "Administrator",
}

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  APARTMENT: "Stan",
  TRIP: "Putovanje",
  PROJECT: "Projekat",
  OTHER: "Ostalo",
}

export const CATEGORY_LABELS: Record<Category, string> = {
  FOOD: "Hrana",
  TRANSPORT: "Prevoz",
  UTILITIES: "Računi",
  ENTERTAINMENT: "Zabava",
  SHOPPING: "Kupovina",
  OTHER: "Ostalo",
}

export const SPLIT_TYPE_LABELS: Record<string, string> = {
  EQUAL: "Jednako",
  UNEQUAL: "Nejednako",
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  RSD: "RSD",
  EUR: "EUR",
}

export interface GroupWithMembers {
  id: string
  name: string
  description: string | null
  type: GroupType
  createdAt: Date
  members: {
    id: string
    role: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }[]
  _count: {
    expenses: number
  }
}

export interface ExpenseWithDetails {
  id: string
  title: string
  description: string | null
  amount: number
  currency: string
  date: Date
  category: Category
  splitType: SplitType
  paidBy: {
    id: string
    name: string | null
    email: string
  }
  splits: {
    id: string
    amount: number
    percentage: number | null
    shares: number | null
    user: {
      id: string
      name: string | null
      email: string
    }
  }[]
}

export interface DebtSummary {
  fromUser: {
    id: string
    name: string | null
  }
  toUser: {
    id: string
    name: string | null
  }
  amount: number
}
