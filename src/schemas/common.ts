export type AgentError = {
  message: string;
  code: string;
};

export type Result<T, E = AgentError> = 
  | { success: true; data: T }
  | { success: false; error: E };
