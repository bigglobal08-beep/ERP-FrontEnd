import Button from "@/components/form/Button";
import FieldText from "@/components/form/FieldText";
import FormGrid from "@/components/form/FormGrid";
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
          <FormGrid>
            <FieldText
              name="email"
              type="email"
              label="Correo"
              placeholder="Coloca tu correo para iniciar sesión..."
            />
            <FieldText
              type="password"
              name="password"
              label="Contraseña"
              placeholder="Escribe tu contraseña..."
            />
            <Button>Iniciar sesión</Button>
          </FormGrid>
        </form>
      </section>
      <footer className="h-30 bg-white">footer</footer>
    </main>
  );
}
