import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useChannexProperty } from '@/hooks/useChannexProperty';
import { useChannexGroup } from '@/hooks/useChannexGroup';
import { useChannexRoomType } from '@/hooks/useChannexRoomType';
import {
  PropertyDetailsCard,
  TaxSetDetailsCard,
  RoomTypeDetailsCard,
  RatePlanDetailsCard,
  EmptyStateCard,
} from '../components';

/**
 * Dashboard Page
 * 
 * Main dashboard displaying property, tax set, and room type details cards.
 * Each card is a separate component with its own logic for maintainability.
 */
const Dashboard: React.FC = () => {
  const {
    groupId,
    propertyId,
    selectedProperty,
    selectedGroup,
    taxSetId,
    selectedTaxSet,
    roomTypeId,
    selectedRoomType,
    ratePlanId,
    selectedRatePlan,
  } = useAppContext();

  // Get the Channex group ID (needed when creating property in Channex)
  const { channexGroup } = useChannexGroup({
    groupId: selectedGroup?.id,
    groupTitle: selectedGroup?.title,
    enabled: !!selectedGroup,
  });

  // Check if property exists in Channex (needed for tax set, room type, and rate plan cards)
  const { 
    existsInChannex: propertyExistsInChannex, 
    channexProperty,
  } = useChannexProperty({
    property: selectedProperty,
    channexGroupId: channexGroup?.id,
    enabled: !!selectedProperty,
  });

  // Check if room type exists in Channex (needed for rate plan card)
  const {
    existsInChannex: roomTypeExistsInChannex,
    channexRoomType,
  } = useChannexRoomType({
    roomType: selectedRoomType,
    channexPropertyId: channexProperty?.id,
    enabled: !!selectedRoomType && !!channexProperty,
  });

  // Render cards when property is selected
  if (propertyId && selectedProperty) {
    // Mutual exclusion: Tax Set OR (Room Type + Rate Plan)
    // Show tax set only when no room type or rate plan is selected
    const shouldShowTaxSet = !!taxSetId && !!selectedTaxSet && !roomTypeId && !ratePlanId;
    // Show room type and rate plan only when no tax set is selected
    const shouldShowRoomType = !!roomTypeId && !!selectedRoomType && !taxSetId;
    const shouldShowRatePlan = !!ratePlanId && !!selectedRatePlan && !taxSetId;
    
    // Count available cards to determine grid layout
    const cardCount = [
      true, // Property card always shown
      shouldShowTaxSet,
      shouldShowRoomType,
      shouldShowRatePlan,
    ].filter(Boolean).length;

    // Determine grid columns based on card count
    const gridCols = cardCount === 1 ? 'grid-cols-1' : 
                     cardCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                     cardCount === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                     'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

    return (
      <div className="space-y-6">
        <div className={`grid ${gridCols} gap-6`}>
          <PropertyDetailsCard
            property={selectedProperty}
            propertyId={propertyId}
            group={selectedGroup}
          />

          {shouldShowTaxSet && (
            <TaxSetDetailsCard
              taxSet={selectedTaxSet}
              taxSetId={taxSetId}
              channexProperty={channexProperty}
              propertyExistsInChannex={propertyExistsInChannex}
            />
          )}

          {shouldShowRoomType && (
            <RoomTypeDetailsCard
              roomType={selectedRoomType}
              roomTypeId={roomTypeId}
              channexProperty={channexProperty}
              propertyExistsInChannex={propertyExistsInChannex}
            />
          )}

          {shouldShowRatePlan && (
            <RatePlanDetailsCard
              ratePlan={selectedRatePlan}
              ratePlanId={ratePlanId}
              channexProperty={channexProperty}
              channexRoomType={channexRoomType}
              propertyExistsInChannex={propertyExistsInChannex}
              roomTypeExistsInChannex={roomTypeExistsInChannex}
            />
          )}
        </div>
      </div>
    );
  }

  // Render empty state when group is selected but no property
  if (groupId && !propertyId) {
    return (
      <div className="space-y-6">
        <EmptyStateCard />
    </div>
  );
  }

  // Render nothing if no group is selected
  return null;
};

export default Dashboard;
