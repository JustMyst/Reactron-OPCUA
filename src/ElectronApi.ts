export const electronApi = window && window.require

const { ipcRenderer } = window.require("electron");

export function initApi() {
    ipcRenderer.on("notification", (ev, data) => {
        const notification = new Notification(data.title, {
            body: data.body,
            silent: true,
            requireInteraction: false
        });

        if (data.timeoutS)
            setTimeout(notification.close.bind(notification), data.timeoutS * 1000); // Set Notification timeout to x seconds (x*1000)

    });
}
