"use client";

import { ReactElement, useEffect } from "react";

export const PendingInvitations = (): ReactElement => {
  // POST http://localhost:3000/api/pending-invitations

  useEffect(() => {
    const fetchInvitations = async () => {
      const response = await fetch("/api/pending-invitations");
      const data = await response.json();
      console.log(data);
    };

    fetchInvitations();
  }, []);

  return <div>Pending Invitations</div>;
}