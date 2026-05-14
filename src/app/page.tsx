import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Colombia Coffee
        </h1>
        <nav className="flex gap-4 text-sm items-center">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            商品一覧
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            カート
          </a>
          <Button variant="outline" size="sm">
            ログイン
          </Button>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <h2 className="text-4xl font-bold tracking-tight">
            コロンビアから届く、
            <br />
            農園の想いが詰まった一杯。
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            生産者の顔が見えるスペシャリティコーヒー豆を、
            農園から直接あなたのもとへ。
          </p>
          <Button size="lg">商品を見る</Button>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        &copy; 2026 Colombia Coffee. All rights reserved.
      </footer>
    </div>
  );
}
