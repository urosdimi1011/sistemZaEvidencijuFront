export function formatDate(isoString) {
    const date = new Date(isoString);

    const day    = String(date.getDate()).padStart(2, "0");
    const month  = String(date.getMonth() + 1).padStart(2, "0");
    const year   = date.getFullYear();

    const hours   = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const time    = `${hours}:${minutes}:${seconds}`;

    return `${time} - ${day}/${month}/${year}`;
}