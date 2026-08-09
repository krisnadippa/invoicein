import DashboardWrapper from "./DashboardWrapper";

export const metadata = {
  title: "Dashboard - Invoice.In",
  description: "Manage your invoices and business metrics.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
}
