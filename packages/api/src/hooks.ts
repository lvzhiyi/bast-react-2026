import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderKeys, productKeys, settlementKeys, tenantKeys } from './keys';
import {
  mockOrderService,
  mockProductService,
  mockSettlementService,
  mockTenantService,
} from './mock-db';
import type {
  CreateOrderPayload,
  CreateProductPayload,
  CreateSettlementPayload,
  OrderQueryParams,
  ProductQueryParams,
  SettlementQueryParams,
  TenantQueryParams,
  UpdateOrderPayload,
  UpdateTenantStatusPayload,
} from './schemas';

export function tenantsQueryOptions(params: TenantQueryParams = {}) {
  return queryOptions({
    queryKey: tenantKeys.list(params),
    queryFn: () => mockTenantService.getList(params),
  });
}

export function useTenants(params: TenantQueryParams = {}) {
  return useQuery(tenantsQueryOptions(params));
}

export function useUpdateTenantStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTenantStatusPayload) => mockTenantService.updateStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.all });
    },
  });
}

export function ordersQueryOptions(params: OrderQueryParams) {
  return queryOptions({
    queryKey: orderKeys.list(params),
    queryFn: () => mockOrderService.getList(params),
  });
}

export function useOrders(params: OrderQueryParams) {
  return useQuery(ordersQueryOptions(params));
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => mockOrderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrderPayload) => mockOrderService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockOrderService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function productsQueryOptions(params: ProductQueryParams) {
  return queryOptions({
    queryKey: productKeys.list(params),
    queryFn: () => mockProductService.getList(params),
  });
}

export function useProducts(params: ProductQueryParams) {
  return useQuery(productsQueryOptions(params));
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => mockProductService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mockProductService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function settlementsQueryOptions(params: SettlementQueryParams) {
  return queryOptions({
    queryKey: settlementKeys.list(params),
    queryFn: () => mockSettlementService.getList(params),
  });
}

export function useSettlements(params: SettlementQueryParams) {
  return useQuery(settlementsQueryOptions(params));
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSettlementPayload) => mockSettlementService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
}
