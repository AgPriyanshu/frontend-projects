import { useEffect, useRef } from "react";
import { Button, HStack, Menu, Portal } from "@chakra-ui/react";
import { useProcessingJobs, useProcessingTools } from "api/web-gis";
import { observer } from "mobx-react-lite";
import api from "api/api";
import { QueryKeys } from "api/query-keys";
import { queryClient } from "api/query-client";
import { workspaceManager } from "shared/map/stores/workspace-manager";
import { ProcessingJobModal } from "./processing-job-modal";
import { ProcessingJobListPopover } from "./processing-job-list-popover";

export const ProcessingBar = observer(() => {
  const { data: toolsData } = useProcessingTools();
  const { data: jobsData } = useProcessingJobs();

  const workspace = workspaceManager.activeWorkspace;
  const processingUIStore = workspace?.processingUIStore;

  const tools = toolsData?.data?.tools ?? [];
  const rasterTools = tools.filter((t) => t.category === "raster");
  const vectorTools = tools.filter((t) => t.category === "vector");

  const activeCount = (jobsData?.data ?? []).filter(
    (j) => j.status === "pending" || j.status === "processing"
  ).length;

  const prevJobsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!jobsData?.data) return;

    for (const job of jobsData.data) {
      const prevStatus = prevJobsRef.current[job.id];
      if (
        prevStatus &&
        prevStatus !== "completed" &&
        job.status === "completed" &&
        job.outputDataset
      ) {
        const params = job.parameters as Record<string, unknown>;
        const name =
          (params.__output_name as string | undefined) || "Processing Output";

        api
          .post(QueryKeys.layers[0], {
            name,
            source: job.outputDataset,
          })
          .then(() => {
            queryClient.invalidateQueries({ queryKey: QueryKeys.datasets });
            queryClient.invalidateQueries({ queryKey: QueryKeys.layers });
          })
          .catch(console.error);
      }
      prevJobsRef.current[job.id] = job.status;
    }
  }, [jobsData]);

  return (
    <>
      <HStack
        w="full"
        px="0.75rem"
        py="0.4rem"
        bg="surface.page"
        borderBottomWidth="1px"
        borderColor="border.default"
        gap="0.5rem"
      >
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button size="sm" variant="outline">
              Raster Tools
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {rasterTools.length === 0 ? (
                  <Menu.Item value="__empty__" disabled>
                    Loading…
                  </Menu.Item>
                ) : (
                  rasterTools.map((tool) => (
                    <Menu.Item
                      key={tool.toolName}
                      value={tool.toolName}
                      onClick={() => processingUIStore?.openTool(tool)}
                    >
                      {tool.label}
                    </Menu.Item>
                  ))
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <Menu.Root>
          <Menu.Trigger asChild>
            <Button size="sm" variant="outline">
              Vector Tools
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {vectorTools.length === 0 ? (
                  <Menu.Item value="__empty__" disabled>
                    Loading…
                  </Menu.Item>
                ) : (
                  vectorTools.map((tool) => (
                    <Menu.Item
                      key={tool.toolName}
                      value={tool.toolName}
                      onClick={() => processingUIStore?.openTool(tool)}
                    >
                      {tool.label}
                    </Menu.Item>
                  ))
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <HStack ml="auto">
          <ProcessingJobListPopover activeCount={activeCount} />
        </HStack>
      </HStack>

      {processingUIStore?.selectedTool && (
        <ProcessingJobModal
          isOpen={true}
          onClose={() => processingUIStore.close()}
          tool={processingUIStore.selectedTool}
          defaultValues={processingUIStore.defaultValues}
          autoSubmit={processingUIStore.autoSubmit}
        />
      )}
    </>
  );
});
