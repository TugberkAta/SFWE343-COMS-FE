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
import { toast } from "sonner";
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
    published: "bg-green-500/10 text-green-400 border border-green-500/20",
    pending: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    draft: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-md ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function TeacherOutlinesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = usePermission();

  const [downloadingOutlineId, setDownloadingOutlineId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [deletingOutlineId, setDeletingOutlineId] = useState<number | null>(null);
  const [outlinePendingDelete, setOutlinePendingDelete] = useState<{
    outlineId: number;
    courseCode?: string;
  } | null>(null);

  const programId = searchParams.get("programId");
  const courseId = searchParams.get("courseId");
  const selectedCourseId = courseId ? Number(courseId) : 0;

  const [loading, error, data, refetchOutlines] = useFetchData(getOutlines);

  const getOutlinePdfFileName = (
    courseCode?: string,
    courseName?: string,
    outlineId?: number,
  ) => {
    if (courseCode && courseName) {
      const safeCourseName = courseName
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9_-]/g, "");
      return `${courseCode}-${safeCourseName}.pdf`;
    }

    return `${courseCode || `outline-${outlineId}`}.pdf`;
  };

  if (!hasPermission(ENDPOINT_PERMISSIONS.outlines.READ)) {
    return <PermissionProtectedPage />;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading outlines</div>;

  const allOutlines = data.outlines || [];
  let filteredOutlines = allOutlines;

  if (programId) {
    filteredOutlines = filteredOutlines.filter((outline: any) => outline.programId === parseInt(programId));
  }

  if (courseId) {
    filteredOutlines = filteredOutlines.filter((outline: any) => outline.courseId === parseInt(courseId));
  }

  const handleDownloadOutline = async (
    outlineId: number,
    courseCode?: string,
    courseName?: string,
  ) => {
    setDownloadError(null);
    try {
      setDownloadingOutlineId(outlineId);
      const response = await getOutlinePdfById(outlineId);
      const pdfBlob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: "application/pdf" });

      if (pdfBlob.size === 0) {
        throw new Error("Downloaded PDF is empty");
      }

      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");

      link.href = url;
      link.download = getOutlinePdfFileName(courseCode, courseName, outlineId);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : "Failed to download outline PDF";
      toast.error(message);
      setDownloadError(message);
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
    <div className="p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Course Outlines</h1>
          <p className="text-sm text-gray-400">Manage your course outlines</p>
        </div>

        <div className="flex gap-2">
          <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.WRITE}>
            <CreateOutlineDialog courseId={selectedCourseId} />
          </PermissionGate>
        </div>
      </div>

      {downloadError ? (
        <div className="text-sm text-destructive">Download error: {downloadError}</div>
      ) : null}
      {downloadingOutlineId !== null ? (
        <div className="text-sm text-gray-300">Downloading outline...</div>
      ) : null}

      <Card className="bg-[#141414] border-white/10">
        <CardHeader>
          <CardTitle>My Course Outlines</CardTitle>
          <CardDescription className="text-gray-400">
            View and manage your outlines
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOutlines.map((item: any) => (
                <TableRow key={item.outlineId} className="border-white/10">
                  <TableCell>{item.courseCode}</TableCell>
                  <TableCell>{item.courseName}</TableCell>
                  <TableCell>{item.programName}</TableCell>
                  <TableCell>{item.departmentName}</TableCell>
                  <TableCell>{item.academicYear}</TableCell>
                  <TableCell>{item.semester}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>

                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/admin/teacher-outlines/${item.outlineId}`)}
                    >
                      <Eye size={16} />
                    </Button>

                    {item.status !== "published" ? (
                      <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.EDIT}>
                        <CreateOutlineDialog
                          courseId={item.courseId}
                          outlineId={item.outlineId}
                          trigger={
                            <Button size="icon" variant="ghost">
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
                      >
                        <Trash2 size={16} />
                      </Button>
                    </PermissionGate>

                    <PermissionGate permission={ENDPOINT_PERMISSIONS.outlines.DOWNLOAD}>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          handleDownloadOutline(item.outlineId, item.courseCode, item.courseName)
                        }
                        disabled={downloadingOutlineId === item.outlineId}
                      >
                        <Download size={16} />
                      </Button>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(outlinePendingDelete)}
        onOpenChange={(open) => {
          if (!open && deletingOutlineId === null) {
            setOutlinePendingDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete outline?</DialogTitle>
            <DialogDescription>
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