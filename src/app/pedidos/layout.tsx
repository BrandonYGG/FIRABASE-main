
import DashboardLayout from "../dashboard/layout";

export default function PedidosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
        {children}
    </DashboardLayout>
  );
}
