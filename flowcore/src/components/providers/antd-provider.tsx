"use client";

import { App, ConfigProvider, theme } from "antd";
import type { ReactNode } from "react";

type AntdProviderProps = {
  children: ReactNode;
};

export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          colorSuccess: "#2e7d32",
          colorWarning: "#d97706",
          colorError: "#c2410c",
          colorInfo: "#1677ff",
          colorText: "#1f2937",
          colorTextSecondary: "#64748b",
          colorBorder: "#d8dee8",
          colorBgLayout: "#f5f7fb",
          borderRadius: 8,
          wireframe: false
        },
        components: {
          Button: {
            controlHeight: 36,
            borderRadius: 6
          },
          Card: {
            borderRadiusLG: 8
          },
          Table: {
            headerBg: "#f8fafc",
            rowHoverBg: "#f8fafc"
          }
        }
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
