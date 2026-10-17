import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function LoginPage() {
  return (
    <main className="h-screen overflow-hidden flex flex-col bg-[radial-gradient(ellipse_at_35%_75%,#FFB0A5_0%,transparent_60%),linear-gradient(to_bottom,#FF504A_0%,#ED454A_45%,#FF9D96_100%)]">
      <header className="h-50 flex flex-col items-center justify-center">
        <h1 className={`${montserrat.className} uppercase text-white text-6xl`}>
          bienvenido
        </h1>
      </header>
      <section className="flex-1 flex flex-col p-6">
        <form className="w-full mx-auto bg-white rounded-lg p-4">
          <div className="grid gap-1">
            <label htmlFor="email" className="font-semibold text-sm">
              Correo
            </label>
            <input
              className="border border-slate-300 rounded-md p-1"
              type="email"
              name="email"
              id="email"
              autoComplete="off"
            />
          </div>
        </form>
      </section>
      <footer className="h-50 bg-white">footer</footer>
    </main>
  );
}
