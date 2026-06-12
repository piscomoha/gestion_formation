import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EntityApi<TRecord, TPayload> {
  list: () => Promise<TRecord[]>;
  get: (id: number) => Promise<TRecord>;
  create: (payload: TPayload) => Promise<TRecord>;
  update: (id: number, payload: TPayload) => Promise<TRecord>;
  remove: (id: number) => Promise<void>;
}

export function createEntityHooks<TRecord, TPayload>(
  queryKey: string,
  api: EntityApi<TRecord, TPayload>,
  label: string,
) {
  const useList = () =>
    useQuery({
      queryKey: [queryKey],
      queryFn: api.list,
    });

  const useDetail = (id?: number) =>
    useQuery({
      queryKey: [queryKey, id],
      queryFn: () => api.get(id as number),
      enabled: Boolean(id),
    });

  const useCreate = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: api.create,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast.success(`${label} cree avec succes`);
      },
    });
  };

  const useUpdate = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: TPayload }) =>
        api.update(id, payload),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: [queryKey, variables.id] });
        toast.success(`${label} mis a jour avec succes`);
      },
    });
  };

  const useDelete = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: api.remove,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        toast.success(`${label} supprime avec succes`);
      },
    });
  };

  return {
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  };
}
