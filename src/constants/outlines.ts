export const OUTLINE_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  IN_REVIEW: "in_review",
  SUBMITTED: "submitted",
  CHANGES_REQUESTED: "changes_requested",
  REJECTED: "rejected",
  APPROVED: "approved",
  PUBLISHED: "published",
} as const;

export type OutlineStatus =
  (typeof OUTLINE_STATUSES)[keyof typeof OUTLINE_STATUSES];

const LOCKED_STATUSES = new Set<string>([
  OUTLINE_STATUSES.PUBLISHED,
  OUTLINE_STATUSES.APPROVED,
  OUTLINE_STATUSES.IN_REVIEW,
  OUTLINE_STATUSES.PENDING,
  OUTLINE_STATUSES.SUBMITTED,
]);

export const formatOutlineStatusLabel = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getOutlineDisplayStatus = (outline: {
  status: string;
  currentStage?: string | null;
}) => outline.currentStage || outline.status;

export const isOutlineEditable = (outline: {
  status: string;
  currentStage?: string | null;
}) => {
  if (outline.currentStage) return false;
  if (LOCKED_STATUSES.has(outline.status)) return false;
  return true;
};
