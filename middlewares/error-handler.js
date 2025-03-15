const internalErrorMessage = 'Internal server error';

function globalErrorMiddleware(err, req, res, next) {
  let message = err?.message ?? '';
  let status = err?.status ?? 500;

  if (status >= 500) {
    message = internalErrorMessage;
  }

  if (!err instanceof LocalError) {
    message = internalErrorMessage;
    status = 500;
  }

  res.status(status).render('error', {
    status,
    message,
  });
}

function errorHandler(func) {
  return (req, res, next) => {
    try {
      func(req, res, next);
    } catch (error) {
      console.error(error);

      next(error);
    }
  };
}

class LocalError {
  status;
  message;

  constructor(status, message) {
    this.status = status;
    this.message = message;
  }
}

module.exports = {
  globalErrorMiddleware,
  errorHandler,
  LocalError,
};
