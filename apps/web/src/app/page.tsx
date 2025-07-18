import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "人脸识别照片搜索",
  description:
    "上传一张包含人脸的照片，AI 将自动为您找到所有包含相同人脸的照片",
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero 区域 */}
        <Hero />

        {/* 上传区域 */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                开始使用
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                上传一张包含人脸的照片，让 AI 为您找到相似的照片
              </p>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      准备开始人脸识别？
                    </h3>
                    <p className="text-muted-foreground">
                      上传一张包含人脸的照片，AI 将为您找到所有相似的照片
                    </p>
                  </div>

                  <Button size="lg" asChild>
                    <Link href="/upload" className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      开始上传照片
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    支持 JPG、PNG、WebP 格式 • 最大 10MB • 完全免费
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 功能介绍 */}
        <Features />
      </main>
      <Footer />
    </>
  );
}
