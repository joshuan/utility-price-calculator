import { main } from "./main";
import { logger } from "./logger";
import { upload } from "./storage";
import { getEnv } from "./env";

export const handler = async function () {
    const year = new Date().getFullYear();

    logger.info(`Start process data for year ${year}`);

    const result = await main(year);

    await upload(
        { bucket: getEnv("S3_BUCKET"), path: `prices/${year}.csv` },
        result,
    );

    logger.info("Data uploaded to S3");

    return {
        statusCode: 201,
    };
};
