import { useAPIClient } from "@/hooks/useAPIClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThreadService } from "@/services/threadService";
import { Thread, ThreadsMeta, ThreadStatus } from "@/lib/types/threadsTypes";
import { toast } from "sonner";
import { HUMAN_READABLE_STATUS } from "@/lib/consts/threadsConsts";
import { threadKeys } from "./threadsQueryKeys";

interface UpdateStatusVariables {
  id: number;
  status: ThreadStatus;
}

interface ToggleAutomatedVariables {
  id: number;
  isAutomated: boolean;
}

export const useThreadActions = () => {
  const apiClient = useAPIClient();
  const threadClient = new ThreadService(apiClient);
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: UpdateStatusVariables) => {
      return threadClient.updatedThread({ id, status });
    },
    onSuccess: (res) => {
      toast.success(
        `Thread marked as ${HUMAN_READABLE_STATUS[res.status]} successfully.`,
      );
      queryClient.setQueryData(
        threadKeys.detail(res.id),
        (prevData: Thread) => {
          return {
            ...prevData,
            status: res.status,
          };
        },
      );
      queryClient.setQueriesData(
        { queryKey: threadKeys.lists() },
        (prevData: ThreadsMeta) => {
          if (!prevData) return prevData;

          return prevData.threads.map((threadMeta) => {
            if (threadMeta.id === res.id) {
              return { ...threadMeta, status: res.status };
            } else {
              return threadMeta;
            }
          });
        },
      );
    },
    onError: (err) => {
      console.error("Failed to update thread status", err);
      toast.error(
        "We are unable to update status at this moment. Please try again later.",
      );
    },
  });

  const toggleAutomated = useMutation({
    mutationFn: ({ id, isAutomated }: ToggleAutomatedVariables) => {
      return threadClient.updatedThread({ id, isAutomated });
    },
    onSuccess: (res) => {
      toast.success(
        `Automated follow-ups ${res.isAutomated ? "enabled" : "disabled"}.`,
      );
      queryClient.setQueryData(
        threadKeys.detail(res.id),
        (prevData: Thread): Thread => {
          return {
            ...prevData,
            isAutomated: res.isAutomated,
          };
        },
      );
      queryClient.setQueriesData(
        { queryKey: threadKeys.lists() },
        (prevData: ThreadsMeta) => {
          if (!prevData) return prevData;

          return prevData.threads.map((threadMeta) => {
            if (threadMeta.id === res.id) {
              return { ...threadMeta, isAutomated: res.isAutomated };
            } else {
              return threadMeta;
            }
          });
        },
      );
    },
    onError: (err) => {
      console.error("Failed to toggle thread automation", err);
      toast.error(
        "We are unable to change thread management strategy at the moment. Please try again later.",
      );
    },
  });

  return {
    updateStatus,
    toggleAutomated,
  };
};
