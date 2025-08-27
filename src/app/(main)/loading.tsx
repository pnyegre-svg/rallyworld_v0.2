import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Image
        src="/RW_i.svg"
        alt="Rally World Logo"
        width={80}
        height={80}
        className="animate-pulse"
      />
    </div>
  );
}
