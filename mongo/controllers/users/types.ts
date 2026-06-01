export type ControllerResponse = {
  status: number;
  body: Record<string, unknown>;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type UpdateInput = {
  name?: string;
  email?: string;
  password?: string;
};
