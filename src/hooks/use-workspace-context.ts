import { useOutletContext } from "react-router-dom";
import type { WorkspacePayload } from "../types/domain";

export interface WorkspaceContextValue {
  workspace?: WorkspacePayload;
  refreshWorkspace: () => Promise<unknown>;
}

export const useWorkspaceContext = () => useOutletContext<WorkspaceContextValue>();
