import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, type MenuProps, Tag } from 'antd';
import { type ReactNode, useState } from 'react';

const { Header, Sider, Content } = Layout;

export interface PortalLinkItem {
  key: string;
  label: string;
  url: string;
  active?: boolean;
}

export const SAAS_PORTALS: PortalLinkItem[] = [
  { key: 'platform', label: '运营总台 (:5173)', url: 'http://localhost:5173' },
  { key: 'merchant', label: '商家工作台 (:5174)', url: 'http://localhost:5174' },
  { key: 'partner', label: '渠道商后台 (:5175)', url: 'http://localhost:5175' },
];

export interface AdminShellProps {
  brandName: string;
  brandShortName: string;
  roleBadge: string;
  accentColor: string;
  userName: string;
  menuItems: NonNullable<MenuProps['items']>;
  selectedKey: string;
  onMenuSelect: (key: string) => void;
  portalLinks?: PortalLinkItem[];
  children: ReactNode;
}

export function AdminShell({
  brandName,
  brandShortName,
  roleBadge,
  accentColor,
  userName,
  menuItems,
  selectedKey,
  onMenuSelect,
  portalLinks = SAAS_PORTALS,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <div className="h-16 flex items-center justify-center px-3 text-white font-bold text-base tracking-wide border-b border-white/10">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <span className="truncate">{collapsed ? brandShortName : brandName}</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => onMenuSelect(key)}
        />
      </Sider>
      <Layout className="bg-slate-100">
        <Header
          style={{ background: '#ffffff', padding: '0 24px' }}
          className="h-16 flex items-center justify-between border-b border-gray-200 shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
              className="text-base"
            />
            {portalLinks.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-gray-200">
                <span className="text-xs text-gray-400 mr-1">矩阵入口:</span>
                {portalLinks.map((portal) => (
                  <a
                    key={portal.key}
                    href={portal.url}
                    target={portal.active ? undefined : '_blank'}
                    rel={portal.active ? undefined : 'noreferrer'}
                    className={`px-2.5 py-1 rounded text-xs transition-colors no-underline ${
                      portal.active
                        ? 'font-medium text-white'
                        : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={portal.active ? { backgroundColor: accentColor } : undefined}
                  >
                    {portal.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tag color={accentColor} className="m-0">
              {roleBadge}
            </Tag>
            <span className="text-sm text-gray-600">{userName}</span>
          </div>
        </Header>
        <Content className="min-h-[calc(100vh-64px)]">{children}</Content>
      </Layout>
    </Layout>
  );
}
