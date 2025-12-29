/**
 * Booking Details Page
 * 
 * View complete booking with all nested data
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useBooking } from '../hooks';
import { formatCurrency } from '@/constants/currencies';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/Loader';
import type { STATUS_COLORS } from '../types';

const BookingDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId: string }>();

  const { data: booking, isLoading, error } = useBooking(bookingId || null);

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader label={t('common.loading', { defaultValue: 'Loading...' })} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{t('bookings.details.notFound', { defaultValue: 'Booking not found' })}</p>
        <Button onClick={() => navigate('/bookings')}>
          {t('bookings.details.backToList', { defaultValue: 'Back to Bookings' })}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col -m-6 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{t('common.back', { defaultValue: 'Back' })}</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('bookings.details.title', { defaultValue: 'Booking Details' })}
            </h1>
            <p className="text-xs text-slate-600 font-mono">{booking.id}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 text-sm font-semibold rounded border ${getStatusColor(booking.status)}`}>
          {booking.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
      </div>

      {/* Booking Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t('bookings.details.bookingInfo', { defaultValue: 'Booking Information' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Arrival Date</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(booking.arrivalDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Departure Date</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(booking.departureDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Amount</p>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(booking.amount, booking.currency || 'EUR')}
            </p>
          </div>
          {booking.uniqueId && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Unique ID</p>
              <p className="text-sm font-medium text-gray-900">{booking.uniqueId}</p>
            </div>
          )}
          {booking.otaReservationCode && (
            <div>
              <p className="text-xs text-gray-500 mb-1">OTA Reservation Code</p>
              <p className="text-sm font-medium text-gray-900">{booking.otaReservationCode}</p>
            </div>
          )}
          {booking.otaName && (
            <div>
              <p className="text-xs text-gray-500 mb-1">OTA Name</p>
              <p className="text-sm font-medium text-gray-900">{booking.otaName}</p>
            </div>
          )}
          {booking.arrivalHour && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Arrival Hour</p>
              <p className="text-sm font-medium text-gray-900">{booking.arrivalHour}</p>
            </div>
          )}
          {booking.otaCommission && (
            <div>
              <p className="text-xs text-gray-500 mb-1">OTA Commission</p>
              <p className="text-sm font-medium text-gray-900">{booking.otaCommission}</p>
            </div>
          )}
          {booking.occupancy && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Occupancy</p>
              <p className="text-sm font-medium text-gray-900">
                Adults: {booking.occupancy.adults || 0}, Children: {booking.occupancy.children || 0}, Infants: {booking.occupancy.infants || 0}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-1">Created At</p>
            <p className="text-sm font-medium text-gray-900">{formatDateTime(booking.createdAt)}</p>
          </div>
        </div>
        {booking.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Notes</p>
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}
      </Card>

      {/* Rooms */}
      {booking.rooms && booking.rooms.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('bookings.details.rooms', { defaultValue: 'Rooms' })} ({booking.rooms.length})
          </h2>
          <div className="space-y-4">
            {booking.rooms.map((room, index) => (
              <div key={room.id} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Room {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-900">{formatDate(room.checkinDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-900">{formatDate(room.checkoutDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Occupancy</p>
                    <p className="font-medium text-gray-900">
                      {room.adults}A / {room.children}C / {room.infants}I
                    </p>
                  </div>
                  {room.amount && (
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(room.amount, booking.currency || 'EUR')}
                      </p>
                    </div>
                  )}
                  {room.otaUniqueId && (
                    <div>
                      <p className="text-xs text-gray-500">OTA Unique ID</p>
                      <p className="font-medium text-gray-900">{room.otaUniqueId}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Services */}
      {booking.services && booking.services.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('bookings.details.services', { defaultValue: 'Services' })} ({booking.services.length})
          </h2>
          <div className="space-y-3">
            {booking.services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {service.priceMode} • {service.persons} person(s) × {service.nights} night(s)
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(service.totalPrice || 0, booking.currency || 'EUR')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Guarantee */}
      {booking.guarantee && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('bookings.details.guarantee', { defaultValue: 'Payment Guarantee' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {booking.guarantee.cardType && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Card Type</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{booking.guarantee.cardType}</p>
              </div>
            )}
            {booking.guarantee.cardHolderName && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Card Holder</p>
                <p className="text-sm font-medium text-gray-900">{booking.guarantee.cardHolderName}</p>
              </div>
            )}
            {booking.guarantee.maskedCardNumber && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Card Number</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{booking.guarantee.maskedCardNumber}</p>
              </div>
            )}
            {booking.guarantee.expirationDate && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Expiration Date</p>
                <p className="text-sm font-medium text-gray-900">{booking.guarantee.expirationDate}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Guest */}
      {booking.guest && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('bookings.details.guest', { defaultValue: 'Guest Information' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(booking.guest.firstName || booking.guest.lastName) && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.guest.firstName} {booking.guest.lastName}
                </p>
              </div>
            )}
            {booking.guest.email && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{booking.guest.email}</p>
              </div>
            )}
            {booking.guest.phone && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium text-gray-900">{booking.guest.phone}</p>
              </div>
            )}
            {booking.guest.address && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs text-gray-500 mb-1">Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.guest.address}, {booking.guest.city} {booking.guest.zip}, {booking.guest.country}
                </p>
              </div>
            )}
            {booking.guest.companyName && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Company</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.guest.companyName} ({booking.guest.companyNumberType}: {booking.guest.companyNumber})
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BookingDetailsPage;

