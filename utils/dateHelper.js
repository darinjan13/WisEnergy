import { formatInTimeZone, toZonedTime } from "date-fns-tz";
const timeZone = "Asia/Manila"
export const getMonthName = (monthNumber, format = 'long') => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: format });
};

export const getLastNDays = (n) => {
    const dates = [];
    const today = new Date();
    const zonedToday = toZonedTime(today, timeZone);

    for (let i = 0; i < n; i++) {
        const pastDate = new Date(zonedToday);
        pastDate.setDate(zonedToday.getDate() - i);

        const formatted = formatInTimeZone(pastDate, timeZone, "yyyy-MM-dd");
        dates.push(formatted);
    }

    return dates.reverse();
};

export const getLastNWeeks = (n) => {
    const weeks = []
    const today = new Date();

    for (let i = 0; i < n; i++) {
        const end = new Date(today);
        end.setDate(today.getDate() - i * 7);
        const start = new Date(end);
        start.setDate(end.getDate() - 6)

        weeks.push({
            start: start.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0]
        })
    }

    return weeks.reverse();
}
export const getLastNMonths = (n) => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < n; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");

        months.push(`${year}-${month}`);
    }

    return months.reverse();
};

export const timeAgo = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay} days ago`;

    // fallback date display
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};