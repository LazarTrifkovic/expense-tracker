"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { loginSchema, type LoginInput } from "@/lib/validators"
import { Wallet, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        let errorMessage = "Došlo je do greške prilikom prijave"

        if (result.error === "CredentialsSignin") {
          errorMessage = "Pogrešan email ili lozinka. Proverite da li nalog postoji."
        }

        toast({
          title: "Greška pri prijavi",
          description: errorMessage,
          variant: "destructive",
        })
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom prijave",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      {/* Left side - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">ExpenseTracker</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Dobrodošli nazad!</h1>
          <p className="text-lg text-purple-100 leading-relaxed max-w-md">
            Prijavite se da nastavite sa praćenjem troškova i upravljanjem grupama.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-purple-100">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <span>Pratite sve troškove na jednom mestu</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <span>Automatska podela i izračun dugovanja</span>
            </div>
            <div className="flex items-center gap-3 text-purple-100">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-semibold">✓</span>
              </div>
              <span>Jednostavno poravnanje sa prijateljima</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
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
              <h2 className="text-2xl font-bold text-slate-900">Prijava</h2>
              <p className="text-slate-500 mt-2">Unesite vaše podatke za pristup</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    placeholder="••••••••"
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
                    Prijavljivanje...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Prijavi se
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500">
                Nemate nalog?{" "}
                <Link href="/register" className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                  Registrujte se
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
    </div>
  )
}
