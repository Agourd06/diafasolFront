/**
 * Booking Wizard Context
 * 
 * Manages state for the multi-step booking creation wizard
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
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

  const resetWizard = () => {
    setState(initialState);
  };

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

