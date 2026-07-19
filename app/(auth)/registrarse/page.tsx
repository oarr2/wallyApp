import { UserPlus } from "lucide-react";
import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
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

export default async function RegisterPage({
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
              <UserPlus className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Crear cuenta</CardTitle>
            <CardDescription className="text-slate-300">
              Regístrate como jugador para usar las reservas del MVP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {params?.mensaje ? (
              <Alert className="mb-4 border-lime-300/30 bg-lime-300/10 text-lime-100">
                <AlertDescription>{params.mensaje}</AlertDescription>
              </Alert>
            ) : null}
            <form action={signUpAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  autoComplete="name"
                  required
                  className="border-slate-700 bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="border-slate-700 bg-slate-950 text-white"
                />
              </div>
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="border-slate-700 bg-slate-950 text-white"
                />
              </div>
              <Button className="w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
                Crear cuenta
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-300">
              ¿Ya tienes cuenta?{" "}
              <Link className="font-semibold text-lime-300" href="/iniciar-sesion">
                Inicia sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
