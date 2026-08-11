export class BaseResponseDto<T = any> {
    public success: boolean;
    public message: string;
    public data: T | null;

    constructor(message: string, data: T | null = null) {
        this.message = message;
        this.data = data;
        this.success = true;
    }
}
