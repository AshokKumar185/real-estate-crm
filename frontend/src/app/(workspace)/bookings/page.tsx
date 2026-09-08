"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { BookingsView } from "../../../components/DataViews";
import { CreateBookingModal } from "../../../components/CreateBookingModal";
import { PageError, PageLoading } from "../../../components/PageStates";
import { PageHeader } from "../../../components/PageHeader";
import { getBookings } from "../../../lib/api";
import type { Booking } from "../../../lib/types";

export default function BookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const loadBookings = () => {
    if (token)
      getBookings(token)
        .then(setBookings)
        .catch((reason: Error) => setError(reason.message));
  };
  useEffect(loadBookings, [token]);
  return (
    <>
      {error ? (
        <PageError message={error} onRetry={loadBookings} />
      ) : !bookings ? (
        <PageLoading label="Loading bookings..." />
      ) : (
        <>
          <PageHeader eyebrow="CONVERSIONS" title="Property bookings" />
          <div className="page-actions crm-toolbar">
            <div className="toolbar-summary">
              <div className="summary-metric blue">
                <span className="metric-label">Confirmed</span>
                <strong>{bookings.length}</strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
              <div className="summary-metric coral ">
                <span className="metric-label">Units allocated</span>
                <strong>
                  {
                    new Set(bookings.map((booking) => booking.unit?.unitNumber))
                      .size
                  }
                </strong>
                <span className="metric-dot" aria-hidden="true" />
              </div>
            </div>
            <button
              className="outline-button"
              onClick={() => setShowCreate(true)}
            >
              + New booking
            </button>
          </div>
          <BookingsView bookings={bookings} />
          {showCreate && (
            <CreateBookingModal
              onClose={() => setShowCreate(false)}
              onCreated={loadBookings}
            />
          )}
        </>
      )}
    </>
  );
}
