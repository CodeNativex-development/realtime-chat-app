self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const conversationId =
        event.notification.data?.conversationId;

    const targetUrl = conversationId
        ? `/chat?conversationId=${conversationId}`
        : "/chat";

    event.waitUntil(
        clients
            .matchAll({
                type: "window",
                includeUncontrolled: true,
            })
            .then((windowClients) => {
                for (const client of windowClients) {
                    if ("focus" in client) {
                        client.postMessage({
                            type: "OPEN_CONVERSATION",
                            conversationId,
                        });

                        return client.focus();
                    }
                }

                return clients.openWindow(targetUrl);
            })
    );
});