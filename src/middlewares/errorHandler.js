const ApiError = require("../utils/ApiError");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined,
    });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: "Lỗi hệ thống, vui lòng thử lại sau" });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: "Không tìm thấy endpoint" });
}

module.exports = { errorHandler, notFoundHandler };
