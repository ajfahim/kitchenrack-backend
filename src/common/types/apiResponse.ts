export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type TApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: TMeta;
  data: T | null;
};
