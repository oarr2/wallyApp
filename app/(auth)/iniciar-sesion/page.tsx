import { LogIn } from "lucide-react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<{ mensaje?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <Card className="border-lime-300/20 bg-slate-900 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <CardHeader className="gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
              <LogIn className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription className="text-slate-300">
              Ingresa con tu cuenta para reservar canchas o administrar el venue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {params?.mensaje ? (
              <Alert className="mb-4 border-lime-300/30 bg-lime-300/10 text-lime-100">
                <AlertDescription>{params.mensaje}</AlertDescription>
              </Alert>
            ) : null}
            <form action={signInAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="border-slate-700 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="border-slate-700 bg-slate-950 text-white"
                />
              </div>
              <Button className="w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
                Entrar
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-300">
              ¿Aún no tienes cuenta?{" "}
              <Link className="font-semibold text-lime-300" href="/registrarse">
                Regístrate como jugador
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
