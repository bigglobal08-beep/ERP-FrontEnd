import LoginForm from "@/components/login/LoginForm";
import GradientBackground from "@/components/ui/GradientBackground";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  weight: "700",
});

export default function PageLogin() {
  return (
    <GradientBackground className="flex-1 flex flex-col gap-4">
      <h1
        style={montserrat.style}
        className="text-5xl font-extrabold uppercase text-white text-center px-3 my-8"
      >
        Bienvenido
      </h1>
      <div className="mx-auto w-full max-w-sm bg-white p-4 rounded-lg mt-9 shadow-md">
        <div className="p-4 border border-slate-200 rounded-md">
          <LoginForm />
        </div>
      </div>
    </GradientBackground>
  );
}
