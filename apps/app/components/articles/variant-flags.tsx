"use client";

import {
  getFlagUrl,
  getLanguageName,
  LanguageCode,
} from "@/lib/types/languages";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@simplist/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";

interface VariantFlagsProps {
  variants: Array<{
    lang: LanguageCode;
  }>;
  maxVisible?: number;
}

export const VariantFlags = ({
  variants,
  maxVisible = 4,
}: VariantFlagsProps) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  const visibleVariants = variants.slice(0, maxVisible);
  const remainingCount = Math.max(0, variants.length - maxVisible);
  const hasMore = remainingCount > 0;

  return (
    <TooltipProvider>
      <div className="flex space-x-0">
        {visibleVariants.map((variant) => (
          <Tooltip key={variant.lang}>
            <TooltipTrigger>
              <Avatar className={`ring-background size-4 rounded-xs ring-2`}>
                <AvatarImage
                  src={`${getFlagUrl(variant.lang)}`}
                  alt={variant.lang}
                />
                <AvatarFallback>{variant.lang.toUpperCase()}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>

            <TooltipContent>{getLanguageName(variant.lang)}</TooltipContent>
          </Tooltip>
        ))}

        {hasMore && (
          <Avatar className="ring-background size-4 rounded-xs ring-2">
            <AvatarFallback className="text-[10px] font-semibold">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </TooltipProvider>
  );
};
