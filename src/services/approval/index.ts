import http from "@/utils/http";
import { approval } from "@/constants/endpoints";

export type ApprovalStatus =
  | "in_review"
  | "stage_1_review"
  | "stage_2_approval"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected";

export type ApprovalItem = {
  outlineId: number;
  title: string;
  lecturer: string;
  reviewer?: string | null;
  department?: string | null;
  submissionCount?: number;
  status: ApprovalStatus;
  submittedAt?: string | null;
  lastReviewAt?: string | null;
};

export type ApprovalListResponse = {
  outlines: ApprovalItem[];
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const getStage1 = () => {
  return http.get<ApprovalListResponse>(`${apiBaseUrl}${approval.stage1()}`);
};

export const getStage2 = () => {
  return http.get<ApprovalListResponse>(`${apiBaseUrl}${approval.stage2()}`);
};

export const getById = (outlineId: number) => {
  return http.get<any>(`${apiBaseUrl}${approval.getById(outlineId)}`);
};

export const postStage1Approve = (outlineId: number) => {
  return http.post(`${apiBaseUrl}${approval.stage1Approve(outlineId)}`);
};

export const postStage1RequestChanges = (outlineId: number, body?: any) => {
  return http.post(`${apiBaseUrl}${approval.stage1RequestChanges(outlineId)}`, { data: body });
};

export const postStage1Reject = (outlineId: number, body?: any) => {
  return http.post(`${apiBaseUrl}${approval.stage1Reject(outlineId)}`, { data: body });
};

export const postStage2Approve = (outlineId: number) => {
  return http.post(`${apiBaseUrl}${approval.stage2Approve(outlineId)}`);
};

export const postStage2RequestChanges = (outlineId: number, body?: any) => {
  return http.post(`${apiBaseUrl}${approval.stage2RequestChanges(outlineId)}`, { data: body });
};

export const postStage2Reject = (outlineId: number, body?: any) => {
  return http.post(`${apiBaseUrl}${approval.stage2Reject(outlineId)}`, { data: body });
};

export default {
  getStage1,
  getStage2,
  postStage1Approve,
  postStage1RequestChanges,
  postStage1Reject,
  postStage2Approve,
  postStage2RequestChanges,
  postStage2Reject,
};
