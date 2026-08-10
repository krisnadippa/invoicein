"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DraftsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/expenses");
  }, [router]);

  return (
    <div className="dashboard-content-inner">
      <p>Mengalihkan ke modul Pengeluaran...</p>
    </div>
  );
}
