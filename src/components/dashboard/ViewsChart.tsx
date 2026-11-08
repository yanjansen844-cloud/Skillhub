import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { DailyMetric } from '../../types';
import { percentChange, sumRange } from '../../hooks/useDailyMetrics';
import { TrendBadge } from './TrendBadge';

interface Props {
  series: DailyMetric[];
  loading: boolean;
  error: boolean;
}

type Period = '7d' | '30d' | '90d';
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 };

const formatDay = (iso: string, withWeekday: boolean) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return withWeekday
    ? d.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '')
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
};

export const ViewsChart: React.FC<Props> = ({ series, loading, error }) => {
  const [period, setPeriod] = useState<Period>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const days = PERIOD_DAYS[period];
  const range = series.slice(-days);

  // Dados reais: diário para 7/30 dias, semanal (somado) para 90 dias
  const getChartData = () => {
    if (period !== '90d') {
      return range.map((d) => ({
        date: formatDay(d.date, period === '7d'),
        label: formatDay(d.date, false),
        views: d.views,
        clicks: d.clicks,
      }));
    }
    const weeks: { date: string; label: string; views: number; clicks: number }[] = [];
    for (let i = 0; i < range.length; i += 7) {
      const chunk = range.slice(i, i + 7);
      if (chunk.length === 0) continue;
      const first = formatDay(chunk[0].date, false);
      const last = formatDay(chunk[chunk.length - 1].date, false);
      weeks.push({
        date: first,
        label: `${first} – ${last}`,
        views: chunk.reduce((a, d) => a + d.views, 0),
        clicks: chunk.reduce((a, d) => a + d.clicks, 0),
      });
    }
    return weeks;
  };

  const rawData = getChartData();
  const hasData = rawData.some((d) => d.views > 0 || d.clicks > 0);
  const currentViews = sumRange(series, 'views', days);
  const previousViews = sumRange(series, 'views', days, days);
  const viewsChange = percentChange(currentViews, previousViews);
  const labelEvery = rawData.length > 10 ? Math.ceil(rawData.length / 8) : 1;

  const maxVal = Math.max(5, Math.max(0, ...rawData.map(d => d.views)) * 1.2);
  const svgHeight = 220;
  const svgWidth = 600;
  const paddingX = 40;
  const paddingY = 25;

  const points = rawData.map((d, index) => {
    const x = paddingX + (index / Math.max(1, rawData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.views / maxVal) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Create SVG path for area & line
  const linePath = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`;
    // Simple smooth curve
    const prev = points[index - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = points.length === 0 ? '' : `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="bg-[#140e2d]/80 backdrop-blur-sm border border-purple-500/15 rounded-2xl p-5 sm:p-6 shadow-card-glow relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Gráfico de Visualizações
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Acompanhe o tráfego gerado a partir de links no Instagram & TikTok
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-[#1a1338] p-1 rounded-xl border border-purple-500/20 self-start sm:self-auto">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                period === p
                  ? 'bg-purple-600 text-white shadow-purple-glow font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : '90 dias'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats highlight above chart */}
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-cyan-glow" />
          <span className="text-slate-300">Visualizações de Páginas</span>
        </div>
        <TrendBadge
          change={viewsChange}
          current={currentViews}
          label={`vs ${days} dias anteriores`}
        />
        <span className="text-slate-400">
          {currentViews.toLocaleString('pt-BR')} no período
        </span>
      </div>

      {/* SVG Chart area */}
      <div className="relative w-full overflow-hidden">
        {(loading || error || !hasData) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-slate-400 bg-[#140e2d]/90 border border-purple-500/20 rounded-xl px-4 py-2 text-center max-w-xs">
              {loading
                ? 'Carregando métricas...'
                : error
                  ? 'Não foi possível carregar o histórico de métricas.'
                  : 'Ainda não há visualizações registradas neste período.'}
            </p>
          </div>
        )}
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id="viewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#a855f7" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="viewsLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(168, 85, 247, 0.12)"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#viewsAreaGradient)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#viewsLineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive points */}
          {points.map((pt, index) => {
            const isHovered = hoveredPoint === index;
            return (
              <g key={index} className="cursor-pointer">
                {/* Invisible hover area */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="16"
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Visual point */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  className="transition-all duration-200"
                  fill="#090714"
                  stroke={isHovered ? '#22d3ee' : '#c084fc'}
                  strokeWidth={isHovered ? 3 : 2}
                />

                {/* X Axis labels */}
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono select-none"
                >
                  {index % labelEvery === 0 || index === points.length - 1 ? pt.date : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip display */}
        {hoveredPoint !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1b143d] border border-cyan-500/40 rounded-xl px-3 py-1.5 shadow-xl text-center pointer-events-none transition-all duration-150 animate-fade-in"
          >
            <p className="text-[11px] text-slate-400 font-medium">
              {points[hoveredPoint].label}
            </p>
            <p className="text-xs font-bold text-cyan-300">
              {points[hoveredPoint].views.toLocaleString('pt-BR')} visualizações
            </p>
            <p className="text-[10px] text-purple-300">
              {points[hoveredPoint].clicks.toLocaleString('pt-BR')} cliques gerados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
