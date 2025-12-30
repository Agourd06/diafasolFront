/**
 * Booking Wizard Context
 * 
 * Manages state for the multi-step booking creation wizard
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { BookingWizardState } from '../types';

interface BookingWizardContextValue extends BookingWizardState {
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  setBooking: (booking: BookingWizardState['booking']) => void;
  setBookingId: (id: string) => void;
  addRoom: (room: BookingWizardState['rooms'][0]) => void;
  updateRoom: (index: number, room: BookingWizardState['rooms'][0]) => void;
  removeRoom: (index: number) => void;
  addRoomId: (tempId: string, id: string) => void;
  addRoomDays: (roomTempId: string, days: BookingWizardState['roomDays'][0]['days']) => void;
  addService: (service: BookingWizardState['services'][0]) => void;
  removeService: (index: number) => void;
  setGuarantee: (guarantee: BookingWizardState['guarantee']) => void;
  setGuest: (guest: BookingWizardState['guest']) => void;
  setRevision: (revision: BookingWizardState['revision']) => void;
  resetWizard: () => void;
  loadExistingBooking: (bookingData: any) => void;
  canProceed: () => boolean;
}

const BookingWizardContext = createContext<BookingWizardContextValue | undefined>(undefined);

const initialState: BookingWizardState = {
  currentStep: 1,
  completedSteps: [],
  booking: null,
  bookingId: null,
  rooms: [],
  roomIds: [],
  roomDays: [],
  services: [],
  guarantee: null,
  guest: null,
  revision: null,
};

export const BookingWizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BookingWizardState>(initialState);

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const markStepCompleted = (step: number) => {
    setState((prev) => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, step])],
    }));
  };

  const setBooking = (booking: BookingWizardState['booking']) => {
    setState((prev) => ({ ...prev, booking }));
  };

  const setBookingId = (id: string) => {
    setState((prev) => ({ ...prev, bookingId: id }));
  };

  const addRoom = (room: BookingWizardState['rooms'][0]) => {
    setState((prev) => ({ ...prev, rooms: [...prev.rooms, room] }));
  };

  const updateRoom = (index: number, room: BookingWizardState['rooms'][0]) => {
    setState((prev) => {
      const newRooms = [...prev.rooms];
      newRooms[index] = room;
      return { ...prev, rooms: newRooms };
    });
  };

  const removeRoom = (index: number) => {
    setState((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
  };

  const addRoomId = (tempId: string, id: string) => {
    setState((prev) => ({
      ...prev,
      roomIds: [...prev.roomIds, { tempId, id }],
    }));
  };

  const addRoomDays = (roomTempId: string, days: BookingWizardState['roomDays'][0]['days']) => {
    setState((prev) => ({
      ...prev,
      roomDays: [...prev.roomDays, { roomTempId, days }],
    }));
  };

  const addService = (service: BookingWizardState['services'][0]) => {
    setState((prev) => ({ ...prev, services: [...prev.services, service] }));
  };

  const removeService = (index: number) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const setGuarantee = (guarantee: BookingWizardState['guarantee']) => {
    setState((prev) => ({ ...prev, guarantee }));
  };

  const setGuest = (guest: BookingWizardState['guest']) => {
    setState((prev) => ({ ...prev, guest }));
  };

  const setRevision = (revision: BookingWizardState['revision']) => {
    setState((prev) => ({ ...prev, revision }));
  };

  const resetWizard = useCallback(() => {
    setState(initialState);
  }, []);

  const loadExistingBooking = useCallback((bookingData: any) => {
    console.log('📥 Loading existing booking into wizard:', bookingData);
    
    const completedSteps: number[] = [];
    let currentStep = 1;

    // Step 1: Load booking info
    if (bookingData.id) {
      completedSteps.push(1);
      currentStep = 2;
    }

    // Step 2: Load rooms
    // Include id in room object if it exists (for existing bookings)
    const rooms = bookingData.rooms?.map((room: any) => {
      const roomObj: any = {
        roomTypeId: room.roomTypeId,
        ratePlanId: room.ratePlanId,
        checkinDate: room.checkinDate,
        checkoutDate: room.checkoutDate,
        adults: room.adults,
        children: room.children,
        infants: room.infants,
        amount: room.amount,
        otaUniqueId: room.otaUniqueId,
      };
      // Include id if it exists and is not empty (check both id and room.id)
      const roomId = room.id || (room as any).roomId;
      if (roomId && String(roomId).trim() !== '' && String(roomId) !== 'undefined') {
        roomObj.id = String(roomId);
      }
      return roomObj;
    }) || [];

    // Create roomIds mapping for both existing and new rooms
    // Only include rooms that have valid IDs
    const roomIds = bookingData.rooms
      ?.map((room: any, index: number) => {
        // Check both id and roomId properties, and ensure it's not empty
        const roomId = room.id || (room as any).roomId;
        if (roomId && String(roomId).trim() !== '' && String(roomId) !== 'undefined') {
          return {
            tempId: `temp-${index}`,
            id: String(roomId), // This is the actual room ID from the database
          };
        }
        return null;
      })
      .filter((item: any) => item !== null) || [];
    
    console.log('🔍 Loading rooms into wizard:', {
      roomsCount: rooms.length,
      roomIdsCount: roomIds.length,
      rooms: rooms.map((r: any, i: number) => ({
        index: i,
        hasId: !!(r as any).id,
        id: (r as any).id,
        roomTypeId: r.roomTypeId,
      })),
      roomIds,
    });

    if (rooms.length > 0) {
      completedSteps.push(2);
      currentStep = 3;
    }

    // Step 3: Load room days
    const roomDays = bookingData.rooms?.map((room: any, index: number) => ({
      roomTempId: `temp-${index}`,
      days: room.days?.map((day: any) => ({
        date: day.date,
        amount: day.amount,
      })) || [],
    })) || [];

    if (roomDays.length > 0 && roomDays.every((rd: any) => rd.days.length > 0)) {
      completedSteps.push(3);
      currentStep = 4;
    }

    // Step 4: Load services
    const services = bookingData.services?.map((service: any) => ({
      type: service.type,
      totalPrice: service.totalPrice,
      pricePerUnit: service.pricePerUnit,
      priceMode: service.priceMode,
      persons: service.persons,
      nights: service.nights,
      name: service.name,
    })) || [];

    if (services.length > 0) {
      completedSteps.push(4);
      currentStep = 5;
    }

    // Step 5: Load guarantee (only one guarantee per booking)
    const guarantee = bookingData.guarantees?.[0] ? {
      ...(bookingData.guarantees[0].id && { id: bookingData.guarantees[0].id }), // Include ID if it exists
      bookingId: bookingData.id,
      cardType: bookingData.guarantees[0].cardType,
      cardHolderName: bookingData.guarantees[0].cardHolderName,
      maskedCardNumber: bookingData.guarantees[0].maskedCardNumber,
      expirationDate: bookingData.guarantees[0].expirationDate,
    } : null;

    if (guarantee) {
      completedSteps.push(5);
      currentStep = 6;
    }

    // Step 6: Load guest
    const guest = bookingData.guests?.[0] ? {
      bookingId: bookingData.id,
      name: bookingData.guests[0].name,
      surname: bookingData.guests[0].surname,
      mail: bookingData.guests[0].mail,
      phone: bookingData.guests[0].phone,
      address: bookingData.guests[0].address,
      city: bookingData.guests[0].city,
      zip: bookingData.guests[0].zip,
      country: bookingData.guests[0].country,
      language: bookingData.guests[0].language,
      companyTitle: bookingData.guests[0].companyTitle,
      companyNumber: bookingData.guests[0].companyNumber,
      companyNumberType: bookingData.guests[0].companyNumberType,
      companyType: bookingData.guests[0].companyType,
    } : null;

    if (guest) {
      completedSteps.push(6);
      currentStep = 7;
    }

    // Set the state with loaded data
    setState({
      currentStep,
      completedSteps,
      bookingId: bookingData.id,
      booking: {
        propertyId: bookingData.propertyId,
        status: bookingData.status,
        arrivalDate: bookingData.arrivalDate,
        departureDate: bookingData.departureDate,
        amount: bookingData.amount,
        currency: bookingData.currency,
        uniqueId: bookingData.uniqueId,
        otaReservationCode: bookingData.otaReservationCode,
        otaName: bookingData.otaName,
        arrivalHour: bookingData.arrivalHour,
        otaCommission: bookingData.otaCommission,
        notes: bookingData.notes,
        occupancy: bookingData.occupancy,
      },
      rooms,
      roomIds,
      roomDays,
      services,
      guarantee,
      guest,
      revision: null,
    });

    console.log('✅ Booking loaded, starting at step:', currentStep);
  }, []);

  const canProceed = (): boolean => {
    const { currentStep, booking, bookingId, rooms } = state;
    
    switch (currentStep) {
      case 1: // Booking info must be filled
        return !!booking && !!bookingId;
      case 2: // At least one room must be added
        return rooms.length > 0;
      case 3: // Room days must be set for all rooms
        return rooms.every((_, index) => 
          state.roomDays.some((rd) => rd.roomTempId === `temp-${index}`)
        );
      default:
        return true; // Steps 4-7 are optional
    }
  };

  const value: BookingWizardContextValue = {
    ...state,
    setCurrentStep,
    markStepCompleted,
    setBooking,
    setBookingId,
    addRoom,
    updateRoom,
    removeRoom,
    addRoomId,
    addRoomDays,
    addService,
    removeService,
    setGuarantee,
    setGuest,
    setRevision,
    resetWizard,
    loadExistingBooking,
    canProceed,
  };

  return (
    <BookingWizardContext.Provider value={value}>
      {children}
    </BookingWizardContext.Provider>
  );
};

export const useBookingWizard = () => {
  const context = useContext(BookingWizardContext);
  if (!context) {
    throw new Error('useBookingWizard must be used within BookingWizardProvider');
  }
  return context;
};

