/**
 * Test Event Storage Page
 * 
 * UI for testing the Channex event storage system.
 * This page allows you to test storing events with different configurations.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/Loader';
import { storeChannexEventMessage } from '@/services/channexEventStorage';
import {
  createFakeChannexEventObject,
  createFakeChannexEventObjectWithMultiplePayloads,
  createFakeChannexEventObjectWithAttachments,
  createFakeChannexEventObjectWithReviewScores,
} from '@/utils/fakeChannexEventData';
import type { StoredEventResult, ChannexEventType } from '@/features/event-messages/types';

const TestEventStorage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoredEventResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Default property ID for testing
  const [propertyId, setPropertyId] = useState<string>('105769f2-4942-4bba-955c-ff685a48a518');
  // Default booking ID for testing
  const bookingId = 'c92c7c01-6c5f-4c6d-a9e2-9c9e6cfa4567';
  // Event type selector
  const [eventType, setEventType] = useState<ChannexEventType>('message');
  
  const eventTypes: ChannexEventType[] = [
    'message',
    'ari',
    'booking',
    'booking_unmapped_room',
    'booking_unmapped_rate',
    'sync_error',
    'reservation_request',
    'review',
  ];

  const handleTest = async (testType: 'single' | 'multiple' | 'attachments' | 'review_scores') => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let eventObject;

      switch (testType) {
        case 'single':
          eventObject = createFakeChannexEventObject(
            propertyId || undefined,
            bookingId,
            eventType
          );
          break;
        case 'multiple':
          eventObject = createFakeChannexEventObjectWithMultiplePayloads(
            propertyId || undefined,
            3,
            bookingId,
            eventType
          );
          break;
        case 'attachments':
          // Attachments only work for message events
          if (eventType !== 'message') {
            setError('Attachments are only supported for message events. Switching to message event type.');
            eventObject = createFakeChannexEventObjectWithAttachments(
              propertyId || undefined,
              2,
              bookingId
            );
          } else {
            eventObject = createFakeChannexEventObjectWithAttachments(
              propertyId || undefined,
              2,
              bookingId
            );
          }
          break;
        case 'review_scores':
          // Review scores only work for review events
          if (eventType !== 'review') {
            setError('Review scores are only supported for review events. Switching to review event type.');
            eventObject = createFakeChannexEventObjectWithReviewScores(
              propertyId || undefined,
              6,
              bookingId
            );
          } else {
            eventObject = createFakeChannexEventObjectWithReviewScores(
              propertyId || undefined,
              6,
              bookingId
            );
          }
          break;
      }

      console.log('🧪 Testing with event object:', eventObject);
      const storedResult = await storeChannexEventMessage(eventObject);
      setResult(storedResult);
      console.log('✅ Storage result:', storedResult);
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Storage error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Event Storage</h1>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Property ID
            </label>
            <input
              type="text"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="105769f2-4942-4bba-955c-ff685a48a518"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Booking ID (Fixed for testing)
            </label>
            <input
              type="text"
              value={bookingId}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as ChannexEventType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the event type to test. Note: Attachments only work for message events. Review scores only work for review events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleTest('single')}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Single Payload'}
            </Button>

            <Button
              onClick={() => handleTest('multiple')}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Multiple Payloads'}
            </Button>

            <Button
              onClick={() => handleTest('attachments')}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test With Attachments'}
            </Button>

            <Button
              onClick={() => handleTest('review_scores')}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test With Review Scores'}
            </Button>
          </div>
        </div>
      </Card>

      {loading && (
        <Card>
          <div className="flex items-center justify-center py-8">
            <Loader label="Storing event..." />
          </div>
        </Card>
      )}

      {error && (
        <Card>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </Card>
      )}

      {result && (
        <Card>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-4">✅ Success!</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Event Message ID:</span>{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {result.eventMessage.id}
                </code>
              </div>
              <div>
                <span className="font-medium">Property ID:</span>{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {result.eventMessage.propertyId}
                </code>
              </div>
              <div>
                <span className="font-medium">Event Type:</span>{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {result.eventMessage.eventType}
                </code>
              </div>
              <div>
                <span className="font-medium">Payloads Stored:</span>{' '}
                <span className="font-semibold">{result.eventMessageDetails.length}</span>
              </div>
              <div>
                <span className="font-medium">Total Attachments:</span>{' '}
                <span className="font-semibold">
                  {result.eventMessageDetails.reduce(
                    (sum, p) => sum + p.attachments.length,
                    0
                  )}
                </span>
              </div>
              <div>
                <span className="font-medium">Total Review Scores:</span>{' '}
                <span className="font-semibold">
                  {result.eventMessageDetails.reduce(
                    (sum, p) => sum + p.reviewScores.length,
                    0
                  )}
                </span>
              </div>
              <div>
                <span className="font-medium">Total Review OTA Scores:</span>{' '}
                <span className="font-semibold">
                  {result.eventMessageDetails.reduce(
                    (sum, p) => sum + p.reviewOtaScores.length,
                    0
                  )}
                </span>
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                View Full Result (JSON)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>

            {result.channexFormat && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-900">
                  View Channex Format (Matches Input Structure)
                </summary>
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-600">
                    This format matches what Channex sends, making it easy to compare input vs stored data.
                  </p>
                  <pre className="p-3 bg-blue-50 border border-blue-200 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(result.channexFormat, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-2">
          <h3 className="font-semibold">Testing Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Optionally enter a Property ID (must be a valid UUID)</li>
            <li>Click one of the test buttons to generate and store fake data</li>
            <li>Check the console for detailed logs</li>
            <li>Verify the result shows successful storage</li>
            <li>Check your database to see the created records</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default TestEventStorage;

