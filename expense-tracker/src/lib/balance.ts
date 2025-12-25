interface Balance {
  odUserId: string
  kaUserId: string
  iznos: number
}

interface UserBalance {
  odUser: { id: string; name: string | null }
  kaUser: { id: string; name: string | null }
  iznos: number
}

export function calculateBalances(
  expenses: {
    paidById: string
    amount: number
    splits: { userId: string; amount: number }[]
  }[],
  settlements: {
    payerId: string
    receiverId: string
    amount: number
    status: string
  }[]
): Map<string, number> {
  const balances = new Map<string, number>()

  // Racunanje iz troskova
  for (const expense of expenses) {
    // Onaj ko je platio dobija kredit
    const currentPaidBy = balances.get(expense.paidById) || 0
    balances.set(expense.paidById, currentPaidBy + expense.amount)

    // Svako ko ima split gubi taj iznos
    for (const split of expense.splits) {
      const currentSplit = balances.get(split.userId) || 0
      balances.set(split.userId, currentSplit - split.amount)
    }
  }

  // Racunanje iz uplacenih settlements (samo CONFIRMED)
  for (const settlement of settlements) {
    if (settlement.status === "CONFIRMED") {
      // Payer je smanjio dug
      const currentPayer = balances.get(settlement.payerId) || 0
      balances.set(settlement.payerId, currentPayer + settlement.amount)

      // Receiver je primio uplatu
      const currentReceiver = balances.get(settlement.receiverId) || 0
      balances.set(settlement.receiverId, currentReceiver - settlement.amount)
    }
  }

  return balances
}

export function optimizeTransactions(
  balances: Map<string, number>,
  users: { id: string; name: string | null }[]
): UserBalance[] {
  const userMap = new Map(users.map(u => [u.id, u]))

  // Razdvoji na dužnike i primaoce
  const debtors: { userId: string; amount: number }[] = []
  const creditors: { userId: string; amount: number }[] = []

  balances.forEach((balance, odUserId) => {
    if (balance < -0.01) {
      debtors.push({ odUserId, amount: Math.abs(balance) })
    } else if (balance > 0.01) {
      creditors.push({ userId: odUserId, amount: balance })
    }
  })

  // Sortiraj po iznosu (silazno)
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const transactions: UserBalance[] = []

  // Greedy algoritam za minimizaciju transakcija
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0.01) {
      transactions.push({
        odUser: userMap.get(debtor.odUserId) || { id: debtor.odUserId, name: null },
        kaUser: userMap.get(creditor.userId) || { id: creditor.userId, name: null },
        iznos: Math.round(amount * 100) / 100,
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return transactions
}
