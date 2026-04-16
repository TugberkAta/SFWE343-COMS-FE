import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2, Download } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import useFetchData from "@/hooks/use-fetch-data";
import { getOutlines } from "@/services/outlines";

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
  const [searchParams] = useSearchParams();
  const programId = searchParams.get("programId");

  const [loading, error, data] = useFetchData(getOutlines);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading outlines</div>;

  const allOutlines = data.outlines || [];
  let filteredOutlines = allOutlines;

  if (programId) {
    filteredOutlines = filteredOutlines.filter((outline: any) => outline.programId === parseInt(programId));
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Course Outlines</h1>
          <p className="text-sm text-gray-400">
            Manage your course outlines
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
            Export All PDF
          </Button>
          <Button className="bg-white text-black hover:bg-gray-200">
            + Create Outline
          </Button>
        </div>
      </div>

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
                    <Button size="icon" variant="ghost">
                      <Eye size={16} />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Pencil size={16} />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Trash2 size={16} />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Download size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>
    </div>
  );
}