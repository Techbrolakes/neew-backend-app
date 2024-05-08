// Objective: Implement utility functions for the application

// =====================================================================================================
type searchUtilType = {
  search: string;
  searchArray: Array<string>;
};

export function searchUtil({ search, searchArray }: searchUtilType) {
  let searchQuery;

  if (search !== "undefined" && Object.keys(search).length > 0) {
    searchQuery = {
      $or: searchArray.map((item: string) => {
        return {
          [item]: new RegExp(search, "i"),
        };
      }),
    };
  }

  return searchQuery;
}

// =====================================================================================================
type paginationUtilType = {
  page: number;
  perpage: number;
  total: number;
};

export const paginationUtil = ({ page, perpage, total }: paginationUtilType) => {
  return {
    hasPrevious: page > 1, // Check if there is a previous page
    prevPage: page - 1, // Get the previous page number
    hasNext: page < Math.ceil(total / perpage), // Check if there is a next page
    next: page + 1, // Get the next page number
    currentPage: Number(page), // Get the current page number
    total: total, // Get the total number of records
    pageSize: perpage, // Get the page size
    lastPage: Math.ceil(total / perpage),
  };
};

// =====================================================================================================
type timeUtilType = {
  period: string;
  dateFrom: string | any;
  dateTo: string | any;
};

export async function timeUtil({ period, dateFrom, dateTo }: timeUtilType) {
  const myDateFrom = convertDate(dateFrom);
  const myDateTo = convertDate(dateTo);
  let timeFilter;

  const { start, end } = await getTodayTime(); // Get the start and end times for today
  const current_date = new Date(); // Get the current date

  if (period === "all" || "custom") {
    timeFilter = {
      createdAt: { $gte: new Date(myDateFrom), $lte: new Date(myDateTo) },
    };
  } else if (period === "today") {
    timeFilter = { createdAt: { $gte: start, $lte: end } };
  } else {
    const days = await subtractDays(Number(period.replace("days", "")));
    timeFilter = {
      createdAt: { $gte: new Date(days), $lte: new Date(current_date) },
    };
  }

  return timeFilter;
}

// =====================================================================================================

export function convertDate(date: any) {
  return new Date(date).toISOString();
}

// =====================================================================================================
function getTodayTime() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// =====================================================================================================
function subtractDays(days: number) {
  return new Date(new Date().setDate(new Date().getDate() - days));
}
