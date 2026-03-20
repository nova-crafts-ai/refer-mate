import DataGrid from "@/components/function/data-grid";
import { useThreads } from "@/hooks/threads/useThreadData";
import { useDebounce } from "@/hooks/useDebounce";
import { THREAD_STATUS_VALUES } from "@/lib/consts/threadsConsts";
import { ThreadStatus } from "@/lib/types/threadsTypes";
import { useState } from "react";
import { DraftsTable } from "./DraftsTable";
import Header from "./Header";

const DraftsPage = () => {
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
    messageStatus: "DRAFT",
  });
  const totalPages = Math.ceil((threadsMeta?.total || 0) / pageSize) || 1;

  return (
    <div className="space-y-8 py-8 px-4 md:px-6 lg:px-8 pb-10 animate-fadeIn">
      <Header />
      <DataGrid<ThreadStatus | "ALL">
        header="Drafts List"
        description="Review and manage your pending emails"
        filter={{
          value: status,
          onClick: (status) => setStatus(status),
          options: THREAD_STATUS_VALUES,
          isFilterApplied: status !== "ALL",
        }}
        search={{
          value: searchQuery,
          onChange: (value) => setSearchQuery(value),
          placeholder: "Search by name or company...",
        }}
        refresh={() => refetch()}
        pagination={{
          page,
          totalPages,
          setPage,
          disabled: isLoading,
        }}
      >
        <DraftsTable
          threads={threadsMeta?.threads || []}
          isLoading={isLoading}
        />
      </DataGrid>
    </div>
  );
};

export default DraftsPage;
