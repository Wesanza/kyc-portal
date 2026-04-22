import React from 'react';
import { MessageSquare, RefreshCw, XCircle } from 'lucide-react';
import type { KycStatus } from '../../types/kyc';
import { cn } from '../../utils/cn';

interface ReviewerNotesBannerProps {
  status: KycStatus;
  notes?: string;
  className?: string;
}

const ReviewerNotesBanner: React.FC<ReviewerNotesBannerProps> = ({
  status,
  notes,
  className,
}) => {
  if (status !== 'REVISION_REQUESTED' && status !== 'REJECTED') return null;

  const isRejected = status === 'REJECTED';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-xl border-l-4 animate-slide-down',
        isRejected
          ? 'bg-red-50 border-l-error border border-red-200'
          : 'bg-amber-50 border-l-warning border border-amber-200',
        className
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          isRejected ? 'bg-red-100' : 'bg-amber-100'
        )}
      >
        {isRejected ? (
          <XCircle className="w-4 h-4 text-error" />
        ) : (
          <RefreshCw className="w-4 h-4 text-warning" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-body font-semibold mb-1',
            isRejected ? 'text-red-800' : 'text-amber-800'
          )}
        >
          {isRejected ? 'Submission Rejected' : 'Revision Requested'}
        </p>
        {notes ? (
          <div
            className={cn(
              'flex items-start gap-2 text-sm font-body',
              isRejected ? 'text-red-700' : 'text-amber-700'
            )}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{notes}</p>
          </div>
        ) : (
          <p
            className={cn(
              'text-sm font-body',
              isRejected ? 'text-red-600' : 'text-amber-600'
            )}
          >
            {isRejected
              ? 'This submission has been rejected. Please review and resubmit.'
              : 'Please review the notes and resubmit this section.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewerNotesBanner;
