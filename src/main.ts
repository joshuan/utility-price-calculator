import { download } from "./storage";
import { getDay, getDayFromDate } from "./date";

type TType =
    | "WATER_COLD"
    | "WATER_HOT"
    | "ELECTRICITY_DAY"
    | "ELECTRICITY_NIGHT";

interface IResult {
    date: string;
    type: TType;
    cost: number;
}

interface ICsvRow {
    from: string;
    type: TType;
    cost: number;
}

async function getPrices(): Promise<string> {
    const data = await download({
        bucket: "utilities-statistics",
        path: `prices.csv`,
    });

    if (!data) {
        throw new Error(`Prices data was not found`);
    }

    return data;
}

const TIMEZONE = "+03:00";

function parseCsv(data: string): ICsvRow[] {
    const list = data
        .trim()
        .split("\n")
        .slice(1);
    
    return list.reduce((acc, item) => {
        const [fromStr, type, cost] = item.trim().split(";");

        acc.push({
            from: getDay(fromStr),
            type: type as TType,
            cost: Number(cost),
        });

        return acc;
    }, [] as ICsvRow[]);
}

function groupBy<T extends {[key: string]: any}>(list: T[], key: string): Record<string, T[]> {
    return list.reduce((acc, item) => {
        const value = item[key];

        if (!acc[value]) {
            acc[value] = [];
        }

        acc[value].push(item);

        return acc;
    }, {} as Record<string, T[]>);
}

function createDate(date: string): Date {
    return new Date(`${date}T00:00:00${TIMEZONE}`);
}

function calculatePrice(data: ICsvRow[], year: number): IResult[] {
    const result: IResult[] = [];

    const groupped = groupBy(data, 'type');

    for (const type in groupped) {
        const prices = groupped[type].map((item, index) => ({
            type: item.type,
            cost: item.cost,
            after: createDate(item.from),
            until: groupped[type][index + 1] ? createDate(groupped[type][index + 1].from) : createDate(`${year + 1}-01-01`),
        }));

        prices.forEach(({ after, until, type, cost }) => {
            if (until.getFullYear() < year) {
                return;
            }

            const currentDate = new Date(after);

            while (currentDate <= until) {
                const date = getDayFromDate(currentDate);
    
                if (date.split("-")[0] === `${year}`) {
                    result.push({
                        date,
                        type,
                        cost,
                    });
                }
    
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
    }

    return result;
}

export function print(list: IResult[]): string {
    return `date;type;cost\n` + list.map((item) => `${item.date};${item.type};${item.cost}`).join("\n");
}

export async function main(year: number): Promise<string> {
    const data = parseCsv(await getPrices());

    return print(calculatePrice(data, year));
}
