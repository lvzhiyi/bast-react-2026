import { formatDateTime, generateCode } from '@repo/utils';
import type {
  CreateOrderPayload,
  CreateProductPayload,
  CreateSettlementPayload,
  OrderItem,
  OrderQueryParams,
  ProductItem,
  ProductQueryParams,
  SettlementItem,
  SettlementQueryParams,
  TenantItem,
  TenantQueryParams,
  UpdateOrderPayload,
  UpdateTenantStatusPayload,
} from './schemas';

let mockTenants: TenantItem[] = [
  {
    id: 'tenant-1',
    name: '星辰科技有限公司',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    partnerId: 'partner-1',
    partnerName: '华东金牌渠道商',
    commissionRate: 0.15,
    monthlyGmv: 128000,
    createdAt: '2026-08-12 09:30:00',
  },
  {
    id: 'tenant-2',
    name: '远航国际物流',
    plan: 'PRO',
    status: 'ACTIVE',
    partnerId: 'partner-1',
    partnerName: '华东金牌渠道商',
    commissionRate: 0.12,
    monthlyGmv: 64500,
    createdAt: '2026-09-04 14:15:00',
  },
  {
    id: 'tenant-3',
    name: '云端智造研究院',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    commissionRate: 0,
    monthlyGmv: 92000,
    createdAt: '2026-10-18 11:00:00',
  },
  {
    id: 'tenant-4',
    name: '极光零售集团',
    plan: 'STANDARD',
    status: 'PENDING_REVIEW',
    partnerId: 'partner-1',
    partnerName: '华东金牌渠道商',
    commissionRate: 0.12,
    monthlyGmv: 18600,
    createdAt: '2026-11-21 16:45:00',
  },
];

let mockOrders: OrderItem[] = [
  {
    id: 'ord-1',
    orderNo: 'ORD-2026001',
    tenantId: 'tenant-1',
    tenantName: '星辰科技有限公司',
    customerName: '华润数科采购中心',
    amount: 28800,
    status: 'PAID',
    remark: '年度企业版 SaaS 席位续费',
    createdAt: '2026-11-20 10:30:00',
  },
  {
    id: 'ord-2',
    orderNo: 'ORD-2026002',
    tenantId: 'tenant-1',
    tenantName: '星辰科技有限公司',
    customerName: '东海智能制造',
    amount: 12400,
    status: 'PENDING',
    remark: '待客户对公打款确认',
    createdAt: '2026-11-21 09:15:00',
  },
  {
    id: 'ord-3',
    orderNo: 'ORD-2026003',
    tenantId: 'tenant-2',
    tenantName: '远航国际物流',
    customerName: '顺泰供应链管理',
    amount: 18500,
    status: 'PAID',
    remark: '跨境仓储 ERP 模块扩容',
    createdAt: '2026-11-21 14:20:00',
  },
  {
    id: 'ord-4',
    orderNo: 'ORD-2026004',
    tenantId: 'tenant-3',
    tenantName: '云端智造研究院',
    customerName: '中科精密仪器厂',
    amount: 46000,
    status: 'PAID',
    remark: '私有化集群算力接入包',
    createdAt: '2026-11-21 17:40:00',
  },
  {
    id: 'ord-5',
    orderNo: 'ORD-2026005',
    tenantId: 'tenant-1',
    tenantName: '星辰科技有限公司',
    customerName: '新纪元医疗器械',
    amount: 8600,
    status: 'PENDING',
    remark: 'BI 报表插件增购',
    createdAt: '2026-11-22 08:50:00',
  },
  {
    id: 'ord-6',
    orderNo: 'ORD-2026006',
    tenantId: 'tenant-2',
    tenantName: '远航国际物流',
    customerName: '蓝海跨境电商',
    amount: 6200,
    status: 'CANCELLED',
    remark: '客户变更采购方案',
    createdAt: '2026-11-22 09:10:00',
  },
];

let mockProducts: ProductItem[] = [
  {
    id: 'prod-1',
    sku: 'SKU-2026101',
    tenantId: 'tenant-1',
    name: '企业协同标准版（50席位）',
    category: 'SaaS 订阅',
    price: 12800,
    stock: 99,
    status: 'ON_SALE',
    updatedAt: '2026-11-18 10:00:00',
  },
  {
    id: 'prod-2',
    sku: 'SKU-2026102',
    tenantId: 'tenant-1',
    name: 'BI 经营分析增强包',
    category: '增值插件',
    price: 8600,
    stock: 42,
    status: 'ON_SALE',
    updatedAt: '2026-11-19 15:20:00',
  },
  {
    id: 'prod-3',
    sku: 'SKU-2026103',
    tenantId: 'tenant-1',
    name: '专属数据大屏定制实施',
    category: '实施服务',
    price: 24000,
    stock: 6,
    status: 'ON_SALE',
    updatedAt: '2026-11-20 11:45:00',
  },
  {
    id: 'prod-4',
    sku: 'SKU-2026104',
    tenantId: 'tenant-1',
    name: '旧版 API 网关流量包',
    category: '基础资源',
    price: 3200,
    stock: 0,
    status: 'OFF_SHELF',
    updatedAt: '2026-11-10 09:00:00',
  },
];

let mockSettlements: SettlementItem[] = [
  {
    id: 'set-1',
    settlementNo: 'SET-2026091',
    partnerId: 'partner-1',
    period: '2026-09',
    referralCount: 2,
    grossGmv: 146000,
    commissionRate: 0.14,
    commissionAmount: 20440,
    status: 'PAID',
    createdAt: '2026-10-05 10:00:00',
  },
  {
    id: 'set-2',
    settlementNo: 'SET-2026101',
    partnerId: 'partner-1',
    period: '2026-10',
    referralCount: 2,
    grossGmv: 178500,
    commissionRate: 0.14,
    commissionAmount: 24990,
    status: 'PAID',
    createdAt: '2026-11-05 10:00:00',
  },
  {
    id: 'set-3',
    settlementNo: 'SET-2026111',
    partnerId: 'partner-1',
    period: '2026-11 (上半月)',
    referralCount: 3,
    grossGmv: 112000,
    commissionRate: 0.14,
    commissionAmount: 15680,
    status: 'PENDING',
    createdAt: '2026-11-16 14:30:00',
  },
];

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockTenantService = {
  async getList(params: TenantQueryParams = {}): Promise<TenantItem[]> {
    await delay();
    return mockTenants.filter((item) => {
      const matchKeyword =
        !params.keyword ||
        item.name.toLowerCase().includes(params.keyword.toLowerCase()) ||
        (item.partnerName?.toLowerCase().includes(params.keyword.toLowerCase()) ?? false);
      const matchStatus = !params.status || item.status === params.status;
      const matchPartner = !params.partnerId || item.partnerId === params.partnerId;
      return matchKeyword && matchStatus && matchPartner;
    });
  },

  async updateStatus(payload: UpdateTenantStatusPayload): Promise<TenantItem> {
    await delay();
    const target = mockTenants.find((item) => item.id === payload.id);
    if (!target) {
      throw new Error(`未找到租户 ${payload.id}`);
    }
    const updated: TenantItem = { ...target, status: payload.status };
    mockTenants = mockTenants.map((item) => (item.id === payload.id ? updated : item));
    return updated;
  },
};

export const mockOrderService = {
  async getList(params: OrderQueryParams): Promise<{ list: OrderItem[]; total: number }> {
    await delay();
    const filtered = mockOrders.filter((item) => {
      const matchTenant = !params.tenantId || item.tenantId === params.tenantId;
      const matchKeyword =
        !params.keyword ||
        item.customerName.includes(params.keyword) ||
        item.orderNo.includes(params.keyword) ||
        item.tenantName.includes(params.keyword);
      const matchStatus = !params.status || item.status === params.status;
      return matchTenant && matchKeyword && matchStatus;
    });
    const start = (params.page - 1) * params.pageSize;
    return {
      list: filtered.slice(start, start + params.pageSize),
      total: filtered.length,
    };
  },

  async create(payload: CreateOrderPayload): Promise<OrderItem> {
    await delay();
    const tenant = mockTenants.find((t) => t.id === payload.tenantId);
    const newOrder: OrderItem = {
      id: `ord-${Date.now()}`,
      orderNo: generateCode('ORD'),
      tenantId: payload.tenantId,
      tenantName: payload.tenantName ?? tenant?.name ?? payload.tenantId,
      customerName: payload.customerName,
      amount: payload.amount,
      status: payload.status,
      remark: payload.remark,
      createdAt: formatDateTime(),
    };
    mockOrders = [newOrder, ...mockOrders];
    return newOrder;
  },

  async update(payload: UpdateOrderPayload): Promise<OrderItem> {
    await delay();
    const existing = mockOrders.find((item) => item.id === payload.id);
    if (!existing) {
      throw new Error(`未找到订单 ${payload.id}`);
    }
    const resolvedTenantName = payload.tenantId
      ? (payload.tenantName ??
        mockTenants.find((t) => t.id === payload.tenantId)?.name ??
        existing.tenantName)
      : existing.tenantName;

    const updated: OrderItem = {
      ...existing,
      ...payload,
      tenantName: resolvedTenantName,
    };
    mockOrders = mockOrders.map((item) => (item.id === payload.id ? updated : item));
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay();
    mockOrders = mockOrders.filter((item) => item.id !== id);
  },
};

export const mockProductService = {
  async getList(params: ProductQueryParams): Promise<ProductItem[]> {
    await delay();
    return mockProducts.filter((item) => {
      const matchTenant = item.tenantId === params.tenantId;
      const matchKeyword =
        !params.keyword || item.name.includes(params.keyword) || item.sku.includes(params.keyword);
      const matchStatus = !params.status || item.status === params.status;
      return matchTenant && matchKeyword && matchStatus;
    });
  },

  async create(payload: CreateProductPayload): Promise<ProductItem> {
    await delay();
    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      sku: generateCode('SKU'),
      tenantId: payload.tenantId,
      name: payload.name,
      category: payload.category,
      price: payload.price,
      stock: payload.stock,
      status: payload.status ?? 'ON_SALE',
      updatedAt: formatDateTime(),
    };
    mockProducts = [newProduct, ...mockProducts];
    return newProduct;
  },

  async toggleStatus(id: string): Promise<ProductItem> {
    await delay();
    const target = mockProducts.find((item) => item.id === id);
    if (!target) {
      throw new Error(`未找到商品 ${id}`);
    }
    const updated: ProductItem = {
      ...target,
      status: target.status === 'ON_SALE' ? 'OFF_SHELF' : 'ON_SALE',
      updatedAt: formatDateTime(),
    };
    mockProducts = mockProducts.map((item) => (item.id === id ? updated : item));
    return updated;
  },
};

export const mockSettlementService = {
  async getList(params: SettlementQueryParams): Promise<SettlementItem[]> {
    await delay();
    return mockSettlements.filter((item) => {
      const matchPartner = item.partnerId === params.partnerId;
      const matchStatus = !params.status || item.status === params.status;
      return matchPartner && matchStatus;
    });
  },

  async create(payload: CreateSettlementPayload): Promise<SettlementItem> {
    await delay();
    const partnerTenants = mockTenants.filter(
      (t) => t.partnerId === payload.partnerId && t.status === 'ACTIVE',
    );
    const grossGmv = partnerTenants.reduce((sum, t) => sum + t.monthlyGmv, 0);
    const avgRate =
      partnerTenants.length > 0
        ? partnerTenants.reduce((sum, t) => sum + t.commissionRate, 0) / partnerTenants.length
        : 0.12;
    const commissionAmount = Math.round(grossGmv * avgRate);
    const newSettlement: SettlementItem = {
      id: `set-${Date.now()}`,
      settlementNo: generateCode('SET'),
      partnerId: payload.partnerId,
      period: payload.period ?? '2026-11 (本期增量)',
      referralCount: partnerTenants.length,
      grossGmv,
      commissionRate: Number(avgRate.toFixed(2)),
      commissionAmount,
      status: 'PENDING',
      createdAt: formatDateTime(),
    };
    mockSettlements = [newSettlement, ...mockSettlements];
    return newSettlement;
  },
};
