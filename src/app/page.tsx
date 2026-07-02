import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <main className="flex w-full max-w-md flex-col items-center gap-6 px-6 py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            만반잘부 백오피스
          </h1>
          <p className="text-sm text-muted-foreground">
            프로젝트 환경이 준비되었습니다.
          </p>
        </div>
        <Button>시작하기</Button>
      </main>
    </div>
  );
}
