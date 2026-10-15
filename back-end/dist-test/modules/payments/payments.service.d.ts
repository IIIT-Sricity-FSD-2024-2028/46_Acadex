import { JsonRepository } from '../../database/json-repository';
import { CreateTransactionDto, TransactionQueryDto } from './dto/payment.dto';
export declare class PaymentsService {
    private readonly transactionsRepo;
    constructor(transactionsRepo: JsonRepository<any>);
    findAll(query: TransactionQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateTransactionDto): Promise<any>;
    getFinancialSummary(): Promise<{
        grossRevenue: number;
        monthlyRevenue: number;
        pendingPayouts: number;
        completedPayouts: number;
        totalRefunds: number;
        netProfit: number;
        currency: string;
        totalTransactions: number;
        recentTransactions: any[];
    }>;
    getReceipt(id: string): Promise<{
        receiptNumber: string;
        transactionId: any;
        date: any;
        issuedTo: any;
        course: any;
        amount: any;
        currency: string;
        status: any;
        paymentMethod: any;
        issuer: any;
        taxRegistration: string;
    }>;
}
