import Image from "next/image";

export function BragiLogo() {
  return (
    <div className="relative h-[23px] w-[96px] overflow-hidden sm:h-[29px] sm:w-[122px] lg:h-[32px] lg:w-[136px]">
      <Image
        src="/Bragi Logo-02.png"
        alt="Bragi"
        width={1024}
        height={576}
        priority
        className="absolute top-[-119px] left-[-183px] h-auto w-[462px] max-w-none sm:top-[-151px] sm:left-[-233px] sm:w-[587px] lg:top-[-168px] lg:left-[-260px] lg:w-[654px]"
      />
    </div>
  );
}
