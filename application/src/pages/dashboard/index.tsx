import DataGrid from "@/components/function/data-grid";
import { useThreads } from "@/hooks/threads/useThreadData";
import { useDebounce } from "@/hooks/useDebounce";
import { THREAD_STATUS_VALUES } from "@/lib/consts/threadsConsts";
import { ThreadStatus } from "@/lib/types/threadsTypes";
import { useState } from "react";
import Header from "./Header";
import OutreachTable from "./OutreachTable";
import { StatsGrid } from "./StatsGrid";

export default function DashboardPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<ThreadStatus | "ALL">("ALL");

  const debouncedSearch = useDebounce(searchQuery, 500);
  const pageSize = 10;

  const {
    data: threadsMeta,
    isLoading,
    refetch,
  } = useThreads({
    page,
    pageSize,
    search: debouncedSearch,
    status,
  });
  const totalPages = Math.ceil((threadsMeta?.total || 0) / pageSize) || 1;

  return (
    <div className="space-y-8 py-8 px-4 md:px-6 lg:px-8 pb-10">
      <Header />
      <StatsGrid />
      <DataGrid<ThreadStatus | "ALL">
        header="Outreach List"
        description="Manage your ongoing conversations"
        filter={{
          value: status,
          onClick: (status) => setStatus(status),
          options: [...THREAD_STATUS_VALUES, "ALL"],
          isFilterApplied: status !== "ALL",
        }}
        refresh={() => refetch()}
        search={{
          value: searchQuery,
          onChange: (value) => setSearchQuery(value),
          placeholder: "Search by name or company...",
        }}
        pagination={{
          page,
          totalPages,
          setPage,
          disabled: isLoading,
        }}
      >
        <OutreachTable
          threads={threadsMeta?.threads || []}
          isLoading={isLoading}
        />
      </DataGrid>
    </div>
  );
}
