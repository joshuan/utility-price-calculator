const DEFAULT_TIME_OFFSET = 3;

export function getDay(date: string): string {
    const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = date.match(datePattern);

    if (match) {
        const [_, day, month, year] = match;

        return `${year}-${month}-${day}`;
    } else {
        throw new Error("Invalid date format. Expected format: DD.MM.YYYY", { cause: date });
    }
}

export function getDayFromDate(date: Date): string {
    const d = new Date(date);

    d.setUTCHours(d.getUTCHours() + DEFAULT_TIME_OFFSET);

    return d.toISOString().split("T")[0];
}