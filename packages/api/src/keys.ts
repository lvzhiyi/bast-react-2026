import type {
  OrderQueryParams,
  ProductQueryParams,
  SettlementQueryParams,
  TenantQueryParams,
} from './schemas';

export const tenantKeys = {
  all: ['tenants'] as const,
  list: (params: TenantQueryParams) => [...tenantKeys.all, 'list', params] as const,
};

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderQueryParams) => [...orderKeys.lists(), params] as const,
};

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductQueryParams) => [...productKeys.all, 'list', params] as const,
};

export const settlementKeys = {
  all: ['settlements'] as const,
  list: (params: SettlementQueryParams) => [...settlementKeys.all, 'list', params] as const,
};
