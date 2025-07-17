import { Portfolio } from '@/types/trading212';
import { AssetDistributionChart } from './components/AssetDistributionChart';
import { PortfolioSummary } from './components/PortfolioSummary';
import { StatsSummary } from './components/StatsSummary';
import { TaxReport } from './components/TaxReport';
import { useAssetDistribution } from './hooks/useAssetDistribution';
import { useDialog } from './hooks/useDialog';
import { usePortfolioStats } from './hooks/usePortfolioStats';

interface DiagramProps {
  portfolio?: Portfolio;
}

export default function Diagram({ portfolio }: DiagramProps) {
  const assetDistribution = useAssetDistribution(portfolio);
  const stats = usePortfolioStats(portfolio);
  const { dialogData, openDialog, closeDialog } = useDialog();

  if (!portfolio) {
    return <div className="p-4">Загрузите CSV-файл для анализа</div>;
  }

  return (
    <div className="w-full space-y-8">
      <PortfolioSummary portfolio={portfolio} />
      <StatsSummary stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AssetDistributionChart data={assetDistribution} />
        <TaxReport portfolio={portfolio} />
      </div>
    </div>
  );
}
