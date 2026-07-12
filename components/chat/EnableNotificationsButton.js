"use client";

import { useState } from "react";
import { Bell, BellOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    requestNotificationPermission,
} from "@/lib/browserNotification";

export default function EnableNotificationsButton() {
    const [loading, setLoading] = useState(false);

    const enableNotifications = async () => {
        try {
            setLoading(true);

            const permission =
                await requestNotificationPermission();

            if (permission === "granted") {
                toast.success(
                    "Browser notifications enabled"
                );

                return;
            }

            if (permission === "denied") {
                toast.error(
                    "Notifications are blocked in browser settings"
                );

                return;
            }

            toast.error(
                "Browser notifications are not supported"
            );
        } catch (error) {
            console.error(
                "ENABLE_NOTIFICATION_ERROR:",
                error
            );

            toast.error(
                "Notifications enable nahi ho sakin"
            );
        } finally {
            setLoading(false);
        }
    };

    const isDenied =
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "denied";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={enableNotifications}
            disabled={loading}
            title="Enable notifications"
        >
            {loading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : isDenied ? (
                <BellOff className="h-5 w-5 text-red-500" />
            ) : (
                <Bell className="h-5 w-5 text-slate-500" />
            )}
        </Button>
    );
}