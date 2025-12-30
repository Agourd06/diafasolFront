/**
 * Continue Booking Page
 * 
 * Load an existing booking and continue the creation process
 */

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingWizardProvider, useBookingWizard } from '../context/BookingWizardContext';
import { useBooking } from '../hooks';
import Loader from '@/components/Loader';
import BookingStepIndicator from '../components/BookingStepIndicator';
import BookingForm from '../components/forms/BookingForm';
import RoomsForm from '../components/forms/RoomsForm';
import RoomDaysForm from '../components/forms/RoomDaysForm';
import ServicesForm from '../components/forms/ServicesForm';
import GuaranteeForm from '../components/forms/GuaranteeForm';
import GuestForm from '../components/forms/GuestForm';
import ReviewForm from '../components/forms/ReviewForm';

const ContinueBookingContent: React.FC = () => {
  const { t } = useTranslation();
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { currentStep, completedSteps, loadExistingBooking, resetWizard, setCurrentStep } = useBookingWizard();
  const { data: booking, isLoading, error } = useBooking(bookingId || null);
  
  // Track if we've already loaded this booking to prevent infinite loops
  const loadedBookingIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset wizard when component mounts
    return () => {
      resetWizard();
    };
  }, [resetWizard]);

  useEffect(() => {
    // Only load if we have a booking, it hasn't been loaded yet, and it's a different booking
    if (booking && bookingId && loadedBookingIdRef.current !== bookingId) {
      console.log('📥 Loading booking for continuation:', booking);
      loadExistingBooking(booking);
      loadedBookingIdRef.current = bookingId; // Mark as loaded
    }
  }, [booking, bookingId, loadExistingBooking]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader label={t('bookings.messages.loadingBooking', { defaultValue: 'Loading booking...' })} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 mb-4">{t('bookings.messages.failedToLoadBooking', { defaultValue: 'Failed to load booking' })}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t('bookings.messages.backToBookings', { defaultValue: 'Back to Bookings' })}
        </button>
      </div>
    );
  }

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
    <div className="flex flex-col -m-6 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('bookings.messages.continueBooking', { defaultValue: 'Continue Booking' })}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('bookings.messages.continueBookingDesc', { defaultValue: 'Continue creating booking: {{id}}', id: booking.uniqueId || booking.id })}
          </p>
        </div>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </button>
      </div>

      {/* Step Indicator */}
      <BookingStepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
      />

      {/* Current Step Form */}
      <div className="flex-1">
        {renderStep()}
      </div>
    </div>
  );
};

const ContinueBookingPage: React.FC = () => {
  return (
    <BookingWizardProvider>
      <ContinueBookingContent />
    </BookingWizardProvider>
  );
};

export default ContinueBookingPage;

