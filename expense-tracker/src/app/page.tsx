import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, Users, PieChart, ArrowRight, Sparkles, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ExpenseTracker
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Prijava
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25">
              Započni besplatno
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-lg shadow-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">Besplatno zauvek za male grupe</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-slate-900">Delite troškove</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              bez komplikacija
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Jednostavno pratite i delite troškove sa cimerima, prijateljima ili na putovanjima.
            <span className="text-purple-600 font-medium"> Zaboravite Excel tabele.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5">
                Kreiraj nalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-white/50 backdrop-blur-sm">
                Već imam nalog
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 pt-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">Sigurno i privatno</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">Brzo podešavanje</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
          <div className="group p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Grupe</h3>
            <p className="text-slate-600 leading-relaxed">
              Kreirajte grupe za stan, putovanja, projekte ili bilo šta drugo. Pozovite članove jednim klikom.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Pametna podela</h3>
            <p className="text-slate-600 leading-relaxed">
              Podelite jednako, po procentima ili udelima. Aplikacija automatski izračunava ko kome duguje.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25 group-hover:scale-110 transition-transform duration-300">
              <PieChart className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Statistike</h3>
            <p className="text-slate-600 leading-relaxed">
              Pratite potrošnju po kategorijama. Vizualizujte gde odlazi vaš novac svakog meseca.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl shadow-purple-500/25">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Spremni da pojednostavite podelu troškova?
            </h2>
            <p className="text-purple-100 mb-6 max-w-lg mx-auto">
              Pridružite se hiljadama korisnika koji su već zaboravili na komplikovane proračune.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg px-8 py-6 text-lg font-semibold">
                Započni besplatno
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-slate-700">ExpenseTracker</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 ExpenseTracker. Sva prava zadržana.
          </p>
        </div>
      </footer>
    </div>
  )
}
