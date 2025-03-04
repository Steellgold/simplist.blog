import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dayjs/locale/en");

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

dayjs.tz.setDefault("UTC");
dayjs.locale("en");

export const dayJS = dayjs;
export { Dayjs } from "dayjs";