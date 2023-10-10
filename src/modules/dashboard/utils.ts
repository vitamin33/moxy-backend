// Helper function to get the previous period's start and end dates
export function getPreviousPeriodDates(
  fromDate: Date,
  toDate: Date,
): { previousFromDate: Date; previousToDate: Date } {
  const timeDifferenceInMilliseconds = toDate.getTime() - fromDate.getTime();
  const previousFromDate = new Date(
    fromDate.getTime() - timeDifferenceInMilliseconds,
  );
  const previousToDate = new Date(
    toDate.getTime() - timeDifferenceInMilliseconds,
  );
  return { previousFromDate, previousToDate };
}

export function transformToTimeFrameCoordinates(
  coordinates: RangeData[],
  timef: string,
) {
  switch (timef) {
    case 'week':
      return compressToWeeks(coordinates);
    case 'month':
      return compressToMonths(coordinates);
    default:
      return coordinates;
  }
}

function compressToWeeks(coordinates: RangeData[]): RangeData[] {
  const compressedCoordinates: RangeData[] = [];
  let currentWeekNumber: number | null = null;
  let currentWeekOrders: number = 0;

  for (const coordinate of coordinates) {
    const weekRange = getWeekNumberWithRange(coordinate.fromDate);

    if (currentWeekNumber === null) {
      currentWeekNumber = weekRange.unitNumber;
      currentWeekOrders = coordinate.value;
    } else if (currentWeekNumber === weekRange.unitNumber) {
      currentWeekOrders += coordinate.value;
    } else {
      compressedCoordinates.push({
        fromDate: weekRange.fromDate,
        toDate: weekRange.toDate,
        key: `${currentWeekNumber}`,
        value: currentWeekOrders,
      });

      currentWeekNumber = weekRange.unitNumber;
      currentWeekOrders = coordinate.value;
    }
  }
  // Add the last week's data
  if (currentWeekNumber !== null) {
    const weekRange = getWeekNumberWithRange(
      coordinates[coordinates.length - 1].fromDate,
    );
    compressedCoordinates.push({
      fromDate: weekRange.fromDate,
      toDate: weekRange.toDate,
      key: `${currentWeekNumber}`,
      value: currentWeekOrders,
    });
  }
  return compressedCoordinates;
}

function compressToMonths(coordinates: RangeData[]): RangeData[] {
  const compressedCoordinates: RangeData[] = [];
  let currentMonth: string | null = null;
  let currentMonthOrders: number = 0;

  for (const coordinate of coordinates) {
    const month = getMonthWithRange(coordinate.fromDate);

    if (currentMonth === null) {
      currentMonth = month.unitNumber.toString();
      currentMonthOrders = coordinate.value;
    } else if (currentMonth === month.unitNumber.toString()) {
      currentMonthOrders += coordinate.value;
    } else {
      compressedCoordinates.push({
        fromDate: coordinate.fromDate,
        toDate: coordinate.toDate,
        key: currentMonth,
        value: currentMonthOrders,
      });

      currentMonth = month.unitNumber.toString();
      currentMonthOrders = coordinate.value;
    }
  }
  // Add the last month's data
  if (currentMonth !== null) {
    const month = getMonthWithRange(
      coordinates[coordinates.length - 1].fromDate,
    );
    compressedCoordinates.push({
      fromDate: month.fromDate,
      toDate: month.toDate,
      key: currentMonth,
      value: currentMonthOrders,
    });
  }
  return compressedCoordinates;
}

// Function to convert the date in format 'Y-m-d' to week number
function getWeekNumberWithRange(date: string): DateRange {
  const targetDate = new Date(date);
  const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1);
  const dayOfWeek = firstDayOfYear.getDay();
  const weekNumber =
    Math.floor(
      (targetDate.getTime() - firstDayOfYear.getTime() - dayOfWeek * 86400000) /
        604800000,
    ) + 1;

  // Calculate the start date (fromDate) of the week
  const fromDate = new Date(
    targetDate.getFullYear(),
    0,
    (weekNumber - 1) * 7 + 1,
  )
    .toISOString()
    .split('T')[0];

  // Calculate the end date (toDate) of the week
  const toDate = new Date(targetDate.getFullYear(), 0, (weekNumber - 1) * 7 + 7)
    .toISOString()
    .split('T')[0];

  return {
    unitNumber: weekNumber,
    fromDate,
    toDate,
  };
}

function getMonthWithRange(date: string): DateRange {
  const [year, month, _] = date.split('-');
  const monthNumber = parseInt(month);

  // Calculate the start date (fromDate) of the month
  const fromDate = new Date(`${year}-${month}-01`).toISOString().split('T')[0];

  // Calculate the end date (toDate) of the month
  const lastDay = new Date(parseInt(year), monthNumber, 0).getDate();
  const toDate = new Date(`${year}-${month}-${lastDay}`)
    .toISOString()
    .split('T')[0];

  return {
    unitNumber: monthNumber,
    fromDate,
    toDate,
  };
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
