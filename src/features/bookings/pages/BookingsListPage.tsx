/**
 * Bookings List Page
 * 
 * Main bookings list with filters and search
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks';
import { formatCurrency } from '@/constants/currencies';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/Loader';
import { STATUS_COLORS } from '../types';
import type { BookingStatus } from '../types';

const BookingsListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: bookingsData, isLoading } = useBookings({
    page,
    limit,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const getStatusColor = (status: BookingStatus) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (bookingId: string) => {
    navigate(`/bookings/${bookingId}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] -m-6 p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            title={t('common.backToDashboard', { defaultValue: 'Back to Dashboard' })}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{t('common.backToDashboard', { defaultValue: 'Back to Dashboard' })}</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {t('bookings.title', { defaultValue: 'Bookings' })}
            </h1>
            <p className="text-xs text-slate-600">
              {t('bookings.subtitle', { defaultValue: 'Manage all your bookings' })}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/bookings/create')}>
          {t('bookings.create.button', { defaultValue: '+ New Booking' })}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-3 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('bookings.filters.status', { defaultValue: 'Status' })}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as BookingStatus | '');
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {(['new', 'pending', 'confirmed', 'modified', 'cancelled', 'checked_in', 'checked_out'] as const).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('bookings.filters.search', { defaultValue: 'Search' })}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, OTA name, reservation code..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('bookings.list.title', { defaultValue: 'All Bookings' })}
            </h2>
            {bookingsData && (
              <p className="text-xs text-slate-600 mt-0.5">
                {bookingsData.meta.total} {t('bookings.list.total', { defaultValue: 'bookings' })}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader label={t('common.loading', { defaultValue: 'Loading...' })} />
              </div>
            ) : !bookingsData || bookingsData.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-slate-500 mb-4">{t('bookings.list.empty', { defaultValue: 'No bookings found' })}</p>
                <Button onClick={() => navigate('/bookings/create')}>
                  {t('bookings.create.button', { defaultValue: 'Create First Booking' })}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {bookingsData.data.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => handleRowClick(booking.id)}
                    className="px-6 py-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(booking.status)}`}
                          >
                            {booking.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          {booking.otaName && (
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              {booking.otaName}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-500">Dates</p>
                            <p className="font-medium text-slate-900">
                              {formatDate(booking.arrivalDate)} - {formatDate(booking.departureDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Amount</p>
                            <p className="font-medium text-slate-900">
                              {formatCurrency(booking.amount, booking.currency || 'EUR')}
                            </p>
                          </div>
                          {booking.uniqueId && (
                            <div>
                              <p className="text-xs text-slate-500">Unique ID</p>
                              <p className="font-medium text-slate-900 truncate">{booking.uniqueId}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-slate-500">Created</p>
                            <p className="text-slate-700">{formatDate(booking.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {bookingsData && bookingsData.meta.totalPages > 1 && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                {t('common.previous', { defaultValue: 'Previous' })}
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {bookingsData.meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(bookingsData.meta.totalPages, p + 1))}
                disabled={page === bookingsData.meta.totalPages}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                {t('common.next', { defaultValue: 'Next' })}
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookingsListPage;

