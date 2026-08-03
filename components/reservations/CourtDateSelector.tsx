import { CalendarDays, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CourtDateSelectorCourt = {
  id: string;
  name: string;
  sportId: string;
  sportName: string;
};

export function CourtDateSelector({
  courts,
  selectedCourtId,
  selectedDate
}: {
  courts: CourtDateSelectorCourt[];
  selectedCourtId?: string;
  selectedDate: string;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-lime-300/20 bg-slate-900 p-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-200" htmlFor="courtId">
          <MapPin className="h-4 w-4 text-lime-300" />
          Cancha
        </Label>
        <select
          id="courtId"
          name="courtId"
          defaultValue={selectedCourtId ?? courts[0]?.id}
          className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
        >
          {courts.map((court) => (
            <option key={court.id} value={court.id}>
              {court.name} · {court.sportName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-slate-200" htmlFor="localDate">
          <CalendarDays className="h-4 w-4 text-lime-300" />
          Fecha
        </Label>
        <Input
          id="localDate"
          name="localDate"
          type="date"
          defaultValue={selectedDate}
          className="border-slate-700 bg-slate-950 text-white"
        />
      </div>
      <input
        type="hidden"
        name="sportId"
        value={
          courts.find((court) => court.id === selectedCourtId)?.sportId ??
          courts[0]?.sportId ??
          ""
        }
      />
    </div>
  );
}
