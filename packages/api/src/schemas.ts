import { z } from 'zod';

export const tenantStatusSchema = z.enum(['ACTIVE', 'PENDING_REVIEW', 'SUSPENDED']);
export type TenantStatus = z.infer<typeof tenantStatusSchema>;

export const tenantPlanSchema = z.enum(['STANDARD', 'PRO', 'ENTERPRISE']);
export type TenantPlan = z.infer<typeof tenantPlanSchema>;

export const tenantItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: tenantPlanSchema,
  status: tenantStatusSchema,
  partnerId: z.string().optional(),
  partnerName: z.string().optional(),
  commissionRate: z.number(),
  monthlyGmv: z.number(),
  createdAt: z.string(),
});
export type TenantItem = z.infer<typeof tenantItemSchema>;

export interface TenantQueryParams {
  keyword?: string;
  status?: TenantStatus;
  partnerId?: string;
}

export interface UpdateTenantStatusPayload {
  id: string;
  status: TenantStatus;
}

export const orderStatusSchema = z.enum(['PENDING', 'PAID', 'CANCELLED']);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderItemSchema = z.object({
  id: z.string(),
  orderNo: z.string(),
  tenantId: z.string(),
  tenantName: z.string(),
  customerName: z.string(),
  amount: z.number(),
  status: orderStatusSchema,
  remark: z.string().optional(),
  createdAt: z.string(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export interface OrderQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: OrderStatus;
  tenantId?: string;
}

export const createOrderSchema = z.object({
  tenantId: z.string().min(1, '请选择所属租户'),
  tenantName: z.string().optional(),
  customerName: z.string().min(1, '请输入客户名称'),
  amount: z.number().nonnegative('金额不能为负数'),
  status: orderStatusSchema,
  remark: z.string().optional(),
});
export type CreateOrderPayload = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = createOrderSchema.partial().extend({
  id: z.string().min(1),
});
export type UpdateOrderPayload = z.infer<typeof updateOrderSchema>;

export const productStatusSchema = z.enum(['ON_SALE', 'OFF_SHELF']);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  tenantId: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.number(),
  stock: z.number(),
  status: productStatusSchema,
  updatedAt: z.string(),
});
export type ProductItem = z.infer<typeof productItemSchema>;

export interface ProductQueryParams {
  tenantId: string;
  keyword?: string;
  status?: ProductStatus;
}

export const createProductSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1, '请输入商品/套餐名称'),
  category: z.string().min(1, '请选择商品分类'),
  price: z.number().nonnegative('价格不能为负数'),
  stock: z.number().int().nonnegative('库存不能为负数'),
  status: productStatusSchema.default('ON_SALE'),
});
export type CreateProductPayload = z.input<typeof createProductSchema>;

export const settlementStatusSchema = z.enum(['PENDING', 'PAID']);
export type SettlementStatus = z.infer<typeof settlementStatusSchema>;

export const settlementItemSchema = z.object({
  id: z.string(),
  settlementNo: z.string(),
  partnerId: z.string(),
  period: z.string(),
  referralCount: z.number(),
  grossGmv: z.number(),
  commissionRate: z.number(),
  commissionAmount: z.number(),
  status: settlementStatusSchema,
  createdAt: z.string(),
});
export type SettlementItem = z.infer<typeof settlementItemSchema>;

export interface SettlementQueryParams {
  partnerId: string;
  status?: SettlementStatus;
}

export interface CreateSettlementPayload {
  partnerId: string;
  period?: string;
}
