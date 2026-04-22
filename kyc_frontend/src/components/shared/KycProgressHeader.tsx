import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../ui/ProgressBar';
import StatusBadge from '../ui/Badge';
import type { KycStatus } from '../../types/kyc';

interface KycProgressHeaderProps {
  sectionTitle: string;
  sectionNumber: number;
  totalSections?: number;
  status: KycStatus;
  completionPercent?: number;
}

const KycProgressHeader: React.FC<KycProgressHeaderProps> = ({
  sectionTitle,
  sectionNumber,
  totalSections = 8,
  status,
  completionPercent,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-light-gray px-4 py-4 sticky top-0 z-10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => navigate('/portal/home')}
            className="flex items-center gap-1.5 text-sm font-body text-medium-gray hover:text-forest transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex-1" />
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-body text-medium-gray uppercase tracking-wider">
              Section {sectionNumber} of {totalSections}
            </p>
            <h1 className="text-xl font-display font-bold text-forest">{sectionTitle}</h1>
          </div>
        </div>

        {completionPercent !== undefined && (
          <ProgressBar
            value={completionPercent}
            label="Overall KYC Progress"
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export default KycProgressHeader;
