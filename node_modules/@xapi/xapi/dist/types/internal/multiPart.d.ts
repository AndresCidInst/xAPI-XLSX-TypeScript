import { StatementResponseWithAttachments, StatementsResponseWithAttachments, Statement } from "../XAPI";
export interface MultiPart {
    header: {
        "Content-Type": string;
    };
    blob: Blob;
}
export declare function parseMultiPart(data: string): StatementResponseWithAttachments | StatementsResponseWithAttachments;
export declare function createMultiPart(statementish: Statement | Statement[], attachments: ArrayBuffer[]): MultiPart;
