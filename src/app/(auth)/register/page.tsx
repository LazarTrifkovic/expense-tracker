"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { registerSchema, type RegisterInput } from "@/lib/validators"
import { Wallet, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: "Greška",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Uspešno",
        description: "Nalog je kreiran. Možete se prijaviti.",
      })
      router.push("/login")
    } catch {
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom registracije",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      {/* Left side - form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ExpenseTracker
            </span>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white/50 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Kreirajte nalog</h2>
              <p className="text-slate-500 mt-2">Registrujte se za besplatno korišćenje</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700">Vaše ime</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="Ime i prezime"
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email adresa</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vas@email.com"
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Lozinka</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Najmanje 6 karaktera"
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Kreiranje naloga...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Registruj se
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500">
                Već imate nalog?{" "}
                <Link href="/login" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                  Prijavite se
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            <Link href="/" className="hover:text-slate-600 transition-colors">
              ← Nazad na početnu
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">ExpenseTracker</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Započnite besplatno</h1>
          <p className="text-lg text-purple-100 leading-relaxed max-w-md">
            Pridružite se hiljadama korisnika koji već uživaju u jednostavnom praćenju troškova.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-purple-100">
              <CheckCircle2 className="w-6 h-6 text-green-300" />
              <span>Besplatno zauvek za male grupe</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100">
              <CheckCircle2 className="w-6 h-6 text-green-300" />
              <span>Bez kreditne kartice</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100">
              <CheckCircle2 className="w-6 h-6 text-green-300" />
              <span>Podešavanje za manje od 2 minuta</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100">
              <CheckCircle2 className="w-6 h-6 text-green-300" />
              <span>Pozovite neograničen broj prijatelja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
