import { CURRENT_TENANT_ID } from '@/shared/constants';
import type { CreateProductPayload } from '@repo/api';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';

interface ProductFormModalProps {
  open: boolean;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateProductPayload) => Promise<void>;
}

export function ProductFormModal({
  open,
  confirmLoading,
  onCancel,
  onSubmit,
}: ProductFormModalProps) {
  const [form] = Form.useForm<Omit<CreateProductPayload, 'tenantId'>>();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        category: 'SaaS 订阅',
        price: 9800,
        stock: 50,
        status: 'ON_SALE',
      });
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit({ ...values, tenantId: CURRENT_TENANT_ID });
  };

  return (
    <Modal
      title="新增商品 / 订阅套餐"
      open={open}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          label="商品 / 套餐名称"
          name="name"
          rules={[{ required: true, message: '请输入商品名称' }]}
        >
          <Input placeholder="例如：企业协同旗舰版（100席位）" />
        </Form.Item>

        <Form.Item
          label="所属分类"
          name="category"
          rules={[{ required: true, message: '请选择分类' }]}
        >
          <Select
            options={[
              { label: 'SaaS 订阅', value: 'SaaS 订阅' },
              { label: '增值插件', value: '增值插件' },
              { label: '实施服务', value: '实施服务' },
              { label: '基础资源', value: '基础资源' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="销售价格 (CNY)"
          name="price"
          rules={[{ required: true, message: '请输入价格' }]}
        >
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="可售库存 / 名额"
          name="stock"
          rules={[{ required: true, message: '请输入库存数量' }]}
        >
          <InputNumber min={0} precision={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="上架状态" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '立即上架', value: 'ON_SALE' },
              { label: '暂存下架', value: 'OFF_SHELF' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
