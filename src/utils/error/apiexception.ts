// src/helper/httpExceptions.ts
import { messages } from '../../lang/api-messages';

export class HttpException extends Error {
    status: number;
    code: string;

    constructor(status: number, message: string, code = 'HttpException') {
        super(message);
        this.status = status;
        this.code = code;
    }

    getStatus() {
        return this.status;
    }
}

// 400
export class BadRequestException extends HttpException {
    constructor(message = messages.badRequest) {
        super(400, message);
    }
}

// 401
export class UnauthorizedException extends HttpException {
    constructor(message = messages.unauthorized) {
        super(401, message);
    }
}

// 403
export class ForbiddenException extends HttpException {
    constructor(message = messages.forbidden) {
        super(403, message);
    }
}

// 404
export class NotFoundException extends HttpException {
    constructor(message = messages.notFound) {
        super(404, message);
    }
}

// 409
export class ConflictException extends HttpException {
    constructor(message = messages.conflict) {
        super(409, message);
    }
}
