export type GroupType = "APARTMENT" | "TRIP" | "PROJECT" | "OTHER"
export type Category = "FOOD" | "TRANSPORT" | "UTILITIES" | "ENTERTAINMENT" | "SHOPPING" | "OTHER"
export type SplitType = "EQUAL" | "UNEQUAL" | "PERCENTAGE" | "SHARES"

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

export const SPLIT_TYPE_LABELS: Record<SplitType, string> = {
  EQUAL: "Jednako",
  UNEQUAL: "Nejednako",
  PERCENTAGE: "Po procentima",
  SHARES: "Po udelima",
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
