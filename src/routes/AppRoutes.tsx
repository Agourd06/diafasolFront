import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import PropertyScopedRoute from "../components/PropertyScopedRoute";
import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";

// Lazy load all route components for code splitting
const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const ForgotPassword = lazy(() => import("../features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/pages/ResetPassword"));
const CompaniesList = lazy(() => import("../features/companies/pages/CompaniesList"));
const CreateCompany = lazy(() => import("../features/companies/pages/CreateCompany"));
const FacilitiesList = lazy(() => import("../features/facilities/pages/FacilitiesList"));
const CreateFacility = lazy(() => import("../features/facilities/pages/CreateFacility"));
const EditFacility = lazy(() => import("../features/facilities/pages/EditFacility"));
const PropertiesList = lazy(() => import("../features/properties/pages/PropertiesList"));
const CreateProperty = lazy(() => import("../features/properties/pages/CreateProperty"));
const EditProperty = lazy(() => import("../features/properties/pages/EditProperty"));
const CreatePropertyContent = lazy(() => import("../features/property-content/pages/CreatePropertyContent"));
const EditPropertyContent = lazy(() => import("../features/property-content/pages/EditPropertyContent"));
const CreatePropertyPhoto = lazy(() => import("../features/property-photos/pages/CreatePropertyPhoto"));
const EditPropertyPhoto = lazy(() => import("../features/property-photos/pages/EditPropertyPhoto"));
const CreatePropertyFacilityLink = lazy(() => import("../features/property-facilities/pages/CreatePropertyFacilityLink"));
const CreatePropertySettings = lazy(() => import("../features/property-settings/pages/CreatePropertySettings"));
const EditPropertySettings = lazy(() => import("../features/property-settings/pages/EditPropertySettings"));
const RoomTypesList = lazy(() => import("../features/room-types/pages/RoomTypesList"));
const CreateRoomType = lazy(() => import("../features/room-types/pages/CreateRoomType"));
const EditRoomType = lazy(() => import("../features/room-types/pages/EditRoomType"));
const RoomTypeDetail = lazy(() => import("../features/room-types/pages/RoomTypeDetail"));
const CreateRoomTypeAvailability = lazy(() => import("../features/room-type-availability/pages/CreateRoomTypeAvailability"));
const EditRoomTypeAvailability = lazy(() => import("../features/room-type-availability/pages/EditRoomTypeAvailability"));
const CreateRoomTypeContent = lazy(() => import("../features/room-type-content/pages/CreateRoomTypeContent"));
const EditRoomTypeContent = lazy(() => import("../features/room-type-content/pages/EditRoomTypeContent"));
const CreateRoomTypeFacilityLink = lazy(() => import("../features/room-type-facilities/pages/CreateRoomTypeFacilityLink"));
const CreateRoomTypePhoto = lazy(() => import("../features/room-type-photos/pages/CreateRoomTypePhoto"));
const EditRoomTypePhoto = lazy(() => import("../features/room-type-photos/pages/EditRoomTypePhoto"));
const RatePlansList = lazy(() => import("../features/rate-plans/pages/RatePlansList"));
const CreateRatePlan = lazy(() => import("../features/rate-plans/pages/CreateRatePlan"));
const EditRatePlan = lazy(() => import("../features/rate-plans/pages/EditRatePlan"));
const RatePlanDetail = lazy(() => import("../features/rate-plans/pages/RatePlanDetail"));
const CreateRatePlanOption = lazy(() => import("../features/rate-plan-options/pages/CreateRatePlanOption"));
const EditRatePlanOption = lazy(() => import("../features/rate-plan-options/pages/EditRatePlanOption"));
const CreateRatePlanRate = lazy(() => import("../features/rate-plan-rates/pages/CreateRatePlanRate"));
const EditRatePlanRate = lazy(() => import("../features/rate-plan-rates/pages/EditRatePlanRate"));
const CreateRatePlanDailyRule = lazy(() => import("../features/rate-plan-daily-rules/pages/CreateRatePlanDailyRule"));
const EditRatePlanDailyRule = lazy(() => import("../features/rate-plan-daily-rules/pages/EditRatePlanDailyRule"));
const CreateRatePlanPeriodRule = lazy(() => import("../features/rate-plan-period-rules/pages/CreateRatePlanPeriodRule"));
const EditRatePlanPeriodRule = lazy(() => import("../features/rate-plan-period-rules/pages/EditRatePlanPeriodRule"));
const CreateRatePlanAutoRateSetting = lazy(() => import("../features/rate-plan-auto-rate-settings/pages/CreateRatePlanAutoRateSetting"));
const EditRatePlanAutoRateSetting = lazy(() => import("../features/rate-plan-auto-rate-settings/pages/EditRatePlanAutoRateSetting"));
const TaxesList = lazy(() => import("../features/taxes/pages/TaxesList"));
const CreateTax = lazy(() => import("../features/taxes/pages/CreateTax"));
const EditTax = lazy(() => import("../features/taxes/pages/EditTax"));
const TaxSetsList = lazy(() => import("../features/tax-sets/pages/TaxSetsList"));
const CreateTaxSet = lazy(() => import("../features/tax-sets/pages/CreateTaxSet"));
const EditTaxSet = lazy(() => import("../features/tax-sets/pages/EditTaxSet"));
const TaxSetDetail = lazy(() => import("../features/tax-sets/pages/TaxSetDetail"));
const GroupsList = lazy(() => import("../features/groups/pages/GroupsList"));
const CreateGroup = lazy(() => import("../features/groups/pages/CreateGroup"));
const EditGroup = lazy(() => import("../features/groups/pages/EditGroup"));
const GroupDetail = lazy(() => import("../features/groups/pages/GroupDetail"));
const PropertyDetail = lazy(() => import("../features/properties/pages/PropertyDetail"));
const TaxApplicableDateRangesList = lazy(() => import("../features/tax-applicable-date-ranges/pages/TaxApplicableDateRangesList"));
const CreateTaxApplicableDateRange = lazy(() => import("../features/tax-applicable-date-ranges/pages/CreateTaxApplicableDateRange"));
const EditTaxApplicableDateRange = lazy(() => import("../features/tax-applicable-date-ranges/pages/EditTaxApplicableDateRange"));
const ReservationAdvancePoliciesList = lazy(() => import("../features/reservation-advance-policies/pages/ReservationAdvancePoliciesList"));
const CreateReservationAdvancePolicy = lazy(() => import("../features/reservation-advance-policies/pages/CreateReservationAdvancePolicy"));
const EditReservationAdvancePolicy = lazy(() => import("../features/reservation-advance-policies/pages/EditReservationAdvancePolicy"));
const ReservationAdvancePolicyDateRangesList = lazy(() => import("../features/reservation-advance-policy-date-ranges/pages/ReservationAdvancePolicyDateRangesList"));
const CreateReservationAdvancePolicyDateRange = lazy(() => import("../features/reservation-advance-policy-date-ranges/pages/CreateReservationAdvancePolicyDateRange"));
const EditReservationAdvancePolicyDateRange = lazy(() => import("../features/reservation-advance-policy-date-ranges/pages/EditReservationAdvancePolicyDateRange"));
const ReservationCancellationPoliciesList = lazy(() => import("../features/reservation-cancellation-policies/pages/ReservationCancellationPoliciesList"));
const CreateReservationCancellationPolicy = lazy(() => import("../features/reservation-cancellation-policies/pages/CreateReservationCancellationPolicy"));
const EditReservationCancellationPolicy = lazy(() => import("../features/reservation-cancellation-policies/pages/EditReservationCancellationPolicy"));
const ReservationCancellationPolicyDateRangesList = lazy(() => import("../features/reservation-cancellation-policy-date-ranges/pages/ReservationCancellationPolicyDateRangesList"));
const CreateReservationCancellationPolicyDateRange = lazy(() => import("../features/reservation-cancellation-policy-date-ranges/pages/CreateReservationCancellationPolicyDateRange"));
const EditReservationCancellationPolicyDateRange = lazy(() => import("../features/reservation-cancellation-policy-date-ranges/pages/EditReservationCancellationPolicyDateRange"));
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const PlanningPage = lazy(() => import("../features/planning/pages/PlanningPage"));
const EventsListPage = lazy(() => import("../features/event-messages/pages/EventsListPage"));
const TestEventStorage = lazy(() => import("../features/event-messages/pages/TestEventStorage"));
const BookingsListPage = lazy(() => import("../features/bookings/pages/BookingsListPage"));
const BookingDetailsPage = lazy(() => import("../features/bookings/pages/BookingDetailsPage"));
const CreateBookingPage = lazy(() => import("../features/bookings/pages/CreateBookingPage"));

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventsListPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/test-event-storage" element={<TestEventStorage />} />
          
          {/* Bookings Routes */}
          <Route path="/bookings" element={<BookingsListPage />} />
          <Route path="/bookings/create" element={<CreateBookingPage />} />
          <Route path="/bookings/:bookingId" element={<BookingDetailsPage />} />
        <Route path="/companies" element={<CompaniesList />} />
        <Route path="/companies/create" element={<CreateCompany />} />
        <Route path="/facilities" element={<FacilitiesList />} />
        <Route path="/facilities/create" element={<CreateFacility />} />
        <Route path="/facilities/edit/:id" element={<EditFacility />} />
        <Route path="/properties" element={<PropertiesList />} />
        <Route path="/properties/create" element={<CreateProperty />} />
        <Route path="/properties/edit/:id" element={<EditProperty />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        {/* Nested property routes - all under property context */}
        <Route path="/properties/:id/content" element={<PropertyDetail />} />
        <Route path="/properties/:id/content/create" element={<CreatePropertyContent />} />
        <Route path="/properties/:id/content/edit" element={<EditPropertyContent />} />
        <Route path="/properties/:id/photos" element={<PropertyDetail />} />
        <Route path="/properties/:id/photos/create" element={<CreatePropertyPhoto />} />
        <Route path="/properties/:id/photos/edit/:photoId" element={<EditPropertyPhoto />} />
        <Route path="/properties/:id/facilities" element={<PropertyDetail />} />
        <Route path="/properties/:id/facilities/create" element={<CreatePropertyFacilityLink />} />
        <Route path="/properties/:id/settings" element={<PropertyDetail />} />
        <Route path="/properties/:id/settings/create" element={<CreatePropertySettings />} />
        <Route path="/properties/:id/settings/edit" element={<EditPropertySettings />} />
        <Route path="/groups" element={<GroupsList />} />
        <Route path="/groups/create" element={<CreateGroup />} />
        <Route path="/groups/edit/:id" element={<EditGroup />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        {/* Room Types - List allowed without property, detail pages require property */}
        <Route path="/room-types" element={<RoomTypesList />} />
        <Route
          path="/room-types/create"
          element={
            <PropertyScopedRoute>
              <CreateRoomType />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/edit/:id"
          element={
            <PropertyScopedRoute>
              <EditRoomType />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id"
          element={
            <PropertyScopedRoute>
              <RoomTypeDetail />
            </PropertyScopedRoute>
          }
        />
        {/* Nested room type routes - all under room type context, require property */}
        <Route
          path="/room-types/:id/content"
          element={
            <PropertyScopedRoute>
              <RoomTypeDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/content/create"
          element={
            <PropertyScopedRoute>
              <CreateRoomTypeContent />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/content/edit"
          element={
            <PropertyScopedRoute>
              <EditRoomTypeContent />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/photos"
          element={
            <PropertyScopedRoute>
              <RoomTypeDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/photos/create"
          element={
            <PropertyScopedRoute>
              <CreateRoomTypePhoto />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/photos/edit/:photoId"
          element={
            <PropertyScopedRoute>
              <EditRoomTypePhoto />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/facilities"
          element={
            <PropertyScopedRoute>
              <RoomTypeDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/facilities/create"
          element={
            <PropertyScopedRoute>
              <CreateRoomTypeFacilityLink />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/availability"
          element={
            <PropertyScopedRoute>
              <RoomTypeDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/availability/create"
          element={
            <PropertyScopedRoute>
              <CreateRoomTypeAvailability />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/room-types/:id/availability/edit/:availabilityId"
          element={
            <PropertyScopedRoute>
              <EditRoomTypeAvailability />
            </PropertyScopedRoute>
          }
        />
        {/* Rate Plans - List allowed without property, detail pages require property */}
        <Route path="/rate-plans" element={<RatePlansList />} />
        <Route
          path="/rate-plans/create"
          element={
            <PropertyScopedRoute>
              <CreateRatePlan />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/edit/:id"
          element={
            <PropertyScopedRoute>
              <EditRatePlan />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id"
          element={
            <PropertyScopedRoute>
              <RatePlanDetail />
            </PropertyScopedRoute>
          }
        />
        {/* Nested rate plan routes - all under rate plan context, require property */}
        <Route
          path="/rate-plans/:id/options"
          element={
            <PropertyScopedRoute>
              <RatePlanDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/options/create"
          element={
            <PropertyScopedRoute>
              <CreateRatePlanOption />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/options/edit/:optionId"
          element={
            <PropertyScopedRoute>
              <EditRatePlanOption />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/rates"
          element={
            <PropertyScopedRoute>
              <RatePlanDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/rates/create"
          element={
            <PropertyScopedRoute>
              <CreateRatePlanRate />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/rates/edit/:rateId"
          element={
            <PropertyScopedRoute>
              <EditRatePlanRate />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/daily-rules"
          element={
            <PropertyScopedRoute>
              <RatePlanDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/daily-rules/create"
          element={
            <PropertyScopedRoute>
              <CreateRatePlanDailyRule />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/daily-rules/edit/:ruleId"
          element={
            <PropertyScopedRoute>
              <EditRatePlanDailyRule />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/period-rules"
          element={
            <PropertyScopedRoute>
              <RatePlanDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/period-rules/create"
          element={
            <PropertyScopedRoute>
              <CreateRatePlanPeriodRule />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/period-rules/edit/:ruleId"
          element={
            <PropertyScopedRoute>
              <EditRatePlanPeriodRule />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/auto-rate-settings"
          element={
            <PropertyScopedRoute>
              <RatePlanDetail />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/auto-rate-settings/create"
          element={
            <PropertyScopedRoute>
              <CreateRatePlanAutoRateSetting />
            </PropertyScopedRoute>
          }
        />
        <Route
          path="/rate-plans/:id/auto-rate-settings/edit/:settingId"
          element={
            <PropertyScopedRoute>
              <EditRatePlanAutoRateSetting />
            </PropertyScopedRoute>
          }
        />
        <Route path="/taxes" element={<TaxesList />} />
        <Route path="/taxes/create" element={<CreateTax />} />
        <Route path="/taxes/edit/:id" element={<EditTax />} />
        {/* Tax Sets */}
        <Route path="/tax-sets" element={<TaxSetsList />} />
        <Route path="/tax-sets/create" element={<CreateTaxSet />} />
        <Route path="/tax-sets/edit/:id" element={<EditTaxSet />} />
        <Route path="/tax-sets/:id" element={<TaxSetDetail />} />
        <Route path="/tax-sets/:id/taxes" element={<TaxSetDetail />} />
        <Route path="/tax-applicable-date-ranges" element={<TaxApplicableDateRangesList />} />
        <Route path="/tax-applicable-date-ranges/create" element={<CreateTaxApplicableDateRange />} />
        <Route path="/tax-applicable-date-ranges/edit/:id" element={<EditTaxApplicableDateRange />} />
        <Route path="/reservation-advance-policies" element={<ReservationAdvancePoliciesList />} />
        <Route path="/reservation-advance-policies/create" element={<CreateReservationAdvancePolicy />} />
        <Route path="/reservation-advance-policies/edit/:id" element={<EditReservationAdvancePolicy />} />
        <Route path="/reservation-advance-policy-date-ranges" element={<ReservationAdvancePolicyDateRangesList />} />
        <Route path="/reservation-advance-policy-date-ranges/create" element={<CreateReservationAdvancePolicyDateRange />} />
        <Route path="/reservation-advance-policy-date-ranges/edit/:id" element={<EditReservationAdvancePolicyDateRange />} />
        <Route path="/reservation-cancellation-policies" element={<ReservationCancellationPoliciesList />} />
        <Route path="/reservation-cancellation-policies/create" element={<CreateReservationCancellationPolicy />} />
        <Route path="/reservation-cancellation-policies/edit/:id" element={<EditReservationCancellationPolicy />} />
        <Route path="/reservation-cancellation-policy-date-ranges" element={<ReservationCancellationPolicyDateRangesList />} />
        <Route path="/reservation-cancellation-policy-date-ranges/create" element={<CreateReservationCancellationPolicyDateRange />} />
        <Route path="/reservation-cancellation-policy-date-ranges/edit/:id" element={<EditReservationCancellationPolicyDateRange />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
