export const getMonthName = (monthNumber) => {
    const date = new Date()
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' })
}

export const getlastNDays = (n) => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < n; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().split("T")[0])
    }
    return dates.reverse();
}

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

        months.push(`${year}-${month}`); // e.g., "2025-07"
    }

    return months.reverse();
};