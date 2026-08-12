export class ApiSuccessResponseDto<T> {
    success!: boolean;
    message!: string;
    data!: T;
    timestamp!: Date;

    constructor(data: T, message: string = 'Success') {
        this.success = true;
        this.message = message;
        this.data = data;
        this.timestamp = new Date();
    }
}

export class ApiErrorResponseDto {
    success!: boolean;
    message!: string;
    error!: string | object;
    timestamp!: Date;
    path?: string;

    constructor(message: string, error: string | object = 'Bad Request', path?: string) {
        this.success = false;
        this.message = message;
        this.error = error;
        this.timestamp = new Date();
        this.path = path;
    }
}

export class ApiPaginatedResponseDto<T> {
    success!: boolean;
    message!: string;
    data!: T[];
    pagination!: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    timestamp!: Date;

    constructor(
        data: T[],
        total: number,
        page: number,
        limit: number,
        message: string = 'Success',
    ) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.pagination = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
        };
        this.timestamp = new Date();
    }
}

export class ApiMessageResponseDto {
    success!: boolean;
    message!: string;
    timestamp!: Date;

    constructor(message: string, success: boolean = true) {
        this.success = success;
        this.message = message;
        this.timestamp = new Date();
    }
}
