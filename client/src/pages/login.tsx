import { useState, type FormEvent } from "react";
import { ArrowRight, BrainCircuit, CalendarDays, Check, Crown, Sparkles, Trophy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertUser, LoginUser } from "@shared/schema";
import francisImage from "@assets/generated_images/Saint_Francis_portrait_d9d9f58d.png";
import maryImage from "@assets/generated_images/Virgin_Mary_portrait_7a48e575.png";
import josephImage from "@assets/generated_images/Saint_Joseph_portrait_e8555a2a.png";

const modes = [
  { icon: BrainCircuit, title: "Adaptive AI", text: "An opponent that remembers how you play." },
  { icon: Trophy, title: "Climb the ratings", text: "Every match is a small test of nerve." },
  { icon: Users, title: "Play together", text: "Multiplayer tables, tournaments, bragging rights." },
  { icon: CalendarDays, title: "Daily flip", text: "A fresh challenge, every single day." },
];

const deckCards = [
  { image: francisImage, label: "Portraits", rotate: "-10deg", tone: "#e5b84c" },
  { image: maryImage, label: "Legends", rotate: "3deg", tone: "#d85b3f" },
  { image: josephImage, label: "Icons", rotate: "11deg", tone: "#397c70" },
];

export default function Login() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState<LoginUser>({ username: "", password: "" });
  const [registerData, setRegisterData] = useState<InsertUser>({ username: "", email: "", password: "" });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(loginData) });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back!", description: "Your table is ready." });
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message || "Check your credentials and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(registerData) });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome to Kompana!", description: "Your first deck is waiting." });
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message || "Could not create account. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="cover-shell min-h-[100dvh] overflow-hidden">
      <div className="mx-auto grid min-h-[100dvh] max-w-[1440px] grid-cols-1 lg:grid-cols-[1.08fr_.92fr]">
        <section className="relative flex flex-col px-6 py-7 sm:px-10 lg:px-16 lg:py-10">
          <header className="cover-in flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d85b3f] text-[#fff8ec] shadow-[0_4px_0_#a8412e]">
                <Crown size={21} strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-[#d85b3f]">Kompana</p>
                <p className="text-xs font-semibold text-[#53606a]">Memory, with a little more nerve.</p>
              </div>
            </div>
            <span className="hidden rounded-full border border-[#cfc5b3] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-[#68716e] sm:block">
              Season 04 · Open
            </span>
          </header>

          <div className="relative z-[1] mt-14 max-w-[670px] sm:mt-20 lg:mt-24">
            <div className="cover-in cover-delay-1 mb-6 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[.18em] text-[#397c70]">
              <Sparkles size={15} /> The table is set
            </div>
            <h1 className="cover-in cover-delay-1 max-w-2xl text-[clamp(3.5rem,8vw,7.4rem)] font-bold leading-[.88] tracking-[-.075em] text-[#26343d]">
              Flip smart.<br /><span className="text-[#d85b3f]">Remember everything.</span>
            </h1>
            <p className="cover-in cover-delay-2 mt-8 max-w-lg text-base leading-7 text-[#53606a] sm:text-lg">
              Kompana is the competitive memory game for curious minds. Read the board, outwit adaptive AI, and build a collection worth showing off.
            </p>

            <div className="cover-in cover-delay-3 mt-10 grid max-w-xl grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
              {modes.map(({ icon: Icon, title, text }) => (
                <div key={title} className="group">
                  <Icon size={19} className="mb-3 text-[#d85b3f] transition-transform group-hover:-translate-y-1" />
                  <p className="text-sm font-bold text-[#26343d]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#68716e]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-16 flex min-h-[175px] flex-1 items-end justify-center pb-3 sm:mt-12 lg:justify-start">
            <div className="pointer-events-none absolute bottom-6 left-[12%] h-32 w-32 rounded-full bg-[#e5b84c]/25 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-[12%] h-24 w-40 rounded-full bg-[#397c70]/15 blur-3xl" />
            <div className="relative flex h-40 w-[300px] items-end justify-center sm:w-[360px]">
              {deckCards.map((card, index) => (
                <div
                  key={card.label}
                  className="deck-card absolute bottom-0 h-40 w-28 overflow-hidden rounded-[14px] border-[5px] border-[#fff8ec] bg-[#26343d]"
                  style={{ transform: `translateX(${(index - 1) * 75}px) rotate(${card.rotate})`, zIndex: index }}
                >
                  <img src={card.image} alt="" className="h-full w-full object-cover opacity-80" />
                  <div className="absolute inset-x-0 bottom-0 bg-[#26343d]/85 px-2 py-2">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#fff8ec]">{card.label}</p>
                  </div>
                  <div className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ backgroundColor: card.tone }} />
                </div>
              ))}
              <p className="absolute -bottom-8 left-1/2 w-56 -translate-x-1/2 text-center font-mono text-[9px] uppercase tracking-[.24em] text-[#8a877d]">One game · a hundred ways to play</p>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-10 lg:bg-[#26343d] lg:px-14">
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-full opacity-30 lg:block" style={{ backgroundImage: "linear-gradient(135deg, transparent 0 49.5%, #d85b3f 50% 50.5%, transparent 51%), linear-gradient(45deg, transparent 0 49.5%, #397c70 50% 50.5%, transparent 51%)", backgroundSize: "82px 82px" }} />
          <div className="relative z-[1] w-full max-w-[430px]">
            <div className="mb-8 flex items-center justify-between lg:text-[#fff8ec]">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[.22em] text-[#d85b3f]">Your next move</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Take your seat.</h2>
              </div>
              <div className="hidden h-12 w-12 rotate-6 items-center justify-center rounded-xl bg-[#e5b84c] text-[#26343d] shadow-[0_4px_0_#b88a27] sm:flex">
                <Check size={25} strokeWidth={3} />
              </div>
            </div>

            <div className="rounded-[24px] border border-[#e6dccb] bg-[#fff8ec] p-2 shadow-[0_24px_70px_rgba(31,43,49,.22)]">
              <div className="rounded-[18px] border border-[#e6dccb] bg-[#f7efdf] p-5 sm:p-7">
                <div className="mb-6 flex rounded-xl bg-[#e9dfce] p-1">
                  {(["login", "register"] as const).map((item) => (
                    <button key={item} type="button" onClick={() => setMode(item)} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${mode === item ? "bg-[#26343d] text-[#fff8ec] shadow-sm" : "text-[#68716e] hover:text-[#26343d]"}`}>
                      {item === "login" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>
                {mode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Field id="login-username" label="Username" autoComplete="username" value={loginData.username} placeholder="e.g. cardshark" onChange={(value) => setLoginData({ ...loginData, username: value })} />
                    <Field id="login-password" label="Password" type="password" autoComplete="current-password" value={loginData.password} placeholder="Your secret sequence" onChange={(value) => setLoginData({ ...loginData, password: value })} />
                    <SubmitButton loading={isLoading} label="Enter the table" loadingLabel="Shuffling your deck" />
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <Field id="register-username" label="Username" autoComplete="username" value={registerData.username} placeholder="Choose your table name" onChange={(value) => setRegisterData({ ...registerData, username: value })} />
                    <Field id="register-email" label="Email" type="email" autoComplete="email" value={registerData.email} placeholder="Where should we send updates?" onChange={(value) => setRegisterData({ ...registerData, email: value })} />
                    <Field id="register-password" label="Password" type="password" autoComplete="new-password" value={registerData.password} placeholder="At least 8 characters" onChange={(value) => setRegisterData({ ...registerData, password: value })} />
                    <SubmitButton loading={isLoading} label="Deal me in" loadingLabel="Building your collection" />
                  </form>
                )}
                <p className="mt-5 text-center text-[11px] leading-5 text-[#8a877d]">By continuing, you agree to play fair and keep the table interesting.</p>
              </div>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-[.12em] text-[#8a877d] lg:text-[#c5c4bd]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#397c70]" /> Free to start · no credit card required
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ id, label, type = "text", autoComplete, value, placeholder, onChange }: { id: string; label: string; type?: string; autoComplete: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#53606a]">{label}</label>
      <input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} required placeholder={placeholder} className="h-12 w-full rounded-xl border border-[#d6cbb9] bg-[#fffaf1] px-4 text-sm text-[#26343d] outline-none transition-colors placeholder:text-[#aaa396] focus:border-[#d85b3f] focus:ring-2 focus:ring-[#d85b3f]/15" />
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading} className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d85b3f] text-sm font-bold text-[#fff8ec] shadow-[0_4px_0_#a8412e] transition-all hover:-translate-y-0.5 hover:bg-[#c74f36] hover:shadow-[0_6px_0_#a8412e] disabled:cursor-wait disabled:opacity-70">
      {loading ? loadingLabel : label}
      {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />}
    </button>
  );
}