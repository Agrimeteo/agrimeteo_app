import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Droplets, Loader2, RefreshCcw, ShieldPlus, Sprout, TriangleAlert } from 'lucide-react';
import api from '../services/api';

type RecommendationCategory = 'irrigation' | 'fertilization' | 'phytosanitary';
type RecommendationPriority = 'low' | 'medium' | 'high';

type Recommendation = {
  id: string;
  generationId: string;
  category: RecommendationCategory;
  title: string;
  summary: string;
  actions: string[];
  priority: RecommendationPriority;
  growthStage: string;
  weatherSummary: string | null;
  recentInterventions: string[];
  generatedAt: string;
};

type RecommendationResponse = {
  recommendations: Recommendation[];
  source: 'cache' | 'fresh';
  generatedAt: string;
};

const categoryConfig: Record<
  RecommendationCategory,
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  irrigation: { label: 'Arrosage', icon: Droplets },
  fertilization: { label: 'Fertilisation', icon: Sprout },
  phytosanitary: { label: 'Traitements phytosanitaires', icon: ShieldPlus },
};

const priorityClasses: Record<RecommendationPriority, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high: 'bg-red-50 text-red-700 border-red-100',
};

interface Props {
  planId: string;
  cropName?: string | null;
  compact?: boolean;
}

const CropRecommendationsWidget: React.FC<Props> = ({ planId, cropName, compact = false }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<RecommendationCategory | null>('irrigation');

  const loadRecommendations = async (forceRefresh = false) => {
    const request = forceRefresh
      ? api.post(`/crop-plans/${planId}/recommendations/refresh`)
      : api.get(`/crop-plans/${planId}/recommendations`);

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Frontend integration note:
      // the widget consumes the new crop recommendation endpoint tied to the crop plan id.
      const response = await request;
      const payload = response.data?.data as RecommendationResponse | undefined;
      setRecommendations(payload?.recommendations ?? []);
      setLastUpdated(payload?.generatedAt ?? null);
      setErrorMessage('');
      if (payload?.recommendations?.length) {
        setOpenCategory(payload.recommendations[0].category);
      }
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error ||
        (error as { message?: string }).message ||
        'Unable to load recommendations right now.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadRecommendations();

    // Real-time-ish updates:
    // the dashboard widget refreshes in the background so the plan stays aligned with the latest weather context.
    const interval = window.setInterval(() => {
      void loadRecommendations();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [planId]);

  const groupedRecommendations = useMemo(
    () =>
      recommendations.reduce<Record<RecommendationCategory, Recommendation | null>>(
        (acc, recommendation) => {
          acc[recommendation.category] = recommendation;
          return acc;
        },
        {
          irrigation: null,
          fertilization: null,
          phytosanitary: null,
        },
      ),
    [recommendations],
  );

  const wrapperClass = compact
    ? 'rounded-xl border border-slate-200 bg-slate-50 p-4'
    : 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

  return (
    <section className={wrapperClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Recommandations personnalisées{cropName ? ` pour ${cropName}` : ''}
          </h3>
          <p className="text-sm text-slate-500">
            Conseils calculés à partir du stade de culture, des interventions récentes et de la météo actuelle.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadRecommendations(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      {lastUpdated && (
        <p className="mt-3 text-xs text-slate-400">
          Dernière mise à jour : {new Date(lastUpdated).toLocaleString()}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
          <Loader2 size={18} className="animate-spin text-primary" />
          Chargement des recommandations...
        </div>
      ) : errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {(Object.keys(categoryConfig) as RecommendationCategory[]).map((category) => {
            const recommendation = groupedRecommendations[category];
            const config = categoryConfig[category];
            const Icon = config.icon;
            const isOpen = openCategory === category;

            return (
              <div key={category} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : category)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{config.label}</p>
                      <p className="text-xs text-slate-500">
                        {recommendation?.title ?? 'Aucune recommandation disponible pour le moment'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && recommendation && (
                  <div className="border-t border-slate-100 px-4 py-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${priorityClasses[recommendation.priority]}`}>
                        Priorité {recommendation.priority}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                        Stade {recommendation.growthStage}
                      </span>
                    </div>

                    <p className="text-sm leading-6 text-slate-700">{recommendation.summary}</p>

                    {recommendation.weatherSummary && (
                      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        Météo utilisée : {recommendation.weatherSummary}
                      </div>
                    )}

                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Actions à mener
                      </p>
                      <ul className="space-y-2">
                        {recommendation.actions.map((action, index) => (
                          <li key={`${recommendation.id}-${index}`} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-1 h-2 w-2 rounded-full bg-primary/60" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {recommendation.recentInterventions.length > 0 && (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          <TriangleAlert size={14} className="text-amber-500" />
                          Interventions prises en compte
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.recentInterventions.map((intervention) => (
                            <span
                              key={`${recommendation.id}-${intervention}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
                            >
                              {intervention}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CropRecommendationsWidget;
