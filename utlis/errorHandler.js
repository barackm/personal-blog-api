const errorTypes = {
  unauthorized: 'unauthorized',
  notFound: 'notFound',
  internal: 'internal',
  validation: 'validation',
  forbidden: 'forbidden',
  default: 'default',
  serverError: 'serverError',
  emailNotVerified: 'emailNotVerified',
  invalidToken: 'invalidToken',
  noTokenProvided: 'noTokenProvided',
  alreadyExists: 'alreadyExists',
  alreadyExpired: 'alreadyExpired',
};

const formatError = (errorMessage, type) => {
  const cases = {
    [errorTypes.unauthorized]: {
      status: 401,
      message: errorMessage,
      type: errorTypes.unauthorized,
    },

    [errorTypes.notFound]: {
      status: 404,
      message: errorMessage,
      type: errorTypes.notFound,
    },

    [errorTypes.internal]: {
      status: 500,
      message: errorMessage,
      type: errorTypes.internal,
    },
    [errorTypes.validation]: {
      status: 400,
      message: errorMessage,
      type: errorTypes.validation,
    },
    [errorTypes.forbidden]: {
      status: 403,
      message: errorMessage,
      type: errorTypes.forbidden,
    },

    [errorTypes.emailNotVerified]: {
      status: 403,
      message: errorMessage,
      type: errorTypes.emailNotVerified,
    },
    [errorTypes.invalidToken]: {
      status: 403,
      message: errorMessage,
      type: errorTypes.invalidToken,
    },
    [errorTypes.alreadyExists]: {
      status: 409,
      message: errorMessage,
      type: errorTypes.alreadyExists,
    },
    [errorTypes.serverError]: {
      status: 500,
      message: errorMessage,
      type: errorTypes.serverError,
    },
    [errorTypes.noTokenProvided]: {
      status: 401,
      message: errorMessage,
      type: errorTypes.noTokenProvided,
    },
    [errorTypes.alreadyExpired]: {
      status: 401,
      message: errorMessage,
      type: errorTypes.alreadyExpired,
    },
    [errorTypes.userAlreadyExists]: {
      status: 409,
      message: errorMessage,
      type: errorTypes.userAlreadyExists,
    },
    [errorTypes.default]: {
      status: 500,
      message: errorMessage,
      type: errorTypes.default,
    },
  };

  return cases[type] || cases[errorTypes.default];
};

module.exports = {
  errorTypes,
  formatError,
};
