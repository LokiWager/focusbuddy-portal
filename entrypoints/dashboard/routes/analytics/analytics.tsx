import { useState, useEffect } from "react";
import { useListAnalyticsDashBoard, useListAnalyticsWeeklyChart, AnalyticsListWeeklyChartResponse } from "@/common/api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Dashboard() {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [filteredSummary, setFilteredSummary] = useState<AnalyticsListWeeklyChartResponse[]>([]);

  const { daily, weekly, completed_sessions } = useListAnalyticsDashBoard();
  const { summary } = useListAnalyticsWeeklyChart(startDate ?? new Date() , endDate ?? new Date());

  useEffect(() => {
    if (summary) {
      setFilteredSummary(summary);
    }
  }, [summary]);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (start && end) {
      const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      if (diff > 30) {
        alert("Date range cannot exceed 30 days.");
      } 
    }
  };

  const labels = ["Work", "Study", "Personal", "Other"];
  const data = {
    labels,
    datasets: [
      {
        label: "Hours",
        data: labels.map(
          (label, index) =>
            filteredSummary.find((s) => s.session_type === index)?.duration || 0
        ),
        backgroundColor: [
          "rgba(54,162,235,0.2)",
          "rgba(255,206,86,0.2)",
          "rgba(75,192,192,0.2)",
          "rgba(153,102,255,0.2)",
        ],
        borderColor: [
          "rgba(54,162,235,1)",
          "rgba(255,206,86,1)",
          "rgba(75,192,192,1)",
          "rgba(153,102,255,1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center mt-6 my-6 gap-2.5">
        <div className="rounded-xl size-40 border-1 p-4 bg-gray-100">
          <p className="text-lg text-center">Focus Time Today</p>
          <div className="text-center text-lg font-bold py-8">
            {daily} {daily <= 1 ? "hr" : "hrs"}
          </div>
        </div>
        <div className="rounded-xl size-40 border-1 p-4 bg-gray-100">
          <p className="text-lg text-center">Focus Time This Week</p>
          <div className="text-center text-lg font-bold py-8">
            {weekly} {weekly <= 1 ? "hr" : "hrs"}
          </div>
        </div>
        <div className="rounded-xl size-40 border-1 p-4 bg-gray-100">
          <p className="text-lg text-center">Focus Sessions Completed</p>
          <div className="text-center text-lg font-bold py-8">
            {completed_sessions}
          </div>
        </div>
      </div>
      <div style={{ width: "600px", height: "400px" }}>
      <div className="flex items-center gap-2 my-2 justify-end p-5">
        <DatePicker
          onChange={handleDateChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          maxDate={new Date()}
          dateFormat="MM/dd/yyyy"
          className="border p-2 rounded"
        />
      </div>
        <Bar options={options} data={data} />
      </div>
    </>
  );
}

export const options = {
  indexAxis: "y" as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: "Focus Time Analysis" },
  },
  scales: {
    x: {
      ticks: {
        callback: function (value: unknown) {
          return value + "hr";
        },
      },
    },
  },
};
