import { BarChart, CarFront, Gauge, PlaneTakeoff } from "lucide-react"

// Transvip Ops Teams
export const opsTeams = [
    {
      name: "Reclutamiento",
      logo: BarChart,
      plan: "Transvip",
    },
    {
      name: "Tráfico",
      logo: CarFront,
      plan: "Transvip",
    },
    {
      name: "Aeropuerto",
      logo: PlaneTakeoff,
      plan: "Transvip",
    },
    {
      name: "Calidad / Control Flota",
      logo: Gauge,
      plan: "Transvip",
    },
  ]

// Transvip Data configuration
export const branches = [
    { branch_id: 1, name: 'Santiago', code: 'SCL' },
    { branch_id: 798, name: 'Valparaiso', code: 'VAP' },
    { branch_id: 179, name: 'Calama', code: 'CJC' },
    { branch_id: 34, name: 'Antofagasta', code: 'ANF' },
]

export const paymentMethods = {
    CARD: 'Tarjeta de Credito o Debito',
    CREDIT_CARD: 'Tarjeta de Crédito',
    CREDIT_CARD_MP: 'Tarjeta de Crédito Mercadopago',
    FACTURA: 'Factura Credito',
    CASH: 'Efectivo Pesos',
}