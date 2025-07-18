import { Metadata } from "next";
import { PhotoUpload } from "@/components/photo-upload";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";

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

            <PhotoUpload />
          </div>
        </section>

        {/* 功能介绍 */}
        <Features />
      </main>
      <Footer />
    </>
  );
}
