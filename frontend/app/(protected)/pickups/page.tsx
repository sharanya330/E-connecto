"use client";

import Pickups from "@/components/pickups";
import PickupModal from "@/components/modals/pickup-modal";
import { useState } from "react";

export default function PickupsPage() {
    const [showPickupModal, setShowPickupModal] = useState(false);

    return (
        <>
            <Pickups onSchedulePickup={() => setShowPickupModal(true)} />
            <PickupModal open={showPickupModal} onOpenChange={setShowPickupModal} />
        </>
    );
}
