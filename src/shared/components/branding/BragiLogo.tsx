import Image from "next/image";

export function BragiLogo() {
  return (
    <div className="relative h-[23px] w-[96px] sm:h-[29px] sm:w-[122px] lg:h-[32px] lg:w-[136px]">
      <Image
        src="/bragi-logo.webp"
        alt="Bragi"
        width={400}
        height={94}
        priority
        className="h-full w-full object-contain object-left"
      />
    </div>
  );
}
