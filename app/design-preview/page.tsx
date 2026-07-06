import type React from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  CreditCard,
  Dumbbell,
  Filter,
  MapPin,
  ShieldCheck,
  Trophy,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const courts = [
  {
    name: "Cancha Norte",
    detail: "Piso deportivo · Zona Miraflores",
    next: "18:00",
    price: "Bs 120",
    status: "Disponible"
  },
  {
    name: "Cancha Sur",
    detail: "Piso sintético · Iluminación completa",
    next: "19:30",
    price: "Bs 110",
    status: "Alta demanda"
  }
];

const reservations = [
  {
    code: "R-1048",
    court: "Cancha Norte",
    player: "María López",
    hour: "18:00",
    payment: "Pagado"
  },
  {
    code: "R-1049",
    court: "Cancha Sur",
    player: "Diego Rojas",
    hour: "19:30",
    payment: "Pendiente"
  },
  {
    code: "R-1050",
    court: "Cancha Norte",
    player: "Ana Vargas",
    hour: "21:00",
    payment: "Fallido"
  }
];

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <Hero />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <HomeAvailability />
          <CourtDetail />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <ReservationSummary />
          <PaymentStatus />
          <TournamentsPagePreview />
        </section>

        <AdminDashboard />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="rounded-lg border border-lime-300/20 bg-slate-900 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <Badge className="border-lime-300 bg-lime-300 text-slate-950">
            Dirección seleccionada
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white sm:text-5xl">
              App deportiva moderna
            </h1>
            <p className="text-sm leading-6 text-slate-300 sm:text-base">
              Fondo negro/azul oscuro, tarjetas fuertes, acentos verde neón,
              iconos deportivos y acciones claras para reservar canchas rápido
              desde móvil.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric label="Canchas" value="2" />
          <Metric label="Hoy" value="18" />
          <Metric label="Pagadas" value="12" />
        </div>
      </div>
    </section>
  );
}

function HomeAvailability() {
  return (
    <PreviewPanel title="Inicio / disponibilidad" label="Pantalla principal">
      <div className="grid gap-4">
        <TorneosHomeCard />

        <div className="rounded-lg border border-lime-300/20 bg-slate-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-300">Busca tu próximo partido</p>
              <h2 className="text-2xl font-semibold text-white">Reserva cancha</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
              <CalendarDays className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Input readOnly value="Martes 9 de julio" className="bg-white text-slate-950" />
            <Input readOnly value="Desde 18:00" className="bg-white text-slate-950" />
            <Button className="bg-lime-300 text-slate-950 hover:bg-lime-200">
              Ver disponibilidad
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {courts.map((court) => (
            <article
              className="rounded-lg border border-lime-300/20 bg-slate-800 p-4"
              key={court.name}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">{court.name}</h3>
                  <p className="text-xs leading-5 text-slate-300">{court.detail}</p>
                </div>
                <StatusBadge status={court.status} />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-400">Próximo horario</p>
                  <p className="text-xl font-semibold text-lime-300">{court.next}</p>
                </div>
                <p className="text-sm font-semibold text-white">{court.price}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PreviewPanel>
  );
}

function TorneosHomeCard() {
  return (
    <article className="rounded-lg border border-lime-300/40 bg-slate-950 p-4 shadow-[0_0_36px_rgba(190,242,100,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Badge className="border-lime-300 bg-lime-300 text-slate-950">
            Próximamente
          </Badge>
          <div>
            <h2 className="text-3xl font-semibold text-white">Torneos</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Muy pronto podrás inscribir equipos, ver fixtures, posiciones y
              resultados.
            </p>
          </div>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
          <Trophy className="h-7 w-7" />
        </div>
      </div>
      <Button className="mt-4 w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
        Ver próximamente
        <ArrowRight className="h-4 w-4" />
      </Button>
    </article>
  );
}

function CourtDetail() {
  return (
    <PreviewPanel title="Detalle de cancha" label="Cancha">
      <div className="space-y-4">
        <div className="flex h-44 items-end rounded-lg border border-lime-300/20 bg-[linear-gradient(135deg,#052e16,#365314,#bef264)] p-4 text-white">
          <div>
            <p className="text-xs text-lime-100">Cancha destacada</p>
            <h2 className="text-3xl font-semibold">Cancha Norte</h2>
          </div>
        </div>
        <div className="grid gap-2 text-sm text-slate-200">
          <IconLine icon={MapPin} text="Zona Miraflores" />
          <IconLine icon={Clock3} text="Abierta hasta 22:30" />
          <IconLine icon={Users} text="Ideal para 4 jugadores" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["18:00", "19:30", "21:00"].map((hour) => (
            <button
              className="min-h-11 rounded-md border border-lime-300/20 bg-lime-300/10 text-sm font-semibold text-lime-200"
              key={hour}
            >
              {hour}
            </button>
          ))}
        </div>
        <Button className="w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
          Elegir horario
        </Button>
      </div>
    </PreviewPanel>
  );
}

function ReservationSummary() {
  return (
    <PreviewPanel title="Resumen de reserva" label="Reserva">
      <div className="space-y-4 rounded-lg border border-lime-300/20 bg-slate-800 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-300">Reserva R-1048</p>
            <h3 className="text-xl font-semibold text-white">Cancha Norte</h3>
          </div>
          <Badge variant="warning">Pendiente</Badge>
        </div>
        <div className="grid gap-3 text-sm">
          <SummaryRow label="Fecha" value="Martes 9 de julio" />
          <SummaryRow label="Horario" value="18:00 a 19:30" />
          <SummaryRow label="Jugador" value="María López" />
          <SummaryRow label="Total" value="Bs 120" strong />
        </div>
        <Button className="w-full bg-lime-300 text-slate-950 hover:bg-lime-200">
          Confirmar vista previa
        </Button>
      </div>
    </PreviewPanel>
  );
}

function PaymentStatus() {
  return (
    <PreviewPanel title="Estado de pago" label="Pago">
      <div className="space-y-3">
        {[
          ["Pagado", "Recibido el 8 de julio", "success"],
          ["Pendiente", "Debe completarse antes del partido", "warning"],
          ["Reembolsado", "Devuelto por administración", "info"]
        ].map(([status, detail, variant]) => (
          <div
            className="rounded-lg border border-lime-300/20 bg-slate-800 p-3"
            key={status}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-lime-300" />
                <div>
                  <p className="font-semibold text-white">{status}</p>
                  <p className="text-xs text-slate-300">{detail}</p>
                </div>
              </div>
              <Badge variant={variant as "success" | "warning" | "info"}>
                {status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </PreviewPanel>
  );
}

function TournamentsPagePreview() {
  return (
    <PreviewPanel title="Torneos" label="Próximamente">
      <div className="rounded-lg border border-lime-300/20 bg-slate-800 p-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-lime-300/30 bg-lime-300/10 text-lime-300">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-white">Próximamente</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Estamos preparando inscripción de equipos, fixture, tabla de posiciones
          y resultados para una próxima versión.
        </p>
        <div className="mt-4 grid gap-2 text-left text-sm text-slate-200">
          <IconLine icon={ShieldCheck} text="Sin acciones de torneo" />
          <IconLine icon={Dumbbell} text="Solo vista informativa" />
        </div>
      </div>
    </PreviewPanel>
  );
}

function AdminDashboard() {
  return (
    <PreviewPanel title="Panel administrativo" label="Administración">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Reservas" value="18" />
          <Metric label="Pagadas" value="12" />
          <Metric label="Alertas" value="3" />
        </div>
        <div className="hidden overflow-hidden rounded-lg border border-lime-300/20 bg-white text-slate-950 sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reserva</TableHead>
                <TableHead>Cancha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.code}>
                  <TableCell>{reservation.code}</TableCell>
                  <TableCell>{reservation.court}</TableCell>
                  <TableCell>{reservation.hour}</TableCell>
                  <TableCell>
                    <PaymentBadge payment={reservation.payment} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="grid gap-2 sm:hidden">
          {reservations.map((reservation) => (
            <div
              className="rounded-lg border border-lime-300/20 bg-slate-800 p-3"
              key={reservation.code}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{reservation.code}</p>
                <PaymentBadge payment={reservation.payment} />
              </div>
              <p className="mt-1 text-xs text-slate-300">
                {reservation.court} · {reservation.hour} · {reservation.player}
              </p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full bg-white text-slate-950">
          <Filter className="h-4 w-4" />
          Filtrar reservas
        </Button>
      </div>
    </PreviewPanel>
  );
}

function PreviewPanel({
  title,
  label,
  children
}: {
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-lime-300/30 bg-slate-900 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
      <CardHeader className="space-y-2">
        <Badge className="w-fit border-lime-300/20 bg-lime-300/10 text-lime-200">
          {label}
        </Badge>
        <CardTitle className="text-lg text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === "Disponible" ? "success" : "warning"}>
      {status}
    </Badge>
  );
}

function PaymentBadge({ payment }: { payment: string }) {
  if (payment === "Pagado") {
    return <Badge variant="success">Pagado</Badge>;
  }

  if (payment === "Fallido") {
    return <Badge variant="danger">Fallido</Badge>;
  }

  return <Badge variant="warning">Pendiente</Badge>;
}

function IconLine({
  icon: Icon,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-lime-300" />
      <span>{text}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-300">{label}</span>
      <span className={strong ? "text-lg font-semibold text-lime-300" : "text-white"}>
        {value}
      </span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-lime-300/20 bg-slate-800 p-3">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-xl font-semibold text-lime-300">{value}</p>
    </div>
  );
}
