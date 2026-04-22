import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-mint-surface flex items-center justify-center px-4">
      <div className="text-center flex flex-col items-center gap-6 max-w-sm">
        <div className="w-20 h-20 rounded-3xl bg-forest/10 flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-forest/40" />
        </div>
        <div>
          <p className="text-7xl font-display font-bold text-forest/20 mb-2">404</p>
          <h1 className="text-xl font-display font-bold text-charcoal mb-2">Page Not Found</h1>
          <p className="text-sm font-body text-medium-gray">
            The page you're looking for doesn't exist or you may not have access to it.
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
