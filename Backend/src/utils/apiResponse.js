function normalizeArgs(resOrStatus, maybePayload, maybeMessage) {
  if (typeof resOrStatus === "object" && resOrStatus !== null && typeof resOrStatus.status === "function") {
    const res = resOrStatus;
    const payload = maybePayload || {};
    const body = {
      success: payload.success ?? true,
      message: payload.message ?? "OK",
      data: payload.data ?? null,
      meta: payload.meta ?? null,
    };

    return res.status(payload.status ?? 200).json(body);
  }

  return {
    status: resOrStatus ?? 200,
    success: (resOrStatus ?? 200) < 400,
    data: maybePayload ?? null,
    message: maybeMessage ?? "OK",
    meta: null,
  };
}

function ApiResponse(status = 200, data = null, message = "OK", meta = null) {
  return {
    status,
    success: status < 400,
    message,
    data,
    meta,
  };
}

function apiResponse(resOrStatus, maybePayload, maybeMessage) {
  return normalizeArgs(resOrStatus, maybePayload, maybeMessage);
}

module.exports = apiResponse;
module.exports.apiResponse = apiResponse;
module.exports.ApiResponse = ApiResponse;
