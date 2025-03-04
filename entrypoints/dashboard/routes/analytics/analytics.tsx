import { useListAnalyticsDashBoard } from "@/common/api/api";
import { useListAnalyticsWeeklyChart } from "@/common/api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  scales,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export function Dashboard() {
  const { daily, weekly, completed_sessions } = useListAnalyticsDashBoard();
  const { summary } = useListAnalyticsWeeklyChart();
  const labels = ["Work", "Study", "Personal", "Other"];
  let work,study,personal,other;
  if (typeof summary !== "undefined"){
    work = summary.find((sessionInfo)=> sessionInfo.session_type === 0)
    study = summary.find((sessionInfo)=> sessionInfo.session_type === 1)
    personal = summary.find((sessionInfo)=> sessionInfo.session_type === 2)
    other = summary.find((sessionInfo)=> sessionInfo.session_type === 3) 
  }



  const data = {
    labels,
    datasets: [
      {
        label: "Hours",
        data: [`${work?.duration}`, `${study?.duration}`, `${personal?.duration}`, `${other?.duration}`],
        //data: [1200,300,500,120],
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
          <div className="text-center text-lg font-bold py-8">{daily} {daily === 1 ? "hr": "hrs"}</div>
        </div>
        <div className="rounded-xl size-40 border-1 p-4 bg-gray-100">
          <p className="text-lg text-center">Focus Time This Week</p>
          <div className="text-center text-lg font-bold py-8">{weekly} {weekly === 1 ? "hr": "hrs"}</div>
        </div>
        <div className="rounded-xl size-40 border-1 p-4 bg-gray-100">
          <p className="text-lg text-center">Focus Sessions Completed</p>
          <div className="text-center text-lg font-bold py-8">
            {completed_sessions}
          </div>
        </div>
      </div>
      <div>
        <Bar options={options} data={data} />;
      </div>
    </>
  );
}

export const options = {
  indexAxis: "y" as const,
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: "right" as const,
    },
    title: {
      display: true,
      text: "Focus Time Analysis",
    },
  },
  scales:{
    x: {
        ticks:{
            callback: function(value,index,ticks){
                return value + 'hr';
            }
        }
    }
  }
};
