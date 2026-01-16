import { IconThemed } from "@simplist/ui/components/icon-themed";
import Image from "next/image";
import Link from "next/link";

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

export const SimplistIconThemed = () => {
  return <IconThemed light={<SimplistIcon />} dark={<SimplistIcon />} />;
};
