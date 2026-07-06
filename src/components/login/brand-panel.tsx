import Image from "next/image";

export function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-starbucks-green lg:flex lg:w-[45%] lg:min-w-[420px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-[600px] overflow-hidden rounded-full opacity-15">
          <Image
            src="/starbucks-watermark.png"
            alt=""
            width={600}
            height={600}
            aria-hidden
            className="size-full object-cover"
          />
        </div>
      </div>

      <div className="relative z-10 mt-auto px-12 pb-16 xl:px-16">
        <h2 className="max-w-md text-2xl leading-snug font-bold text-white">
          최고의 파트너와 함께
          <br />
          더 나은 스타벅스를 만들어갑니다.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
          관리자 페이지를 통해 매장 운영, 회원 관리, 상품 및 통계 정보를
          한눈에 확인하세요.
        </p>
      </div>
    </aside>
  );
}
