import { PaymentsService } from './payments.service';
import { CreateTransactionDto, TransactionQueryDto } from './dto/payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getSummary(): Promise<{
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
    findAll(query: TransactionQueryDto): Promise<import("../../database/interfaces/database.interface").PaginatedResult<any>>;
    findOne(id: string): Promise<any>;
    create(dto: CreateTransactionDto): Promise<any>;
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
