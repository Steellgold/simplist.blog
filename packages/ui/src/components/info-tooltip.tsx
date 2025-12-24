import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";
import { Kbd } from "@simplist/ui/components/kbd";
import { CircleInfo } from "@gravity-ui/icons";

type InfoTooltipProps = {
  content: string;
  showBrackets?: boolean;
};

const parseContentWithKbd = (content: string, showBrackets = false) => {
  const parts = content.split(/(\{\{[^}]+\}\})/);

  return parts.map((part, index) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const kbdContent = showBrackets ? part : part.slice(2, -2).trim();
      return <Kbd key={index}>{kbdContent}</Kbd>;
    }
    return part;
  });
};

export const InfoTooltip = ({
  content,
  showBrackets = false,
}: InfoTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="bg-muted rounded-full p-0.5">
          <CircleInfo className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{parseContentWithKbd(content, showBrackets)}</p>
      </TooltipContent>
    </Tooltip>
  );
};
