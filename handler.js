class GeneralError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }

    get statusCode() {
        return 500;
    }
}

class BadRequest extends GeneralError {
    constructor(message) {
        super();
        this.message = message ?? 'Bad Request';
    }

    get statusCode() {
        return 400;
    }
}

class NotFound extends GeneralError {
    constructor(message) {
        super();
        this.message = message ?? 'Not Found';
    }

    get statusCode() {
        return 404;
    }
}

class Unauthorized extends GeneralError {
    constructor(message) {
        super();
        this.message = message ?? 'Unauthorized';
    }

    get statusCode() {
        return 401;
    }
}

// eslint-disable-next-line no-unused-vars
const customExceptionHandler = (err, _req, resp, _next) => {
    resp.status(err.statusCode ?? 500);
    resp.set('Content-Type', 'text/plain');
    resp.send(err.message ?? 'Internal Server Error');
};

module.exports = {
    customExceptionHandler,
    GeneralError,
    BadRequest,
    Unauthorized,
    NotFound
};
