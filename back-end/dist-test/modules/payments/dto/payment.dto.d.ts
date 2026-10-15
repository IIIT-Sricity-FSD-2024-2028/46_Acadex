import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
export declare enum TransactionType {
    PAYMENT = "Payment",
    PAYOUT = "Payout",
    REFUND = "Refund"
}
export declare enum TransactionStatus {
    COMPLETED = "Completed",
    PENDING = "Pending",
    FAILED = "Failed"
}
export declare class CreateTransactionDto {
    type: TransactionType;
    payer: string;
    course: string;
    amount: number;
    method?: string;
    status?: TransactionStatus;
}
export declare class TransactionQueryDto extends PaginationQueryDto {
    type?: TransactionType;
    status?: TransactionStatus;
}
