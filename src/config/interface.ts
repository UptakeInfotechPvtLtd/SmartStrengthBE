import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
export interface ISendEmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: {
        filename?: string;
        path?: string;
        content?: string | Buffer;
        encoding?: string;
        cid?: string;
    }[];
}

export interface IJwtPayload {
    userId: string;
    email: string;
    roleId?: string;
    roleName?: string;
    sessionId?: string;
}

export interface IImageResponse {
    id: string;
    url: string;
}

export interface ICreatedBy {
    id: string;
    name: string;
    email: string;
}

export interface IAuthenticatedRequest<
    P extends ParamsDictionary = ParamsDictionary,
    B = any,
    Q = any,
    TFile extends Express.Multer.File | undefined = Express.Multer.File,
> extends Request<P, any, B, Q> {
    user: {
        userId: string;
        email: string;
        roleId: string;
        roleName: string;
        sessionId?: string;
        iat: number;
        exp: number;
    };
    file?: TFile;
}
export interface IPaginationParams {
    page?: number | string;
    pageSize?: number | string;
}

export interface IPaginationResult {
    page: number;
    pageSize: number;
    offset: number;
    limit: number;
    where?: { [key: string]: any };
    order?: string;
    orderBy?: string;
}

export interface IBuildPaginationParams {
    totalResults: number;
    page: number;
    pageSize: number;
    offset: number;
}

export interface IPaginationMeta {
    totalResults: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
    pagingCounter: number;
}

// Dropdown Interfaces
export interface IDropDownResult {
    label: string;
    value: string;
}

export interface IDropDownResponse {
    roles: IDropDownResult[];
    eventTypes: IDropDownResult[];
}

export interface IEntityDropDownResult extends IDropDownResult {
    projectId?: string;
    towerId?: string;
    floorId?: string;
    status?: string;
}

// File Upload Interfaces
export interface IFileUploadResult {
    fileUrl: string;
    imageUrl: string;
    imagePath: string;
}

export interface IFileUploadInput {
    file?: Express.Multer.File;
    protocol: string;
    host: string;
}
