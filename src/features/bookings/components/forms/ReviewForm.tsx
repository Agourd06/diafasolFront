/**
 * Review Form - Step 7
 * 
 * Review all booking information and complete
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBookingWizard } from '../../context/BookingWizardContext';
import { formatCurrency } from '@/constants/currencies';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const ReviewForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    booking,
    bookingId,
    rooms,
    roomDays,
    services,
    guarantee,
    guest,
    resetWizard,
    setCurrentStep,
  } = useBookingWizard();

  const handleComplete = () => {
    // Navigate to booking details page
    if (bookingId) {
      resetWizard();
      navigate(`/bookings/${bookingId}`);
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('bookings.review.bookingInfo', { defaultValue: 'Booking Information' })}
          </h3>
          <Button
            type="button"
            onClick={() => handleEdit(1)}
            variant="secondary"
            className="text-sm"
          >
            Edit
          </Button>
        </div>
        {booking && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Status:</p>
              <p className="font-medium text-gray-900">{booking.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Dates:</p>
              <p className="font-medium text-gray-900">
                {booking.arrivalDate} → {booking.departureDate}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Amount:</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(booking.amount, booking.currency || 'EUR')}
              </p>
            </div>
            {booking.otaName && (
              <div>
                <p className="text-gray-600">OTA:</p>
                <p className="font-medium text-gray-900">{booking.otaName}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Rooms Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('bookings.review.rooms', { defaultValue: 'Rooms' })} ({rooms.length})
          </h3>
          <Button
            type="button"
            onClick={() => handleEdit(2)}
            variant="secondary"
            className="text-sm"
          >
            Edit
          </Button>
        </div>
        <div className="space-y-3">
          {rooms.map((room, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Room {index + 1}</p>
              <p className="text-xs text-gray-600 mt-1">
                {room.checkinDate} → {room.checkoutDate}
              </p>
              <p className="text-xs text-gray-600">
                Adults: {room.adults}, Children: {room.children}, Infants: {room.infants}
              </p>
              {room.amount && (
                <p className="text-xs text-gray-600">
                  Amount: {formatCurrency(room.amount, booking.currency || 'EUR')}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Services Summary */}
      {services.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('bookings.review.services', { defaultValue: 'Services' })} ({services.length})
            </h3>
            <Button
              type="button"
              onClick={() => handleEdit(4)}
              variant="secondary"
              className="text-sm"
            >
              Edit
            </Button>
          </div>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-700">{service.name}</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(service.totalPrice || 0, booking.currency || 'EUR')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Guarantee Summary */}
      {guarantee && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('bookings.review.guarantee', { defaultValue: 'Payment Guarantee' })}
            </h3>
            <Button
              type="button"
              onClick={() => handleEdit(5)}
              variant="secondary"
              className="text-sm"
            >
              Edit
            </Button>
          </div>
          <div className="text-sm space-y-2">
            {guarantee.cardType && (
              <p className="text-gray-700">
                <span className="font-medium">Card Type:</span> {guarantee.cardType}
              </p>
            )}
            {guarantee.cardHolderName && (
              <p className="text-gray-700">
                <span className="font-medium">Card Holder:</span> {guarantee.cardHolderName}
              </p>
            )}
            {guarantee.maskedCardNumber && (
              <p className="text-gray-700 font-mono">
                <span className="font-medium">Card:</span> {guarantee.maskedCardNumber}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Guest Summary */}
      {guest && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('bookings.review.guest', { defaultValue: 'Guest Information' })}
            </h3>
            <Button
              type="button"
              onClick={() => handleEdit(6)}
              variant="secondary"
              className="text-sm"
            >
              Edit
            </Button>
          </div>
          <div className="text-sm space-y-2">
            {(guest.firstName || guest.lastName) && (
              <p className="text-gray-700">
                <span className="font-medium">Name:</span> {guest.firstName} {guest.lastName}
              </p>
            )}
            {guest.email && (
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {guest.email}
              </p>
            )}
            {guest.phone && (
              <p className="text-gray-700">
                <span className="font-medium">Phone:</span> {guest.phone}
              </p>
            )}
            {guest.address && (
              <p className="text-gray-700">
                <span className="font-medium">Address:</span> {guest.address}, {guest.city} {guest.zip}, {guest.country}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Completion Message */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-green-900">Booking Created Successfully!</h4>
            <p className="text-sm text-green-700 mt-1">
              Your booking has been created with ID: <span className="font-mono font-medium">{bookingId}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={() => setCurrentStep(6)}
          variant="secondary"
        >
          {t('common.back', { defaultValue: 'Back' })}
        </Button>
        <Button
          type="button"
          onClick={handleComplete}
        >
          {t('bookings.review.viewBooking', { defaultValue: 'View Booking Details' })}
        </Button>
      </div>
    </div>
  );
};

export default ReviewForm;

