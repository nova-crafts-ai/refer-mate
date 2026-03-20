import CompanyDetails from "@/components/function/data-grid/cells/CompanyDetails";
import EmployeeDetails from "@/components/function/data-grid/cells/EmployeeDetails";
import LastUpdated from "@/components/function/data-grid/cells/LastUpdated";
import NeedsAttention, {
  needsAttention,
} from "@/components/function/data-grid/cells/NeedsAttention";
import ThreadActions from "@/components/function/data-grid/cells/ThreadActions";
import ToggleAutomated from "@/components/function/data-grid/cells/ToggleAutomated";
import ThreadStatusBadge from "@/components/function/status-badges/ThreadStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThreadsMeta } from "@/lib/types/threadsTypes";
import { cn } from "@/lib/utils";
import { Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

interface OutreachTableProps {
  threads: ThreadsMeta["threads"];
  isLoading: boolean;
}

const OutreachTable = ({ threads, isLoading }: OutreachTableProps) => {
  const navigate = useNavigate();

  const tableCells = [
    {
      Comp: NeedsAttention,
      className: "relative w-min",
    },
    {
      Comp: EmployeeDetails,
    },
    {
      Comp: CompanyDetails,
    },
    {
      Comp: ThreadStatusBadge,
    },
    {
      Comp: ToggleAutomated,
    },
    {
      Comp: LastUpdated,
    },
    {
      Comp: ThreadActions,
      className: "text-center pr-6",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border/40">
          <TableHead></TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="flex gap-1.5 items-center h-full">
            Automated
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Threads marked as automated will be managed by the system and
                will be followed up in 3 days.
              </TooltipContent>
            </Tooltip>
          </TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead className="text-center pr-6">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {threads.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="h-24 text-center text-muted-foreground"
            >
              No outreach records found.
            </TableCell>
          </TableRow>
        ) : (
          threads.map((thread) => (
            <TableRow
              key={thread.id}
              className={cn(
                "relative group hover:bg-muted/70 border-border/40 cursor-pointer",
                needsAttention(thread) ? "bg-green-100 hover:bg-green-200" : "",
              )}
              onClick={() => navigate(`/outreach/view/${thread.id}`)}
            >
              {tableCells.map((cell) => (
                <TableCell className={cn(cell.className)}>
                  <cell.Comp thread={thread} />
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default OutreachTable;
