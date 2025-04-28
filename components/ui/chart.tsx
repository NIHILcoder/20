"use client"

import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
} from "chart.js"
import { useMemo } from "react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
)

interface ChartProps {
  data: any
  options: any
}

export function BarChart({ data, options }: ChartProps) {
  const memoizedData = useMemo(() => data, [data])
  const memoizedOptions = useMemo(() => options, [options])

  return <Bar data={memoizedData} options={memoizedOptions} />
}

export function LineChart({ data, options }: ChartProps) {
  const memoizedData = useMemo(() => data, [data])
  const memoizedOptions = useMemo(() => options, [options])
  return <Line data={memoizedData} options={memoizedOptions} />
}

export function PieChart({ data, options }: ChartProps) {
  const memoizedData = useMemo(() => data, [data])
  const memoizedOptions = useMemo(() => options, [options])
  return <Pie data={memoizedData} options={memoizedOptions} />
}

