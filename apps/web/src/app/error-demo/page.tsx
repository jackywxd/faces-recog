import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorDemoSection } from "@/components/error-demo";

export const metadata: Metadata = {
  title: "错误处理演示 - 人脸识别系统",
  description: "演示系统的错误处理和用户反馈机制",
};

export default function ErrorDemoPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 页面标题 */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              错误处理演示
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              演示系统的错误处理机制，包括各种错误类型和用户反馈
            </p>
          </div>

          <ErrorDemoSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
