const MAX_LIMIT = 200;

export const parseListQuery = (query = {}, options = {}) => {
  const {
    defaultLimit = 50,
    maxLimit = MAX_LIMIT,
    defaultSort = { createdAt: -1 },
    allowedSortFields = [],
  } = options;

  const page = Math.max(Number(query.page) || 1, 1);
  const requestedLimit = Number(query.limit) || defaultLimit;
  const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);
  const skip = (page - 1) * limit;
  const search = String(query.q || "").trim();

  let sort = defaultSort;
  const sortBy = String(query.sortBy || "").trim();
  const sortOrder = String(query.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

  if (sortBy && allowedSortFields.includes(sortBy)) {
    sort = { [sortBy]: sortOrder };
  }

  return {
    page,
    limit,
    skip,
    search,
    sort,
    paginationRequested: Boolean(query.page || query.limit),
  };
};

export const buildRegexSearch = (search, fields = []) => {
  if (!search || !fields.length) {
    return {};
  }

  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

export const buildPaginatedResponse = ({ rows, total, page, limit }) => ({
  rows,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  },
});
