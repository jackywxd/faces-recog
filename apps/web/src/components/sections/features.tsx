export function Features() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          强大功能
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          基于先进的 AI 技术，为您提供最佳的人脸识别体验
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">高精度识别</h3>
          <p className="text-muted-foreground">
            使用最新的深度学习算法，识别精度超过 95%
          </p>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">快速处理</h3>
          <p className="text-muted-foreground">
            优化的算法确保快速响应，通常在 30 秒内完成
          </p>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">隐私保护</h3>
          <p className="text-muted-foreground">
            所有处理在本地完成，您的照片不会被存储或分享
          </p>
        </div>
      </div>
    </section>
  );
}
