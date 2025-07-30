/**
 * Administrative Sync Status Component
 * 
 * Visual feedback component for administrative data synchronization status
 * with confidence indicators and manual override options.
 * 
 * Following Viralkan Design System 2.0 & Frontend Development Guidelines
 */

import React from 'react';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { Badge } from '@repo/ui/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  RefreshCw,
  MapPin,
  Settings
} from 'lucide-react';
import type { AdministrativeSyncStatus } from '../../lib/utils/enhanced-geocoding-handler';
import { getConfidenceDescription, getMatchTypeDescription } from '../../lib/utils/enhanced-geocoding-handler';

/**
 * Component props
 */
interface AdministrativeSyncStatusComponentProps {
  syncStatus: AdministrativeSyncStatus | null;
  isProcessing?: boolean;
  onApply?: () => Promise<void>;
  onManualOverride?: () => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Administrative sync status component
 */
export const AdministrativeSyncStatus: React.FC<AdministrativeSyncStatusComponentProps> = ({
  syncStatus,
  isProcessing = false,
  onApply,
  onManualOverride,
  onRetry,
  className = ''
}) => {
  if (!syncStatus) {
    return null;
  }

  const { isSynced, confidence, matchType, message, color, canAutoSelect } = syncStatus;
  const confidenceInfo = getConfidenceDescription(confidence);
  const matchTypeInfo = getMatchTypeDescription(matchType);

  // Determine status icon and styling
  const getStatusConfig = () => {
    switch (color) {
      case 'green':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          iconColor: 'text-green-600'
        };
      case 'yellow':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-600'
        };
      case 'red':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          iconColor: 'text-red-600'
        };
      case 'gray':
      default:
        return {
          icon: HelpCircle,
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          textColor: 'text-neutral-700',
          iconColor: 'text-neutral-600'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor} border ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Status Information */}
          <div className="flex items-start space-x-3 flex-1">
            {/* Status Icon */}
            <div className={`${statusConfig.iconColor} mt-0.5`}>
              {isProcessing ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <StatusIcon className="h-5 w-5" />
              )}
            </div>

            {/* Status Content */}
            <div className="flex-1 space-y-2">
              {/* Main Message */}
              <div className="flex items-center space-x-2">
                <h4 className={`text-sm font-medium ${statusConfig.textColor}`}>
                  {message}
                </h4>
                {isSynced && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${statusConfig.borderColor} ${statusConfig.textColor}`}
                  >
                    {confidenceInfo.icon} {confidenceInfo.description}
                  </Badge>
                )}
              </div>

              {/* Match Type and Confidence */}
              {isSynced && (
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-neutral-500" />
                    <span className="text-neutral-600">
                      {matchTypeInfo.icon} {matchTypeInfo.description}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-neutral-300" />
                    <span className="text-neutral-600">
                      Keakuratan: {Math.round(confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Validation Issues */}
              {!isSynced && matchType === 'none' && (
                <p className="text-xs text-neutral-600">
                  Lokasi tidak ditemukan dalam data administratif. Silakan pilih secara manual.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Apply Button */}
            {canAutoSelect && onApply && (
              <Button
                size="sm"
                variant="outline"
                onClick={onApply}
                disabled={isProcessing}
                className="h-8 px-3 text-xs"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Terapkan
                  </>
                )}
              </Button>
            )}

            {/* Manual Override Button */}
            {onManualOverride && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onManualOverride}
                disabled={isProcessing}
                className="h-8 px-3 text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Manual
              </Button>
            )}

            {/* Retry Button */}
            {onRetry && !isSynced && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onRetry}
                disabled={isProcessing}
                className="h-8 px-3 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Coba Lagi
              </Button>
            )}
          </div>
        </div>

        {/* Progress Indicator for Processing */}
        {isProcessing && (
          <div className="mt-3">
            <div className="w-full bg-neutral-200 rounded-full h-1">
              <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-neutral-600 mt-1">
              Mencari data administratif...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Compact version for inline use
 */
export const AdministrativeSyncStatusCompact: React.FC<AdministrativeSyncStatusComponentProps> = ({
  syncStatus,
  isProcessing = false,
  onApply,
  onManualOverride,
  className = ''
}) => {
  if (!syncStatus) {
    return null;
  }

  const { isSynced, confidence, message, color, canAutoSelect } = syncStatus;
  const confidenceInfo = getConfidenceDescription(confidence);

  const getStatusConfig = () => {
    switch (color) {
      case 'green':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        };
      case 'yellow':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700'
        };
      case 'red':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        };
      case 'gray':
      default:
        return {
          icon: HelpCircle,
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          textColor: 'text-neutral-700'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} ${className}`}>
      {isProcessing ? (
        <RefreshCw className="h-4 w-4 animate-spin text-neutral-500" />
      ) : (
        <StatusIcon className="h-4 w-4" />
      )}
      
      <span className={`text-sm font-medium ${statusConfig.textColor}`}>
        {message}
      </span>
      
      {isSynced && (
        <Badge variant="outline" className="text-xs">
          {confidenceInfo.icon} {Math.round(confidence * 100)}%
        </Badge>
      )}

      {canAutoSelect && onApply && (
        <Button
          size="sm"
          variant="outline"
          onClick={onApply}
          disabled={isProcessing}
          className="h-6 px-2 text-xs"
        >
          Terapkan
        </Button>
      )}

      {onManualOverride && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onManualOverride}
          disabled={isProcessing}
          className="h-6 px-2 text-xs"
        >
          Manual
        </Button>
      )}
    </div>
  );
};

export default AdministrativeSyncStatus; 