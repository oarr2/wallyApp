import { AdminPaymentHistory, AdminShell } from "@/components/admin";
import { requireAdminProfile } from "@/lib/auth/authorization";
import { requireAuthContext } from "@/lib/auth/session";
import { listAdminPaymentHistory } from "@/lib/data/payments";

export default async function AdminPaymentsPage() {
  const context = await requireAuthContext();
  requireAdminProfile(context.profile);
  const payments = await listAdminPaymentHistory({ actor: context.profile });

  return (
    <AdminShell
      role={context.profile.role}
      currentPath="/admin/pagos"
      title="Pagos"
      description="Revisa movimientos de pago, estado actual y motivos registrados dentro de tu alcance."
    >
      <AdminPaymentHistory payments={payments} />
    </AdminShell>
  );
}
