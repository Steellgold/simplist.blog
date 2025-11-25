import Link from "next/link";
import Image from "next/image";

export const SimplistIcon = () => {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="https://cdn.simplist.blog/assets/simplist-text-icon.svg"
        alt="Simplist"
        width={120}
        height={24}
        className="h-6 w-auto dark:invert"
        priority
      />
    </Link>
  );
};
