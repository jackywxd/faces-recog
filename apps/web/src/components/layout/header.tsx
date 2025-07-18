import Link from "next/link";
import { Search, Upload, Grid3X3, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Search className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Photo Face Recognition</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                首页
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                上传照片
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/components" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                组件展示
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/error-demo" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                错误演示
              </Link>
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/upload">开始识别</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
