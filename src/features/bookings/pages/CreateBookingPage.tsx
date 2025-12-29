/**
 * Create Booking Page
 * 
 * Multi-step wizard for creating a new booking
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookingWizardProvider, useBookingWizard } from '../context/BookingWizardContext';
import BookingStepIndicator from '../components/BookingStepIndicator';
import {
  BookingForm,
  RoomsForm,
  RoomDaysForm,
  ServicesForm,
  GuaranteeForm,
  GuestForm,
  ReviewForm,
} from '../components/forms';

const CreateBookingPageContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentStep, completedSteps, setCurrentStep } = useBookingWizard();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookingForm />;
      case 2:
        return <RoomsForm />;
      case 3:
        return <RoomDaysForm />;
      case 4:
        return <ServicesForm />;
      case 5:
        return <GuaranteeForm />;
      case 6:
        return <GuestForm />;
      case 7:
        return <ReviewForm />;
      default:
        return <BookingForm />;
    }
  };

  return (
    <div className="flex flex-col h-full -m-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title={t('common.back', { defaultValue: 'Back' })}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{t('common.back', { defaultValue: 'Back' })}</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('bookings.create.title', { defaultValue: 'Create New Booking' })}
            </h1>
            <p className="text-xs text-slate-600">
              {t('bookings.create.subtitle', { defaultValue: 'Follow the steps to create a complete booking' })}
            </p>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex-shrink-0 mb-8">
        <BookingStepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  );
};

const CreateBookingPage: React.FC = () => {
  return (
    <BookingWizardProvider>
      <CreateBookingPageContent />
    </BookingWizardProvider>
  );
};

export default CreateBookingPage;

