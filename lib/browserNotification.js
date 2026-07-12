export async function registerNotificationWorker() {
    if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator)
    ) {
        return null;
    }

    try {
        return await navigator.serviceWorker.register(
            "/notification-sw.js"
        );
    } catch (error) {
        console.error(
            "NOTIFICATION_WORKER_ERROR:",
            error
        );

        return null;
    }
}

export async function requestNotificationPermission() {
    if (
        typeof window === "undefined" ||
        !("Notification" in window)
    ) {
        return "unsupported";
    }

    if (Notification.permission === "granted") {
        await registerNotificationWorker();
        return "granted";
    }

    if (Notification.permission === "denied") {
        return "denied";
    }

    const permission =
        await Notification.requestPermission();

    if (permission === "granted") {
        await registerNotificationWorker();
    }

    return permission;
}

export async function showBrowserNotification({
    title,
    body,
    icon,
    conversationId,
}) {
    if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    const registration =
        await navigator.serviceWorker.ready;

    await registration.showNotification(title, {
        body,
        icon: icon || "/icon.svg",
        badge: "/icon.svg",
        tag: `conversation-${conversationId}`,
        renotify: true,
        data: {
            conversationId,
        },
    });
}