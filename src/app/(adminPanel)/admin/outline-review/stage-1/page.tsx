"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import useFetchData from "@/hooks/use-fetch-data";
import approvalService from "@/services/approval";
import { usePermission } from "@/hooks/use-permission";
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage";
import { toast } from "sonner";
import StatusBadge from "@/components/approval/StatusBadge";
import ApprovalTimeline from "@/components/approval/ApprovalTimeline";
import ApprovalComments from "@/components/approval/ApprovalComments";
import ApprovalActions from "@/components/approval/ApprovalActions";
import RequestChangesModal from "@/components/approval/RequestChangesModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Stage1ReviewPage() {
  const [loading, error, data, refetch] = useFetchData(approvalService.getStage1);
  const [selected, setSelected] = React.useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [requestOpen, setRequestOpen] = React.useState(false);
  const { hasPermission } = usePermission();

  if (!hasPermission(ENDPOINT_PERMISSIONS.approval.STAGE1)) {
    return <PermissionProtectedPage />;
  }

  const outlines: any[] = data?.outlines || [];

  const handleApprove = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await approvalService.postStage1Approve(selected.outlineId);
      toast.success("Approved and moved to stage 2");
      await refetch();
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve. Refreshing list.");
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async (body?: any) => {
    if (!selected) return;
    try {
      setSubmitting(true);
      await approvalService.postStage1RequestChanges(selected.outlineId, body);
      toast.success("Requested changes sent to lecturer");
      await refetch();
      setRequestOpen(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to request changes");
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (outlineId: number) => {
    try {
      setLoadingDetail(true);
      const res = await approvalService.getById(outlineId);
      setSelected(res.data || res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) return <div>Loading outlines…</div>;
  if (error) return <div>Error loading outlines.</div>;

  return (
    <div className="p-6 text-white space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stage 1 Review</h1>
        <p className="text-sm text-muted-foreground">Outlines awaiting stage 1 review</p>
      </div>

      <Card className="bg-[#141414] border-white/10">
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>List of outlines for stage 1 review</CardDescription>
        </CardHeader>
        <CardContent>
          {outlines.length === 0 ? (
            <div className="text-sm text-muted-foreground">No outlines found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlines.map((o: any) => (
                  <TableRow key={o.outlineId} onClick={() => openDetail(o.outlineId)} className="cursor-pointer">
                    <TableCell>{o.title}</TableCell>
                    <TableCell>{o.lecturer}</TableCell>
                    <TableCell>{o.department || "—"}</TableCell>
                    <TableCell>{o.submissionCount ?? 1}</TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell>{o.submittedAt ? new Date(o.submittedAt).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium">Timeline</h3>
              <ApprovalTimeline events={selected?.timeline} />
            </div>

            <div>
              <h3 className="text-sm font-medium">Comments</h3>
              <ApprovalComments comments={selected?.comments} />

              <div className="mt-4">
                <ApprovalActions
                  stage={1}
                  onApprove={handleApprove}
                  onRequestChanges={() => setRequestOpen(true)}
                  submitting={submitting}
                  onOpenRequestChanges={() => setRequestOpen(true)}
                />
                <div className="mt-3">
                  <button
                    className="inline-flex items-center px-3 py-1 rounded-md bg-red-600 text-white text-sm"
                    disabled={submitting}
                    onClick={async () => {
                      if (!selected) return;
                      const ok = window.confirm("Reject this outline? This action cannot be undone.");
                      if (!ok) return;
                      try {
                        setSubmitting(true);
                        await approvalService.postStage1Reject(selected.outlineId, { comment: "Rejected" });
                        toast.success("Outline rejected");
                        await refetch();
                        setSelected(null);
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to reject outline");
                        await refetch();
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RequestChangesModal open={requestOpen} onOpenChange={setRequestOpen} onSubmit={handleRequestChanges} />
    </div>
  );
}
