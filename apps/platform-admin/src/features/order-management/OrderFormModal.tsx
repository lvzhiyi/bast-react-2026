import type { CreateOrderPayload, OrderItem, TenantItem } from '@repo/api';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';

interface OrderFormModalProps {
  open: boolean;
  editingOrder: OrderItem | null;
  tenants: TenantItem[];
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateOrderPayload) => Promise<void>;
}

export function OrderFormModal({
  open,
  editingOrder,
  tenants,
  confirmLoading,
  onCancel,
  onSubmit,
}: OrderFormModalProps) {
  const [form] = Form.useForm<CreateOrderPayload>();

  useEffect(() => {
    if (open) {
      if (editingOrder) {
        form.setFieldsValue({
          tenantId: editingOrder.tenantId,
          customerName: editingOrder.customerName,
          amount: editingOrder.amount,
          status: editingOrder.status,
          remark: editingOrder.remark,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          tenantId: tenants[0]?.id ?? 'tenant-1',
          status: 'PENDING',
          amount: 1000,
        });
      }
    }
  }, [open, editingOrder, tenants, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
  };

  return (
    <Modal
      title={editingOrder ? `编辑订单 (${editingOrder.orderNo})` : '代客创建订单'}
      open={open}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="所属租户"
          name="tenantId"
          rules={[{ required: true, message: '请选择所属租户' }]}
        >
          <Select
            placeholder="请选择租户"
            options={tenants.map((t) => ({ label: t.name, value: t.id }))}
          />
        </Form.Item>

        <Form.Item
          label="客户名称"
          name="customerName"
          rules={[{ required: true, message: '请输入客户名称' }]}
        >
          <Input placeholder="例如：星辰科技有限公司" />
        </Form.Item>

        <Form.Item
          label="订单金额 (CNY)"
          name="amount"
          rules={[{ required: true, message: '请输入订单金额' }]}
        >
          <InputNumber min={0} precision={2} className="w-full" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="订单状态"
          name="status"
          rules={[{ required: true, message: '请选择订单状态' }]}
        >
          <Select
            options={[
              { label: '待支付 (PENDING)', value: 'PENDING' },
              { label: '已支付 (PAID)', value: 'PAID' },
              { label: '已取消 (CANCELLED)', value: 'CANCELLED' },
            ]}
          />
        </Form.Item>

        <Form.Item label="备注说明" name="remark">
          <Input.TextArea rows={3} placeholder="选填：输入合同编号或交付说明" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
