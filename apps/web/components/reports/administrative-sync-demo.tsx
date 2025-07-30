/**
 * Administrative Sync Demo Component
 * 
 * Demonstrates Phase 3 features: visual feedback, sync status, 
 * manual override options, and progressive disclosure.
 * 
 * Following Viralkan Design System 2.0 & Frontend Development Guidelines
 */

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Badge } from '@repo/ui/components/ui/badge';
import { Separator } from '@repo/ui/components/ui/separator';
import { 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import { AdministrativeSelect } from './administrative-select';
import { AdministrativeSyncStatus } from './administrative-sync-status';
import { useAdministrativeSync } from '../../hooks/reports/use-administrative-sync';
import { CreateReportInput } from '../../lib/types/api';
import { useForm } from 'react-hook-form';

/**
 * Demo test cases for different scenarios
 */
const DEMO_TEST_CASES = [
  {
    id: 'bekasi-exact',
    name: 'Bekasi - Exact Match',
    description: 'Perfect match for "Bekasi" to "Kota Bekasi"',
    geocodingData: {
      street_name: 'Jalan Lumbu Timur IV',
      district: 'Makrik',
      city: 'Bekasi',
      province: 'Jawa Barat'
    },
    expectedConfidence: 0.95,
    expectedMatchType: 'exact'
  },
  {
    id: 'jakarta-synonym',
    name: 'Jakarta - Synonym Match',
    description: 'Synonym match for "Jakarta" to "DKI Jakarta"',
    geocodingData: {
      street_name: 'Jalan Sudirman',
      district: 'Menteng',
      city: 'Jakarta',
      province: 'DKI Jakarta'
    },
    expectedConfidence: 0.85,
    expectedMatchType: 'synonym'
  },
  {
    id: 'surabaya-fuzzy',
    name: 'Surabaya - Fuzzy Match',
    description: 'Fuzzy match for "Surabaya" to "Kota Surabaya"',
    geocodingData: {
      street_name: 'Jalan Tunjungan',
      district: 'Genteng',
      city: 'Surabaya',
      province: 'Jawa Timur'
    },
    expectedConfidence: 0.75,
    expectedMatchType: 'fuzzy'
  },
  {
    id: 'unknown-location',
    name: 'Unknown Location - No Match',
    description: 'No match found for unknown location',
    geocodingData: {
      street_name: 'Jalan Tidak Dikenal',
      district: 'Kecamatan Aneh',
      city: 'Kota Tidak Ada',
      province: 'Provinsi Fiktif'
    },
    expectedConfidence: 0.0,
    expectedMatchType: 'none'
  }
];

/**
 * Demo component props
 */
interface AdministrativeSyncDemoProps {
  className?: string;
}

/**
 * Administrative sync demo component
 */
export const AdministrativeSyncDemo: React.FC<AdministrativeSyncDemoProps> = ({
  className = ''
}) => {
  const [currentTestCase, setCurrentTestCase] = useState(DEMO_TEST_CASES[0]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Create a demo form
  const form = useForm<CreateReportInput>({
    defaultValues: {
      street_name: '',
      province: '',
      province_code: '',
      city: '',
      regency_code: '',
      district: '',
      district_code: '',
      location_text: '',
      lat: 0,
      lon: 0,
      category: 'berlubang'
    }
  });

  // Enhanced administrative sync hook
  const {
    enhancedGeocoding,
    syncStatus,
    isProcessing: isSyncProcessing,
    processGeocoding,
    applyToForm,
    clearSync,
    hasValidMatch,
    canAutoSelect,
    confidenceLevel
  } = useAdministrativeSync({
    form,
    autoApply: false, // Manual control for demo
    confidenceThreshold: 0.7,
    enableValidation: true
  });

  /**
   * Run demo with current test case
   */
  const runDemo = async () => {
    setIsDemoRunning(true);
    setDemoStep(0);

    // Step 1: Set street name
    await new Promise(resolve => setTimeout(resolve, 500));
    form.setValue('street_name', currentTestCase.geocodingData.street_name);
    setDemoStep(1);

    // Step 2: Process geocoding
    await new Promise(resolve => setTimeout(resolve, 1000));
    await processGeocoding(currentTestCase.geocodingData);
    setDemoStep(2);

    // Step 3: Show results
    await new Promise(resolve => setTimeout(resolve, 500));
    setDemoStep(3);

    setIsDemoRunning(false);
  };

  /**
   * Reset demo
   */
  const resetDemo = () => {
    setIsDemoRunning(false);
    setDemoStep(0);
    clearSync();
    form.reset();
  };

  /**
   * Apply sync manually
   */
  const handleApplySync = async () => {
    try {
      const result = await applyToForm();
      if (result.applied) {
        console.log('Demo: Administrative data applied successfully:', result.appliedFields);
      }
    } catch (error) {
      console.error('Demo: Failed to apply administrative sync:', error);
    }
  };

  /**
   * Handle manual override
   */
  const handleManualOverride = () => {
    clearSync();
    console.log('Demo: Manual override activated');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Administrative Sync Demo - Phase 3 Features
          </CardTitle>
          <p className="text-sm text-neutral-600">
            Demonstrating enhanced user experience with visual feedback, confidence indicators, 
            and manual override options for administrative data synchronization.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Case Selector */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-900">Test Cases:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_TEST_CASES.map((testCase) => (
                <Card
                  key={testCase.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentTestCase.id === testCase.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-neutral-50'
                  }`}
                  onClick={() => setCurrentTestCase(testCase)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-neutral-900">
                          {testCase.name}
                        </h5>
                        <p className="text-xs text-neutral-600 mt-1">
                          {testCase.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(testCase.expectedConfidence * 100)}% Expected
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {testCase.expectedMatchType}
                          </Badge>
                        </div>
                      </div>
                      {currentTestCase.id === testCase.id && (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Demo Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={runDemo}
              disabled={isDemoRunning}
              className="flex items-center gap-2"
            >
              {isDemoRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Demo
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetDemo}
              disabled={isDemoRunning}
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Demo Progress */}
          {isDemoRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Step {demoStep + 1}/4: {
                  demoStep === 0 ? 'Initializing...' :
                  demoStep === 1 ? 'Setting street name...' :
                  demoStep === 2 ? 'Processing geocoding...' :
                  'Showing results...'
                }
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((demoStep + 1) / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Test Case Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Geocoding Response:</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Street:</strong> {currentTestCase.geocodingData.street_name}</div>
                <div><strong>District:</strong> {currentTestCase.geocodingData.district}</div>
                <div><strong>City:</strong> {currentTestCase.geocodingData.city}</div>
                <div><strong>Province:</strong> {currentTestCase.geocodingData.province}</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-neutral-900 mb-2">Expected Results:</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Confidence:</strong> {Math.round(currentTestCase.expectedConfidence * 100)}%</div>
                <div><strong>Match Type:</strong> {currentTestCase.expectedMatchType}</div>
                <div><strong>Auto-Select:</strong> {currentTestCase.expectedConfidence >= 0.7 ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Administrative Select Component */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced Administrative Select</CardTitle>
          <p className="text-sm text-neutral-600">
            Phase 3 features: Visual feedback, sync status, confidence indicators, and manual override options.
          </p>
        </CardHeader>
        <CardContent>
          <AdministrativeSelect
            form={form}
            disabled={isDemoRunning}
            isFormActivated={true}
            enableAutoSync={false} // Manual control for demo
            showSyncStatus={true}
          />
        </CardContent>
      </Card>

      {/* Sync Status Display */}
      {syncStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sync Status & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdministrativeSyncStatus
              syncStatus={syncStatus}
              isProcessing={isSyncProcessing}
              onApply={handleApplySync}
              onManualOverride={handleManualOverride}
              onRetry={() => processGeocoding(currentTestCase.geocodingData)}
            />
          </CardContent>
        </Card>
      )}

      {/* Form Values Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Form Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Street Information:</h4>
              <div className="space-y-1">
                <div><strong>Street Name:</strong> {form.watch('street_name') || 'Not set'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-2">Administrative Data:</h4>
              <div className="space-y-1">
                <div><strong>Province:</strong> {form.watch('province') || 'Not set'}</div>
                <div><strong>City:</strong> {form.watch('city') || 'Not set'}</div>
                <div><strong>District:</strong> {form.watch('district') || 'Not set'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phase 3 Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-neutral-900">Visual Feedback & Status Indicators</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Sync status cards with confidence indicators
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Color-coded confidence levels (green/yellow/red)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Progress indicators during processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Auto-filled values display with accuracy badges
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-neutral-900">Manual Override & Progressive Disclosure</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  One-click manual override options
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Apply/retry buttons for sync actions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Clear messaging for different confidence levels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Smart defaults with user verification
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdministrativeSyncDemo; 