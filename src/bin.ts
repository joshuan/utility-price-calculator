import { saveFile } from "./fs";
import { logger } from "./logger";
import { main } from "./main";

(async () => {
    const year = process.env.CALCULATE_YEAR ? parseInt(process.env.CALCULATE_YEAR, 10) : new Date().getFullYear();

    logger.info(`Start process data for year ${year}`);

    const result = await main(year);

    saveFile(`build/result/${year}.csv`, result);

    logger.info(`Data saved to build/result/${year}.csv`);
})();
