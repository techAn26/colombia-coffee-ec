export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center space-y-4">
        <div className="animate-spin text-4xl">☕</div>
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    </div>
  );
}
