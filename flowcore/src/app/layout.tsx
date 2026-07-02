import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import "antd/dist/reset.css";
import "./globals.css";
import { AntdProvider } from "@/components/providers/antd-provider";

export const metadata: Metadata = {
  title: "FlowCore",
  description: "项目风险与问题变更闭环管理系统"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AntdProvider>{children}</AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
