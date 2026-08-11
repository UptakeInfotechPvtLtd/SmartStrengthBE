import { v4 as uuidv4 } from 'uuid';
import {
    IBuildPaginationParams,
    IPaginationMeta,
    IPaginationParams,
    IPaginationResult,
} from '../config';

export function generateOtp(length: number) {
    const characters = '0123456789';

    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

export const getOffset = ({
    page = 1,
    pageSize = 10,
}: IPaginationParams = {}): IPaginationResult => {
    const parsedPage = Number(page) || 1;
    const parsedPageSize = Number(pageSize) || 10;

    return {
        page: parsedPage,
        pageSize: parsedPageSize,
        offset: (parsedPage - 1) * parsedPageSize,
        limit: parsedPageSize,
    };
};

export const buildPagination = ({
    totalResults,
    page,
    pageSize,
    offset,
}: IBuildPaginationParams): IPaginationMeta => {
    const safePage = Math.max(1, page);
    const safePageSize = Math.max(1, pageSize);

    const totalPages = Math.ceil(totalResults / safePageSize) || 1;

    return {
        totalResults,
        pageSize: safePageSize,
        currentPage: safePage,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages,
        prevPage: safePage > 1 ? safePage - 1 : null,
        nextPage: safePage < totalPages ? safePage + 1 : null,
        pagingCounter: offset + 1,
    };
};

export function generateUUID(): string {
    return uuidv4();
}

export function generateTeamId(): string {
    return `Team${Date.now()}`;
}

export const generateMatchId = (): string => {
    const timestamp = Date.now(); // current timestamp
    const randomSixDigit = Math.floor(100000 + Math.random() * 900000); // 6 digit random

    return `match_${timestamp}_${randomSixDigit}`;
};
