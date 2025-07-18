import { Metadata } from "next";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Skeleton,
  Input,
  Label,
  Separator,
} from "@/components/ui";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "UI 组件展示",
  description: "查看所有可用的 UI 组件",
};

export default function ComponentsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">UI 组件展示</h1>
            <p className="text-muted-foreground">基于 shadcn/ui 的完整组件库</p>
          </div>

          {/* 按钮组件 */}
          <Card>
            <CardHeader>
              <CardTitle>按钮 (Button)</CardTitle>
              <CardDescription>不同变体和大小的按钮组件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">默认</Button>
                <Button variant="secondary">次要</Button>
                <Button variant="destructive">危险</Button>
                <Button variant="outline">轮廓</Button>
                <Button variant="ghost">幽灵</Button>
                <Button variant="link">链接</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">小型</Button>
                <Button size="default">默认</Button>
                <Button size="lg">大型</Button>
                <Button size="icon">
                  <span>🔍</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 进度条 */}
          <Card>
            <CardHeader>
              <CardTitle>进度条 (Progress)</CardTitle>
              <CardDescription>显示任务完成进度</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>文件上传进度</Label>
                <Progress value={33} className="w-full" />
              </div>
              <div className="space-y-2">
                <Label>人脸检测进度</Label>
                <Progress value={66} className="w-full" />
              </div>
              <div className="space-y-2">
                <Label>匹配搜索进度</Label>
                <Progress value={90} className="w-full" />
              </div>
            </CardContent>
          </Card>

          {/* 徽章组件 */}
          <Card>
            <CardHeader>
              <CardTitle>徽章 (Badge)</CardTitle>
              <CardDescription>用于显示状态和置信度分数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">默认</Badge>
                <Badge variant="secondary">次要</Badge>
                <Badge variant="destructive">错误</Badge>
                <Badge variant="outline">轮廓</Badge>
                <Badge variant="success">成功</Badge>
                <Badge variant="warning">警告</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">置信度 95%</Badge>
                <Badge variant="warning">置信度 82%</Badge>
                <Badge variant="destructive">置信度 65%</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 头像组件 */}
          <Card>
            <CardHeader>
              <CardTitle>头像 (Avatar)</CardTitle>
              <CardDescription>用于显示用户头像或人脸预览</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>👤</AvatarFallback>
                </Avatar>
                <Avatar className="h-16 w-16">
                  <AvatarFallback>🙂</AvatarFallback>
                </Avatar>
                <Avatar className="h-20 w-20">
                  <AvatarFallback>😊</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          {/* 输入框 */}
          <Card>
            <CardHeader>
              <CardTitle>输入框 (Input)</CardTitle>
              <CardDescription>文本输入和文件选择</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">文本输入</Label>
                <Input
                  id="text-input"
                  type="text"
                  placeholder="请输入内容..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-input">文件选择</Label>
                <Input id="file-input" type="file" accept="image/*" />
              </div>
            </CardContent>
          </Card>

          {/* 骨架屏 */}
          <Card>
            <CardHeader>
              <CardTitle>骨架屏 (Skeleton)</CardTitle>
              <CardDescription>加载状态的占位符</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 分隔符 */}
          <Card>
            <CardHeader>
              <CardTitle>分隔符 (Separator)</CardTitle>
              <CardDescription>用于分隔内容区域</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p>第一段内容</p>
                <Separator className="my-4" />
                <p>第二段内容</p>
                <Separator className="my-4" />
                <p>第三段内容</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
