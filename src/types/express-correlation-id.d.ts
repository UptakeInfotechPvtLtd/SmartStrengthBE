declare module 'express-correlation-id' {
    import { RequestHandler, Request } from 'express';

    interface CorrelationId {
        (): string; // get current correlation ID
        middleware: () => RequestHandler; // express middleware
        getId: (req?: Request) => string; // get ID from a request
    }

    const correlator: CorrelationId;
    export = correlator;
}
