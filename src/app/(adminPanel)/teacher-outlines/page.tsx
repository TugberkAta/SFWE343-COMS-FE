import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2, Download } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import useFetchData from "@/hooks/use-fetch-data";
import { deleteOutlineById, getOutlinePdfById, getOutlines } from "@/services/outlines";
import CreateOutlineDialog from "./components/create-outline-dialog";
import { usePermission } from "@/hooks/use-permission";
import { ENDPOINT_PERMISSIONS } from "@/constants/permissions";
import { PermissionGate } from "@/components/PermissionGate";
import { PermissionProtectedPage } from "@/components/PermissionProtectedPage";

type Outline = {
  outlineId: number;
  courseCode: string;
  courseName: string;
  programName: string;
  departmentName: string;
  academicYear: string;
  semester: string;
  status: "published" | "pending" | "draft";
};

function StatusBadge({ status }: { status: Outline["status"] }) {
  const styles = {
    published: "bg-green-100 text-green-700 border border-green-300",
    pending: "bg-orange-100 text-orange-700 border border-orange-300",
    draft: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-md font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function TeacherOutlinesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = usePermission();

  const [downloadingOutlineId, setDownloadingOutlineId] = useState<number | null>(null);
  const [deletingOutlineId, setDeletingOutlineId] = useState<number | null>(null);
  const [outlinePendingDelete, setOutlinePendingDelete] = useState<{
    outlineId: number;
    courseCode?: string;
  } | null>(null);

  const programId = searchParams.get("programId");
  const courseId = searchParams.get("courseId");
  const selectedCourseId = courseId ? Number(courseId) : 0;

  const [loading, error, data, refetchOutlines] = useFetchData(getOutlines);

  if (!hasPermission(ENDPOINT_PERMISSIONS.outlines.READ)) {
    return <PermissionProtectedPage />;
  }

  if (loading) return <div className="p-6 text-[#111827]">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading outlines</div>;

  const allOutlines = data.outlines || [];
  let filteredOutlines = allOutlines;

  if (programId) {
    filteredOutlines = filteredOutlines.filter((outline: any) => outline.programId === parseInt(programId));
  }

  if (courseId) {
    filteredOutlines = filteredOutlines.filter((outline: any) => outline.courseId === parseInt(courseId));
  }

  const handleDownloadOutline = async (outlineId: number, courseCode?: string) => {
    try {
      setDownloadingOutlineId(outlineId);
      const response = await getOutlinePdfById(outlineId);
      const pdfBlob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "application/pdf" });

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${courseCode || `outline-${outlineId}`}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      console.error("Failed to download outline PDF", downloadError);
    } finally {
      setDownloadingOutlineId(null);
    }
  };

  const handleDeleteOutline = async (outlineId: number) => {
    try {
      setDeletingOutlineId(outlineId);
      await deleteOutlineById(outlineId);
      await refetchOutlines();
    } catch (deleteError) {
      console.error("Failed to delete outline", deleteError);
    } finally {
      setDeletingOutlineId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#f8f8f8] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Course Outlines</h1>
          <p className="text-sm text-[#6b7280]">Manage your course outlines</p>
        </div>

        <div className="flex gap-2">
          <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.WRITE}>
            <CreateOutlineDialog courseId={selectedCourseId} />
          </PermissionGate>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
        <div className="px-6 py-4 border-b border-[#e5e7eb]">
          <h3 className="text-lg font-semibold text-[#111827]">My Course Outlines</h3>
          <p className="text-sm text-[#6b7280] mt-1">
            View and manage your outlines
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e5e7eb] bg-[#f8f8f8]">
                <TableHead className="text-[#111827] font-semibold">Course Code</TableHead>
                <TableHead className="text-[#111827] font-semibold">Course Name</TableHead>
                <TableHead className="text-[#111827] font-semibold">Program</TableHead>
                <TableHead className="text-[#111827] font-semibold">Department</TableHead>
                <TableHead className="text-[#111827] font-semibold">Academic Year</TableHead>
                <TableHead className="text-[#111827] font-semibold">Semester</TableHead>
                <TableHead className="text-[#111827] font-semibold">Status</TableHead>
                <TableHead className="text-right text-[#111827] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOutlines.map((item: any) => (
                <TableRow key={item.outlineId} className="border-b border-[#e5e7eb] hover:bg-[#f8f8f8]">
                  <TableCell className="text-[#111827]">{item.courseCode}</TableCell>
                  <TableCell className="text-[#111827]">{item.courseName}</TableCell>
                  <TableCell className="text-[#6b7280]">{item.programName}</TableCell>
                  <TableCell className="text-[#6b7280]">{item.departmentName}</TableCell>
                  <TableCell className="text-[#111827]">{item.academicYear}</TableCell>
                  <TableCell className="text-[#111827]">{item.semester}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>

                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/admin/teacher-outlines/${item.outlineId}`)}
                      className="text-[#ef233c] hover:bg-[#fff1f2]"
                    >
                      <Eye size={16} />
                    </Button>

                    {item.status !== "published" ? (
                      <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.EDIT}>
                        <CreateOutlineDialog
                          courseId={item.courseId}
                          outlineId={item.outlineId}
                          trigger={
                            <Button size="icon" variant="ghost" className="text-[#ef233c] hover:bg-[#fff1f2]">
                              <Pencil size={16} />
                            </Button>
                          }
                        />
                      </PermissionGate>
                    ) : null}

                    <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.DELETE}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setOutlinePendingDelete({
                            outlineId: item.outlineId,
                            courseCode: item.courseCode,
                          })
                        }
                        disabled={deletingOutlineId === item.outlineId}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </PermissionGate>

                    <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.DOWNLOAD}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleDownloadOutline(item.outlineId, item.courseCode)
                        }
                        disabled={downloadingOutlineId === item.outlineId}
                        className="text-[#6b7280] hover:bg-[#f8f8f8]"
                      >
                        <Download size={16} />
                      </Button>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={Boolean(outlinePendingDelete)}
        onOpenChange={(open) => {
          if (!open && deletingOutlineId === null) {
            setOutlinePendingDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white border border-[#e5e7eb] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-[#111827]">Delete outline?</DialogTitle>
            <DialogDescription className="text-[#6b7280]">
              This action cannot be undone.{" "}
              {outlinePendingDelete?.courseCode
                ? `The outline for ${outlinePendingDelete.courseCode} will be permanently removed.`
                : "This outline will be permanently removed."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOutlinePendingDelete(null)}
              disabled={deletingOutlineId !== null}
              className="border border-[#e5e7eb] text-[#111827] hover:bg-[#f8f8f8]"
            >
              Cancel
            </Button>

            <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.DELETE}>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!outlinePendingDelete) return;
                  await handleDeleteOutline(outlinePendingDelete.outlineId);
                  setOutlinePendingDelete(null);
                }}
                disabled={
                  !outlinePendingDelete ||
                  deletingOutlineId === outlinePendingDelete.outlineId
                }
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm delete
              </Button>
            </PermissionGate>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}