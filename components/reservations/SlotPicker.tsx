import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SlotPickerSlot = {
  startLocalTime: string;
  endLocalTime: string;
};

export function SlotPicker({
  slots,
  courtId,
  sportId,
  localDate,
  action
}: {
  slots: SlotPickerSlot[];
  courtId: string;
  sportId: string;
  localDate: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-amber-300/30 bg-amber-950/30 p-4 text-sm text-amber-100">
        No hay horarios disponibles para esta fecha. Elige otra cancha o día.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => (
        <form
          key={`${slot.startLocalTime}-${slot.endLocalTime}`}
          action={action}
          className="rounded-lg border border-lime-300/20 bg-slate-900 p-3 text-white"
        >
          <input type="hidden" name="courtId" value={courtId} />
          <input type="hidden" name="sportId" value={sportId} />
          <input type="hidden" name="localDate" value={localDate} />
          <input type="hidden" name="startLocalTime" value={slot.startLocalTime} />
          <input type="hidden" name="endLocalTime" value={slot.endLocalTime} />
          <Button
            className="w-full justify-start bg-transparent p-0 text-left text-white hover:bg-transparent"
          >
            <Clock className="h-4 w-4 text-lime-300" />
            {slot.startLocalTime.slice(0, 5)} - {slot.endLocalTime.slice(0, 5)}
          </Button>
        </form>
      ))}
    </div>
  );
}
