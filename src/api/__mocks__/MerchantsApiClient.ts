import { StatusEnum } from '../generated/merchants/InitiativeDTO';
import { MerchantStatisticsDTO } from '../generated/merchants/MerchantStatisticsDTO';
import { StatusEnum as TransactionStatusEnum } from '../generated/merchants/MerchantTransactionDTO';
import { StatusEnum as TransactionProcessedStatusEnum } from '../generated/merchants/MerchantTransactionProcessedDTO';
import {
  AuthPaymentResponseDTO,
  StatusEnum as AuthPaymentStatusEnum,
} from '../generated/merchants/AuthPaymentResponseDTO';
import {
  MerchantDetailDTO,
  StatusEnum as MerchantStatusEnum,
} from '../generated/merchants/MerchantDetailDTO';

import { MerchantTransactionsListDTO } from '../generated/merchants/MerchantTransactionsListDTO';
import {
  StatusEnum as TransactionCreatedStatusEnum,
  TransactionResponse,
} from '../generated/merchants/TransactionResponse';
import { InitiativeDTOArray } from '../generated/merchants/InitiativeDTOArray';
import { MerchantTransactionsProcessedListDTO } from '../generated/merchants/MerchantTransactionsProcessedListDTO';

const startDate = new Date();
const endDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

export const mockedInitiativesList = [
  {
    enabled: true,
    endDate,
    initiativeId: '1234',
    initiativeName: 'Iniziativa mock 1234',
    organizationName: 'Organizzazione mock 1234',
    serviceId: '1234',
    startDate,
    status: StatusEnum.PUBLISHED,
  },
  {
    enabled: true,
    endDate,
    initiativeId: '5678',
    initiativeName: 'Iniziativa mock 5678',
    organizationName: 'Organizzazione mock 5678',
    serviceId: '5678',
    startDate,
    status: StatusEnum.CLOSED,
  },
];

export const mockedMerchantTransactionList = {
  content: [
    {
      trxCode: 'string',
      trxId: '123456789',
      fiscalCode: 'string',
      effectiveAmountCents: 1000,
      updateDate: startDate,
      status: TransactionStatusEnum.CREATED,
      trxDate: new Date(),
      trxExpirationSeconds: 300,
      qrcodePngUrl: 'example.com/image',
      qrcodeTxtUrl: 'example.com/image',
    },
    {
      trxCode: 'string',
      trxId: 'asdfggfhjkl',
      fiscalCode: 'string',
      effectiveAmountCents: 1303,
      updateDate: startDate,
      status: TransactionStatusEnum.AUTHORIZED,
      trxDate: new Date(),
      trxExpirationSeconds: 300,
      qrcodePngUrl: 'example.com/image',
      qrcodeTxtUrl: 'example.com/image',
    },
    {
      trxCode: 'string',
      trxId: 'asdfggf5678',
      fiscalCode: 'string',
      effectiveAmountCents: 1250,
      updateDate: startDate,
      status: TransactionStatusEnum.AUTHORIZATION_REQUESTED,
      trxDate: new Date(),
      trxExpirationSeconds: 300,
      qrcodePngUrl: 'example.com/image',
      qrcodeTxtUrl: 'example.com/image',
    },
    {
      trxCode: 'string',
      trxId: 'zxcvbnmzxcv',
      fiscalCode: 'string',
      effectiveAmountCents: 2322,
      updateDate: startDate,
      status: TransactionStatusEnum.IDENTIFIED,
      trxDate: new Date(),
      trxExpirationSeconds: 300,
      qrcodePngUrl: 'example.com/image',
      qrcodeTxtUrl: 'example.com/image',
    },
    {
      trxCode: 'string',
      trxId: '12345asdfgf',
      fiscalCode: 'string',
      effectiveAmountCents: 5000,
      updateDate: startDate,
      status: TransactionStatusEnum.REJECTED,
      trxDate: new Date(),
      trxExpirationSeconds: 300,
      qrcodePngUrl: 'example.com/image',
      qrcodeTxtUrl: 'example.com/image',
    },
  ],
  pageNo: 0,
  pageSize: 10,
  totalElements: 5,
  totalPages: 1,
};

export const mockedMerchantTransactionProcessedList = {
  content: [
    {
      trxCode: 'string',
      trxId: '12345asdfgf',
      fiscalCode: 'string',
      effectiveAmountCents: 5000,
      updateDate: startDate,
      status: TransactionProcessedStatusEnum.REWARDED,
      trxDate: new Date(),
      trxExpirationMinutes: 300,
      qrcodePngUrl: 'example.com/image',
      qrcodeTxtUrl: 'example.com/image',
    },
    {
      trxCode: 'string',
      trxId: '12345asdfgf',
      fiscalCode: 'string',
      effectiveAmountCents: 5000,
      updateDate: startDate,
      status: TransactionProcessedStatusEnum.CANCELLED,
      trxDate: new Date(),
      trxExpirationMinutes: 300,
      qrcodePngUrl: 'example.com/image',
      qrcodeTxtUrl: 'example.com/image',
    },
  ],
  pageNo: 0,
  pageSize: 10,
  totalElements: 4,
  totalPages: 1,
};

export const mockedMerchantInitiativeStatistics = {
  accruedCents: 100,
  amountCents: 250,
  refundedCents: 150,
};

export const mockedMerchantDetail = {
  businessName: 'Aaronne Travel',
  certifiedEmail: 'mail@aaronnetravel.com',
  creationDate: startDate,
  fiscalCode: '12345678',
  iban: 'IT12345678901111',
  initiativeId: '1234',
  initiativeName: 'Iniziativa mock 1234',
  legalOfficeAddress: 'Via roma 23',
  legalOfficeMunicipality: 'Roma',
  legalOfficeProvince: 'Lazio',
  legalOfficeZipCode: '123456',
  status: MerchantStatusEnum.UPLOADED,
  updateDate: endDate,
  vatNumber: '123456787',
};

export const transactionResponseMocked = {
  acquirerId: '12345',
  amountCents: 10000,
  amountCurrency: '€',
  id: '000001',
  idTrxAcquirer: '1234qwerty',
  idTrxIssuer: '1234qwerty',
  initiativeId: '1234',
  mcc: '',
  merchantId: '121212',
  status: TransactionCreatedStatusEnum.IDENTIFIED,
  trxCode: 'asdfdfgfdg',
  trxDate: new Date(),
  merchantFiscalCode: 'XXXDDD12ABBBB',
  residualAmountCents: 1,
  splitPayment: false,
  vat: 'ppppp',
  trxExpirationSeconds: 4320,
  qrcodePngUrl: 'example.com/image',
  qrcodeTxtUrl: 'example.com/image',
};

export const authPaymentBarCodeResponseMocked = {
  amountCents: 100,
  id: '12345',
  initiativeId: '234567',
  status: AuthPaymentStatusEnum.CREATED,
  trxCode: 'qwertyui',
};

export const MerchantsApiMocked = {
  getMerchantInitiativeList: async (): Promise<InitiativeDTOArray> =>
    new Promise((resolve) => resolve(mockedInitiativesList)),

  getMerchantTransactions: async (
    _initiativeId: string,
    _page: number,
    _fiscalCode?: string,
    _status?: string
  ): Promise<MerchantTransactionsListDTO> =>
    new Promise((resolve) => resolve(mockedMerchantTransactionList)),

  getMerchantTransactionsProcessed: async (
    _initiativeId: string,
    _page: number,
    _fiscalCode?: string,
    _status?: string
  ): Promise<MerchantTransactionsProcessedListDTO> =>
    new Promise((resolve) => resolve(mockedMerchantTransactionProcessedList)),

  getMerchantInitiativeStatistics: async (_initiativeId: string): Promise<MerchantStatisticsDTO> =>
    new Promise((resolve) => resolve(mockedMerchantInitiativeStatistics)),

  getMerchantDetail: async (_initiativeId: string): Promise<MerchantDetailDTO> =>
    new Promise((resolve) => resolve(mockedMerchantDetail)),

  deleteTransaction: async (_transactionId: string): Promise<void> =>
    new Promise((resolve) => resolve()),

  createTransaction: async (
    _amountCents: number,
    _idTrxAcquirer: string,
    _initiativeId: string,
    _mcc: string | undefined
  ): Promise<TransactionResponse> => new Promise((resolve) => resolve(transactionResponseMocked)),

  authPaymentBarCode: async (
    _trxCode: string,
    _amountCents: number,
    _idTrxAcquirer: string
  ): Promise<AuthPaymentResponseDTO> =>
    new Promise((resolve) => resolve(authPaymentBarCodeResponseMocked)),
};
