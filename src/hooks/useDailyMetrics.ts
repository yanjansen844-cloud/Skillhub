import { useEffect, useMemo, useState } from 'react';
import { projectService } from '../services/projectService';
import type { DailyMetric, Project } from '../types';

// 180 dias = permite comparar 90 dias com os 90 anteriores
export const HISTORY_DAYS = 180;

/**
 * Série diária REAL (projects/{id}/daily) somando todos os projetos do usuário.
 * Recarrega sempre que os totais mudam (onSnapshot), mantendo o gráfico sincronizado.
 */
export const useDailyMetrics = (projects: Project[]) => {
  const [series, setSeries] = useState<DailyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const ids = useMemo(() => projects.map((p) => p.id).sort(), [projects]);
  const totalsKey = useMemo(
    () => projects.reduce((acc, p) => acc + p.views + p.clicks + p.promptsCopied, 0),
    [projects]
  );
  const idsKey = ids.join(',');

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const data = await projectService.getDailyMetrics(ids, HISTORY_DAYS);
        if (active) {
          setSeries(data);
          setError(false);
        }
      } catch (err) {
        console.error('Erro ao carregar métricas diárias:', err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }, 400); // debounce: várias atualizações em sequência geram uma única leitura
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, totalsKey]);

  return { series, loading, error };
};

/** Soma uma métrica nos últimos `days` dias, com deslocamento opcional (para o período anterior). */
export const sumRange = (
  series: DailyMetric[],
  key: 'views' | 'clicks' | 'promptsCopied',
  days: number,
  offset = 0
): number => {
  const end = series.length - offset;
  return series.slice(Math.max(0, end - days), Math.max(0, end)).reduce((acc, d) => acc + d[key], 0);
};

/** Variação percentual real; null quando não há base de comparação. */
export const percentChange = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};
