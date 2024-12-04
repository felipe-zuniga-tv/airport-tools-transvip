'use client'
import { Button } from "@/components/ui/button"
import { Routes } from "@/utils/routes";
import Link from "next/link";

export default function Error() {

  return (
    <main className="bg-desert min-h-screen flex flex-col items-center justify-center">
      <div className="p-24 px-32 rounded-xl text-lg bg-white/90 text-center gap-4 flex flex-col">
        <span className="text-xl font-semibold">¡Hola!</span>
        <h2>Algo no salió bien...</h2>
        <Button variant={'default'}
          className="bg-transvip hover:bg-transvip-dark py-4 text-lg h-12 mt-4">
          <Link href={Routes.AIRPORT.ZI_SCL}>
            Intentar nuevamente
          </Link>
        </Button>
      </div>
    </main>
  );
}