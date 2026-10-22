import FormLogin from "@/components/auth/FormLogin";
import { Montserrat } from "next/font/google";
import Link from "next/link";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function LoginPage() {
  return (
    <main
      className="
        flex min-h-dvh w-full flex-col
        bg-[radial-gradient(ellipse_at_35%_75%,#FFB0A5_0%,transparent_60%),linear-gradient(to_bottom,#FF504A_0%,#ED454A_45%,#FF9D96_100%)]
      "
    >
      {/* HEADER */}
      <header className="flex flex-col items-center justify-center px-4 py-10 shrink-0">
        <h1
          className={`
            ${montserrat.className}
            text-center text-4xl font-extrabold
            uppercase text-white sm:text-5xl
          `}
        >
          Bienvenido
        </h1>
      </header>

      {/* CONTENT */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10">
        <FormLogin />
      </div>

      {/* FOOTER */}
      <footer className="shrink-0 bg-white px-6 py-9">
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <h2 className="text-3xl font-semibold text-slate-900 sm:col-span-2">
            Gama Consumibles Especiales
          </h2>

          <article className="flex flex-col items-start gap-2">
            <strong className="text-slate-800">Sobre nosotros</strong>

            <Link href="/" className="hover:text-red-500">
              Nuestra empresa
            </Link>

            <Link href="/" className="hover:text-red-500">
              Bolsa de trabajo
            </Link>
          </article>

          <article className="flex flex-col items-start gap-2">
            <strong className="text-slate-800">Servicios</strong>

            <Link href="/" className="hover:text-red-500">
              Alojamiento
            </Link>

            <Link href="/" className="hover:text-red-500">
              Soporte
            </Link>

            <Link href="/" className="hover:text-red-500">
              Clientes
            </Link>
          </article>
        </section>
      </footer>
    </main>
  );
}
