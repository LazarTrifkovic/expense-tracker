"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getInitials } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Podešavanja</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>Vaši podaci naloga</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-2xl">
                {getInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-medium">{session?.user?.name || "Bez imena"}</p>
              <p className="text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status email-a</span>
              <span className={session?.user?.emailVerified ? "text-green-600" : "text-yellow-600"}>
                {session?.user?.emailVerified ? "Verifikovan" : "Nije verifikovan"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uloga</span>
              <span>{session?.user?.role === "SYSTEM_ADMIN" ? "Administrator" : "Korisnik"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Obaveštenja</CardTitle>
          <CardDescription>Podesite kako želite da primate obaveštenja</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Email obaveštenja će biti poslata kada:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
            <li>Neko vas doda u grupu</li>
            <li>Novi trošak je dodat u vašu grupu</li>
            <li>Neko evidentira uplatu prema vama</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
