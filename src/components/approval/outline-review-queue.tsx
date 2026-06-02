"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkflowStatusBadge from "@/components/approval/workflow-status-badge";
import type { Outline } from "@/services/outlines";

type OutlineReviewQueueProps = {
  outlines: Outline[];
  emptyMessage: string;
  onReview: (outline: Outline) => void;
};

function formatTerm(outline: Outline) {
  return [outline.academicYear, outline.semester].filter(Boolean).join(" · ");
}

export default function OutlineReviewQueue({
  outlines,
  emptyMessage,
  onReview,
}: OutlineReviewQueueProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue</CardTitle>
        <CardDescription>Outlines waiting for your action</CardDescription>
      </CardHeader>
      <CardContent>
        {outlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outlines.map((outline) => (
                <TableRow key={outline.outlineId}>
                  <TableCell>
                    <div className="font-medium">{outline.courseCode}</div>
                    <div className="text-sm text-muted-foreground">
                      {outline.courseName}
                    </div>
                  </TableCell>
                  <TableCell>{outline.programName}</TableCell>
                  <TableCell>{outline.departmentName}</TableCell>
                  <TableCell>{formatTerm(outline)}</TableCell>
                  <TableCell>{outline.submissionCount ?? 1}</TableCell>
                  <TableCell>
                    <WorkflowStatusBadge
                      status={outline.status}
                      stage={outline.currentStage}
                    />
                  </TableCell>
                  <TableCell>
                    {outline.updatedAt
                      ? new Date(outline.updatedAt).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(
                            `/admin/teacher-outlines/${outline.outlineId}`,
                          )
                        }
                      >
                        <Eye className="size-4" />
                        View
                      </Button>
                      <Button size="sm" onClick={() => onReview(outline)}>
                        Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
