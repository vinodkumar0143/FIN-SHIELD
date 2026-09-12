export interface ForecastPoint {
  date: string
  inflow: number
  outflow: number
  outflowWithHolds: number
  netCash: number
  isProjected: boolean
}

export const MOCK_FORECAST_DATA: ForecastPoint[] = [
  // Historical
  { date: 'Aug 15', inflow: 4200000, outflow: 3600000, outflowWithHolds: 3600000, netCash: 600000, isProjected: false },
  { date: 'Aug 22', inflow: 3800000, outflow: 3400000, outflowWithHolds: 3400000, netCash: 400000, isProjected: false },
  { date: 'Aug 29', inflow: 5100000, outflow: 4800000, outflowWithHolds: 4800000, netCash: 300000, isProjected: false },
  { date: 'Sep 05', inflow: 4600000, outflow: 4200000, outflowWithHolds: 4200000, netCash: 400000, isProjected: false },
  // Projected
  { date: 'Sep 12 (Est)', inflow: 4900000, outflow: 4700000, outflowWithHolds: 3800000, netCash: 200000, isProjected: true },
  { date: 'Sep 19 (Est)', inflow: 5200000, outflow: 4900000, outflowWithHolds: 4200000, netCash: 300000, isProjected: true },
  { date: 'Sep 26 (Est)', inflow: 4700000, outflow: 4600000, outflowWithHolds: 3900000, netCash: 100000, isProjected: true },
  { date: 'Oct 03 (Est)', inflow: 5500000, outflow: 4800000, outflowWithHolds: 4100000, netCash: 700000, isProjected: true },
  { date: 'Oct 10 (Est)', inflow: 5800000, outflow: 5100000, outflowWithHolds: 4400000, netCash: 700000, isProjected: true },
  { date: 'Oct 17 (Est)', inflow: 5400000, outflow: 4700000, outflowWithHolds: 4000000, netCash: 700000, isProjected: true },
]

export const FORECAST_KEY_DRIVERS = [
  {
    title: 'EnterPro Payment Holds Impact',
    description: 'Active escrow holds on INV-28491 (₹4.82L) and INV-27890 (₹6.84L) preserve ₹11.66L in liquid working capital during September.',
    impact: '+₹11.66L Preserved',
    type: 'positive'
  },
  {
    title: 'Technology Infrastructure Burst Surcharges',
    description: 'Unbudgeted on-demand GPU cluster scaling (NexGen Cloud) projected to increase Q3 outflow by ₹2.95L.',
    impact: '-₹2.95L Variance',
    type: 'negative'
  },
  {
    title: 'Quarter-End Receivable Realization',
    description: 'Projected customer receivables settlement of ₹1.54Cr due between Sep 20 and Oct 05.',
    impact: '+₹1.54Cr Inflow',
    type: 'positive'
  }
]
