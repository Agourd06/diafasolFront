/**
 * Booking Step Indicator
 * 
 * Visual progress indicator for the multi-step booking wizard
 */

import React from 'react';
import { BOOKING_STEPS } from '../types';

interface BookingStepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

const BookingStepIndicator: React.FC<BookingStepIndicatorProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
}) => {
  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'available';
    return 'upcoming';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'current':
        return 'bg-blue-500 text-white border-blue-500 ring-4 ring-blue-100';
      case 'available':
        return 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer';
      case 'upcoming':
        return 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed';
      default:
        return 'bg-gray-100 text-gray-400 border-gray-300';
    }
  };

  const getLineClasses = (prevStatus: string) => {
    if (prevStatus === 'completed') return 'bg-green-500';
    if (prevStatus === 'current') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {BOOKING_STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = status === 'available' || status === 'completed';

          return (
            <React.Fragment key={step.id}>
              {/* Connecting Line */}
              {index > 0 && (
                <div className="flex-1 h-1 mx-2">
                  <div
                    className={`h-full transition-all duration-300 ${getLineClasses(
                      getStepStatus(BOOKING_STEPS[index - 1].id)
                    )}`}
                  />
                </div>
              )}

              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    font-semibold text-sm transition-all duration-300
                    ${getStepClasses(status)}
                  `}
                >
                  {status === 'completed' ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </button>
                
                {/* Step Label */}
                <div className="absolute top-14 text-center w-32">
                  <p className={`text-sm font-medium ${status === 'current' ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepIndicator;

