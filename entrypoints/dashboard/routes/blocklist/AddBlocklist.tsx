import { BlockListType, useAddBlocklist } from "@/common/api/api";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useState } from "react";

export function AddBlocklist(props: {
  defaultListType: BlockListType;
  onAdded: (added: { domain: string; list_type: BlockListType }) => void;
}) {
  const { defaultListType, onAdded } = props;
  const [newWebsite, setNewWebsite] = useState("");
  const [newWebsiteType, setNewWebsiteType] = useState<BlockListType>(
    BlockListType.Work
  );
  const addMutation = useAddBlocklist();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={(isOpen) => {
        setIsPopoverOpen(isOpen);
        if (isOpen) {
          setNewWebsite("");
          setNewWebsiteType(defaultListType);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline">New Website</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const request = {
              domain: newWebsite,
              list_type: newWebsiteType,
            };
            await addMutation.mutateAsync(request);
            onAdded(request);
            setIsPopoverOpen(false);
          }}
        >
          <Input
            placeholder="Website URL"
            onChange={(e) => {
              setNewWebsite(e.target.value);
            }}
          />
          <Select
            onValueChange={(v) => setNewWebsiteType(Number(v) as BlockListType)}
            value={newWebsiteType.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Block Type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BlockListType).map(([key, value]) => (
                <SelectItem value={value.toString()} key={value}>
                  {key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">
            {addMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
