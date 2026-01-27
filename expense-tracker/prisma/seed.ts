import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Brisanje svih grupa i povezanih podataka...")
  await prisma.invitation.deleteMany()
  await prisma.settlement.deleteMany()
  await prisma.expenseSplit.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.group.deleteMany()
  console.log("Obrisano.")

  // Kreiraj / pronadji korisnike
  const kristina = await prisma.user.upsert({
    where: { email: "kristina@gmail.com" },
    update: {},
    create: {
      email: "kristina@gmail.com",
      name: "Kristina",
      password: await bcrypt.hash("20220515", 10),
    },
  })
  console.log("Korisnik: Kristina")

  const vukota = await prisma.user.upsert({
    where: { email: "vukota@gmail.com" },
    update: {},
    create: {
      email: "vukota@gmail.com",
      name: "Vukota",
      password: await bcrypt.hash("20220191", 10),
    },
  })
  console.log("Korisnik: Vukota")

  const ratko = await prisma.user.upsert({
    where: { email: "ratko@gmail.com" },
    update: {},
    create: {
      email: "ratko@gmail.com",
      name: "Ratko",
      password: await bcrypt.hash("20220316", 10),
    },
  })
  console.log("Korisnik: Ratko")

  const lazar = await prisma.user.findUnique({
    where: { email: "lazartrifkovic02@gmail.com" },
  })
  if (!lazar) {
    throw new Error("Korisnik Lazar (lazartrifkovic02@gmail.com) nije pronadjen u bazi!")
  }
  console.log("Korisnik: Lazar (postojeci)")

  // Helper za kreiranje troska sa EQUAL splitom
  async function createExpense(
    groupId: string,
    title: string,
    amount: number,
    category: "FOOD" | "TRANSPORT" | "UTILITIES" | "ENTERTAINMENT" | "SHOPPING" | "OTHER",
    paidById: string,
    memberIds: string[],
    date: Date,
    currency: string = "RSD"
  ) {
    const splitAmount = Math.round((amount / memberIds.length) * 100) / 100
    await prisma.expense.create({
      data: {
        title,
        amount,
        currency,
        category,
        splitType: "EQUAL",
        date,
        groupId,
        paidById,
        splits: {
          create: memberIds.map(userId => ({
            userId,
            amount: splitAmount,
          })),
        },
      },
    })
  }

  // ==========================================
  // GRUPA 1: Put u Pariz
  // ==========================================
  const pariz = await prisma.group.create({
    data: {
      name: "Put u Pariz",
      type: "TRIP",
      createdById: lazar.id,
      members: {
        create: [
          { userId: lazar.id, role: "ADMIN" },
          { userId: kristina.id, role: "MEMBER" },
          { userId: vukota.id, role: "MEMBER" },
        ],
      },
    },
  })
  console.log("Grupa: Put u Pariz")

  const parizMembers = [lazar.id, kristina.id, vukota.id]

  await createExpense(pariz.id, "Avio karte", 45000, "TRANSPORT", kristina.id, parizMembers, new Date("2025-06-10"))
  await createExpense(pariz.id, "Hotel (3 noci)", 36000, "OTHER", lazar.id, parizMembers, new Date("2025-06-11"))
  await createExpense(pariz.id, "Vecera u restoranu", 8500, "FOOD", lazar.id, parizMembers, new Date("2025-06-12"))
  await createExpense(pariz.id, "Metro karte", 3200, "TRANSPORT", vukota.id, parizMembers, new Date("2025-06-12"))
  await createExpense(pariz.id, "Muzej Luvr - ulaznice", 4500, "ENTERTAINMENT", kristina.id, parizMembers, new Date("2025-06-13"))
  await createExpense(pariz.id, "Rucak u bistrou", 6200, "FOOD", vukota.id, parizMembers, new Date("2025-06-13"))
  await createExpense(pariz.id, "Suveniri", 5800, "SHOPPING", lazar.id, parizMembers, new Date("2025-06-14"))
  await createExpense(pariz.id, "Taksi do aerodroma", 2800, "TRANSPORT", kristina.id, parizMembers, new Date("2025-06-15"))
  console.log("  Dodato 8 troskova za Pariz")

  // ==========================================
  // GRUPA 2: Troskovi za stan
  // ==========================================
  const stan = await prisma.group.create({
    data: {
      name: "Troškovi za stan",
      type: "APARTMENT",
      createdById: lazar.id,
      members: {
        create: [
          { userId: lazar.id, role: "ADMIN" },
          { userId: vukota.id, role: "MEMBER" },
        ],
      },
    },
  })
  console.log("Grupa: Troškovi za stan")

  const stanMembers = [lazar.id, vukota.id]

  await createExpense(stan.id, "Struja - januar", 5500, "UTILITIES", vukota.id, stanMembers, new Date("2025-01-15"))
  await createExpense(stan.id, "Internet", 3000, "UTILITIES", lazar.id, stanMembers, new Date("2025-01-20"))
  await createExpense(stan.id, "Namirnice - nedeljne", 7200, "FOOD", vukota.id, stanMembers, new Date("2025-01-22"))
  await createExpense(stan.id, "Sredstva za ciscenje", 1800, "SHOPPING", lazar.id, stanMembers, new Date("2025-01-25"))
  await createExpense(stan.id, "Struja - februar", 6100, "UTILITIES", lazar.id, stanMembers, new Date("2025-02-15"))
  await createExpense(stan.id, "Voda - februar", 2400, "UTILITIES", vukota.id, stanMembers, new Date("2025-02-18"))
  await createExpense(stan.id, "Namirnice - mesecne", 9500, "FOOD", lazar.id, stanMembers, new Date("2025-02-20"))
  await createExpense(stan.id, "Komunalije", 4200, "UTILITIES", vukota.id, stanMembers, new Date("2025-02-28"))
  console.log("  Dodato 8 troskova za stan")

  // ==========================================
  // GRUPA 3: Put u Amsterdam
  // ==========================================
  const amsterdam = await prisma.group.create({
    data: {
      name: "Put u Amsterdam",
      type: "TRIP",
      createdById: lazar.id,
      members: {
        create: [
          { userId: lazar.id, role: "ADMIN" },
          { userId: ratko.id, role: "MEMBER" },
        ],
      },
    },
  })
  console.log("Grupa: Put u Amsterdam")

  const amsterdamMembers = [lazar.id, ratko.id]

  await createExpense(amsterdam.id, "Hostel (2 noci)", 12000, "OTHER", ratko.id, amsterdamMembers, new Date("2025-07-20"))
  await createExpense(amsterdam.id, "Vecera - prvi dan", 5500, "FOOD", lazar.id, amsterdamMembers, new Date("2025-07-20"))
  await createExpense(amsterdam.id, "Iznajmljivanje bicikala", 3000, "TRANSPORT", ratko.id, amsterdamMembers, new Date("2025-07-21"))
  await createExpense(amsterdam.id, "Kanal tura", 4000, "ENTERTAINMENT", lazar.id, amsterdamMembers, new Date("2025-07-21"))
  await createExpense(amsterdam.id, "Rucak u centru", 4200, "FOOD", ratko.id, amsterdamMembers, new Date("2025-07-21"))
  await createExpense(amsterdam.id, "Muzej Van Gog", 3500, "ENTERTAINMENT", lazar.id, amsterdamMembers, new Date("2025-07-22"))
  await createExpense(amsterdam.id, "Autobus do aerodroma", 1600, "TRANSPORT", ratko.id, amsterdamMembers, new Date("2025-07-22"))
  console.log("  Dodato 7 troskova za Amsterdam")

  console.log("\nSeed zavrsen uspesno!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
