import { useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, Timer, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { buildStats, WEEKLY_DATA, CODIFICATION_DATA } from "../lib/dashboardData.js";

const CARD_STYLES = [
  { grad: "grad-purple", icon: Activity },
  { grad: "grad-violet", icon: CheckCircle2 },
  { grad: "grad-orange", icon: AlertTriangle },
  { grad: "grad-teal", icon: Timer },
];

export default function DashboardOverview({ encounters, stats, sampleCharts = false }) {
  const cards = buildStats(stats);
  const gaugeValue = stats ? stats.successRate ?? 0 : 99.8;
  return (
    <>
      <div className="gstat-grid">
        {cards.map((stat, i) => {
          const { grad, icon: Icon } = CARD_STYLES[i];
          return (
            <div className={"gstat " + grad} key={stat.label}>
              <Icon size={22} strokeWidth={1.8} />
              <p className="gstat-label">{stat.label}</p>
              <p className="gstat-value">{stat.value}</p>
              <p className="gstat-delta">{stat.delta}</p>
              <span className="gstat-orb" aria-hidden="true" />
            </div>
          );
        })}
      </div>

      <div className="dash-row dash-row-calendar">
        <CalendarCard />
        <div className="panel">
          <div className="panel-head">
            <h2>Translations this week</h2>
            {sampleCharts && <span className="panel-tag">Sample data</span>}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={WEEKLY_DATA} barCategoryGap={18} barGap={3}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8a90b5" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8a90b5" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip cursor={{ fill: "rgba(74,69,209,0.06)" }} contentStyle={{ borderRadius: 10, border: "1px solid #e2e6ee", fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="mapped" name="Mapped" fill="#4a45d1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending review" fill="#ffab91" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#2fd3ac" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dash-row dash-row-table">
        <div className="panel">
          <div className="panel-head">
            <h2>Recent transformed encounters</h2>
          </div>
          <div className="table-scroll">
            <table className="encounters-table">
              <thead>
                <tr>
                  <th>Patient ID</th><th>Name</th><th>Traditional term</th>
                  <th>NAMASTE code</th><th>ICD-11 code</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {encounters.length === 0 && (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No encounters yet. Run the EMR Sandbox to create one.
                    </td>
                  </tr>
                )}
                {encounters.map((row) => (
                  <tr key={row.id ?? row.patientId + row.namaste}>
                    <td className="table-link">{row.patientId}</td>
                    <td>{row.name}</td>
                    <td>{row.term}</td>
                    <td>{row.namaste}</td>
                    <td>{row.icd}</td>
                    <td><span className="status-pill">SYNCED</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-stack">
          <div className="panel panel-center">
            <h2>Translation success</h2>
            <Gauge value={gaugeValue} />
            <p className="panel-foot">Over the last 7 days</p>
          </div>
          <div className="panel">
            <h2>AYUSH codification breakdown</h2>
            {sampleCharts && <span className="panel-tag">Sample data</span>}
            <div className="donut-row">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={CODIFICATION_DATA} dataKey="value" innerRadius={32} outerRadius={52} paddingAngle={2} stroke="none">
                    {CODIFICATION_DATA.map((e) => (<Cell key={e.name} fill={e.color} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <ul className="donut-legend">
                {CODIFICATION_DATA.map((e) => (
                  <li key={e.name}>
                    <span className="legend-swatch" style={{ background: e.color }} />
                    {e.name} ({e.value}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Gauge({ value }) {
  const ticks = 60;
  const start = 135; // degrees, bottom-left
  const sweep = 270;
  const filled = Math.round((value / 100) * ticks);
  const cx = 90, cy = 90;
  return (
    <svg viewBox="0 0 180 180" className="gauge" role="img" aria-label={`${value}% translation success`}>
      {Array.from({ length: ticks }, (_, i) => {
        const a = ((start + (sweep * i) / (ticks - 1)) * Math.PI) / 180;
        const x1 = cx + Math.cos(a) * 62, y1 = cy + Math.sin(a) * 62;
        const x2 = cx + Math.cos(a) * 80, y2 = cy + Math.sin(a) * 80;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="3" strokeLinecap="round"
            stroke={i < filled ? "#4a45d1" : "#dfe2f3"} />
        );
      })}
      <text x="90" y="90" textAnchor="middle" className="gauge-value">{value}%</text>
      <text x="90" y="110" textAnchor="middle" className="gauge-label">Success rate</text>
    </svg>
  );
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function CalendarCard() {
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const first = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const isToday = (d) => d && view.y === today.getFullYear() && view.m === today.getMonth() && d === today.getDate();

  function shift(delta) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  return (
    <div className="panel cal">
      <div className="panel-head">
        <h2>Schedule</h2>
      </div>
      <div className="cal-nav">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
        <div><strong>{MONTHS[view.m]}</strong><span>{view.y}</span></div>
        <button type="button" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={16} /></button>
      </div>
      <div className="cal-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (<span key={d} className="cal-dow">{d}</span>))}
        {cells.map((d, i) => (
          <span key={i} className={"cal-day" + (isToday(d) ? " is-today" : "")}>{d}</span>
        ))}
      </div>
    </div>
  );
}
