import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: "Expense Tracker <noreply@yourdomain.com>",
    to: email,
    subject: "Verifikujte vašu email adresu",
    html: `
      <h1>Dobrodošli u Expense Tracker!</h1>
      <p>Kliknite na link ispod da verifikujete vašu email adresu:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>Link ističe za 24 sata.</p>
    `,
  })
}

export async function sendGroupInviteEmail(email: string, groupName: string, inviterName: string, token: string) {
  const inviteUrl = `${process.env.NEXTAUTH_URL}/invitations/${token}`

  await resend.emails.send({
    from: "Expense Tracker <noreply@yourdomain.com>",
    to: email,
    subject: `${inviterName} vas je pozvao u grupu "${groupName}"`,
    html: `
      <h1>Pozvani ste u grupu!</h1>
      <p>${inviterName} vas je pozvao da se pridružite grupi "${groupName}" u aplikaciji Expense Tracker.</p>
      <p>Kliknite na link ispod da prihvatite pozivnicu:</p>
      <a href="${inviteUrl}">${inviteUrl}</a>
      <p>Link ističe za 7 dana.</p>
    `,
  })
}

export async function sendNewExpenseEmail(email: string, expenseTitle: string, amount: number, groupName: string) {
  await resend.emails.send({
    from: "Expense Tracker <noreply@yourdomain.com>",
    to: email,
    subject: `Novi trošak u grupi "${groupName}"`,
    html: `
      <h1>Novi trošak dodat</h1>
      <p>Novi trošak "${expenseTitle}" u iznosu od ${amount} je dodat u grupu "${groupName}".</p>
      <p>Prijavite se u aplikaciju da vidite detalje.</p>
    `,
  })
}
