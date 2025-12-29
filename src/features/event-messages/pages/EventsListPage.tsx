/**
 * Events List Page
 * 
 * Two-column layout:
 * - Left: Events list with filters (date and event type)
 * - Right: Event details (attachments for messages, scores for reviews)
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Loader from '@/components/Loader';
import { useEvents, useEvent } from '../hooks/useEvents';
import type { ChannexEventType } from '../types';

// Event type colors
const EVENT_TYPE_COLORS: Record<ChannexEventType, string> = {
  message: 'bg-blue-100 text-blue-800 border-blue-300',
  ari: 'bg-green-100 text-green-800 border-green-300',
  booking: 'bg-purple-100 text-purple-800 border-purple-300',
  booking_unmapped_room: 'bg-orange-100 text-orange-800 border-orange-300',
  booking_unmapped_rate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  sync_error: 'bg-red-100 text-red-800 border-red-300',
  reservation_request: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  review: 'bg-pink-100 text-pink-800 border-pink-300',
};

const EVENT_TYPES: ChannexEventType[] = [
  'message',
  'ari',
  'booking',
  'booking_unmapped_room',
  'booking_unmapped_rate',
  'sync_error',
  'reservation_request',
  'review',
];

const EventsListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch events with filters
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents({
    page,
    limit,
    eventType: eventTypeFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // Fetch selected event details
  const { data: selectedEvent, isLoading: isLoadingEvent } = useEvent(selectedEventId);

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeColor = (eventType: string): string => {
    return EVENT_TYPE_COLORS[eventType as ChannexEventType] || 'bg-gray-100 text-gray-800 border-gray-300';
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
              {t('events.title', { defaultValue: 'Events' })}
            </h1>
            <p className="text-xs text-slate-600">
              {t('events.subtitle', { defaultValue: 'View and manage all events' })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters - Compact */}
      <Card className="flex-shrink-0 py-2 px-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-0.5">
              {t('events.filter.eventType', { defaultValue: 'Event Type' })}
            </label>
            <select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('events.filter.allTypes', { defaultValue: 'All Types' })}</option>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-600 mb-0.5">
              {t('events.filter.date', { defaultValue: 'Date' })}
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Column: Events List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {t('events.list.title', { defaultValue: 'Events List' })}
              </h2>
              {eventsData && (
                <p className="text-xs text-slate-600 mt-0.5">
                  {t('events.list.count', {
                    defaultValue: '{{total}} events',
                    total: eventsData.meta.total,
                  })}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader label={t('common.loading', { defaultValue: 'Loading...' })} />
                </div>
              ) : !eventsData || eventsData.data.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-500">{t('events.list.empty', { defaultValue: 'No events found' })}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {eventsData.data.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event.id)}
                      className={`px-6 py-5 cursor-pointer transition-all duration-200 ${
                        selectedEventId === event.id
                          ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-3">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded border ${getEventTypeColor(
                                event.eventType
                              )}`}
                            >
                              {event.eventType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 break-all">
                            {t('events.list.propertyId', { defaultValue: 'Property' })}: {event.propertyId}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(event.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {eventsData && eventsData.meta.totalPages > 1 && (
              <div className="flex-shrink-0 p-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  {t('common.previous', { defaultValue: 'Previous' })}
                </button>
                <span className="text-sm text-slate-600">
                  {t('common.page', {
                    defaultValue: 'Page {{current}} of {{total}}',
                    current: page,
                    total: eventsData.meta.totalPages,
                  })}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(eventsData.meta.totalPages, p + 1))}
                  disabled={page === eventsData.meta.totalPages}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  {t('common.next', { defaultValue: 'Next' })}
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Event Details */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 px-4 py-2.5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                {t('events.details.title', { defaultValue: 'Event Details' })}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {!selectedEventId ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">
                    {t('events.details.selectEvent', { defaultValue: 'Select an event to view details' })}
                  </p>
                </div>
              ) : isLoadingEvent ? (
                <div className="flex items-center justify-center h-full">
                  <Loader label={t('common.loading', { defaultValue: 'Loading...' })} />
                </div>
              ) : !selectedEvent ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-500">
                    {t('events.details.notFound', { defaultValue: 'Event not found' })}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Event Basic Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      {t('events.details.basicInfo', { defaultValue: 'Basic Information' })}
                    </h3>
                    <div className="bg-slate-50 rounded-lg p-5 space-y-4 border border-slate-200">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-600">
                          {t('events.details.eventType', { defaultValue: 'Event Type' })}:
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded border ${getEventTypeColor(
                            selectedEvent.eventType
                          )}`}
                        >
                          {selectedEvent.eventType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex justify-between items-start py-1 border-t border-slate-300 pt-4">
                        <span className="text-sm text-slate-600">
                          {t('events.details.propertyId', { defaultValue: 'Property ID' })}:
                        </span>
                        <span className="text-sm font-mono text-slate-900 break-all text-right max-w-[65%]">{selectedEvent.propertyId}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-t border-slate-300 pt-4">
                        <span className="text-sm text-slate-600">
                          {t('events.details.createdAt', { defaultValue: 'Created At' })}:
                        </span>
                        <span className="text-sm text-slate-900">{formatDate(selectedEvent.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Event Details (from API response) */}
                  {(selectedEvent as any).details && (selectedEvent as any).details.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">
                        {t('events.details.details', { defaultValue: 'Details' })}
                      </h3>
                      {(selectedEvent as any).details.map((detail: any, index: number) => (
                        <div key={detail.id || index} className="bg-slate-50 rounded-lg p-5 mb-4 space-y-4 border border-slate-200">
                          {/* Message Event: Show message and attachments */}
                          {selectedEvent.eventType === 'message' && (
                            <>
                              {detail.message && (
                                <div className="border-t border-slate-300 pt-4">
                                  <span className="text-xs font-medium text-slate-600 block mb-2">
                                    {t('events.details.message', { defaultValue: 'Message' })}:
                                  </span>
                                  <p className="text-sm text-slate-900 mt-2 bg-white rounded-lg p-4 border border-slate-200 leading-relaxed">{detail.message}</p>
                                </div>
                              )}
                              {detail.sender && (
                                <div className="border-t border-slate-300 pt-4">
                                  <span className="text-xs font-medium text-slate-600 block mb-2">
                                    {t('events.details.sender', { defaultValue: 'Sender' })}:
                                  </span>
                                  <p className="text-sm text-slate-900 mt-2 bg-white rounded-lg p-3 border border-slate-200 inline-block">{detail.sender}</p>
                                </div>
                              )}
                              {detail.attachments && detail.attachments.length > 0 && (
                                <div className="border-t border-slate-300 pt-4">
                                  <span className="text-xs font-medium text-slate-600 mb-3 block">
                                    {t('events.details.attachments', { defaultValue: 'Attachments' })}:
                                  </span>
                                  <div className="space-y-3">
                                    {detail.attachments.map((attachment: any, attIndex: number) => (
                                      <div
                                        key={attachment.id || attIndex}
                                        className="bg-white rounded-lg p-4 border border-slate-200"
                                      >
                                        <p className="text-sm font-medium text-slate-900 mb-1">
                                          {attachment.filename || t('events.details.unnamedFile', { defaultValue: 'Unnamed file' })}
                                        </p>
                                        {attachment.type && (
                                          <p className="text-xs text-slate-500">Type: {attachment.type}</p>
                                        )}
                                        {attachment.size && (
                                          <p className="text-xs text-slate-500">
                                            Size: {(attachment.size / 1024).toFixed(2)} KB
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Review Event: Show scores */}
                          {selectedEvent.eventType === 'review' && (
                            <>
                              {detail.content && (
                                <div className="border-t border-slate-300 pt-4">
                                  <span className="text-xs font-medium text-slate-600 block mb-2">
                                    {t('events.details.content', { defaultValue: 'Content' })}:
                                  </span>
                                  <p className="text-sm text-slate-900 mt-2 bg-white rounded-lg p-4 border border-slate-200 leading-relaxed">{detail.content}</p>
                                </div>
                              )}
                              {detail.overallScore !== null && detail.overallScore !== undefined && (
                                <div className="border-t border-slate-300 pt-4">
                                  <span className="text-xs font-medium text-slate-600 block mb-2">
                                    {t('events.details.overallScore', { defaultValue: 'Overall Score' })}:
                                  </span>
                                  <p className="text-base font-bold text-slate-900 mt-2 bg-white rounded-lg p-4 border border-slate-200 inline-block">{detail.overallScore}/10</p>
                                </div>
                              )}
                              {detail.reviewScores && detail.reviewScores.length > 0 && (
                                <div className="border-t border-slate-300 pt-4">
                                  <span className="text-xs font-medium text-slate-600 mb-3 block">
                                    {t('events.details.scores', { defaultValue: 'Scores' })}:
                                  </span>
                                  <div className="space-y-3">
                                    {detail.reviewScores.map((score: any, scoreIndex: number) => (
                                      <div
                                        key={score.id || scoreIndex}
                                        className="bg-white rounded-lg p-4 border border-slate-200"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-slate-900 capitalize">
                                            {score.category}
                                          </span>
                                          <span className="text-base font-bold text-slate-900">{score.score}/10</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {detail.reviewOtaScores && detail.reviewOtaScores.length > 0 && (
                                <div className="border-t border-slate-300 pt-4">
                                  <span className="text-xs font-medium text-slate-600 mb-3 block">
                                    {t('events.details.otaScores', { defaultValue: 'OTA Scores' })}:
                                  </span>
                                  <div className="space-y-3">
                                    {detail.reviewOtaScores.map((score: any, scoreIndex: number) => (
                                      <div
                                        key={score.id || scoreIndex}
                                        className="bg-white rounded-lg p-4 border border-slate-200"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-slate-900 capitalize">
                                            {score.category}
                                          </span>
                                          <span className="text-base font-bold text-slate-900">{score.score}/10</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Other event types: Show all available fields */}
                          {selectedEvent.eventType !== 'message' && selectedEvent.eventType !== 'review' && (
                            <div className="space-y-4">
                              {Object.entries(detail)
                                .filter(([key]) => !['id', 'eventId', 'companyId', 'createdAt', 'updatedAt'].includes(key))
                                .map(([key, value], idx) => (
                                  <div key={key} className={idx > 0 ? 'border-t border-slate-300 pt-4' : ''}>
                                    <span className="text-xs font-medium text-slate-600 block mb-2 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                                    </span>
                                    <p className="text-sm text-slate-900 mt-2 bg-white rounded-lg p-3 border border-slate-200 break-all">
                                      {value !== null && value !== undefined ? String(value) : '-'}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventsListPage;

