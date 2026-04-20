import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetchData from "@/hooks/use-fetch-data";
import { getOutlineById } from "@/services/outlines";
import type { OutlineById, OutlineContentItem, OutlineObjective, OutlineWeeklyTopic } from "@/services/outlines/get-outline-by-id";

const keyValueClassName = "text-sm text-white/80";

const renderEmpty = (value?: string | null) => value && value.trim() ? value : "-";

export default function TeacherOutlineDetailsPage() {
  const navigate = useNavigate();
  const params = useParams();
  const outlineId = Number(params.outlineId);
  const isValidOutlineId = Number.isFinite(outlineId) && outlineId > 0;

  const [loading, error, outlineData] = useFetchData(
    () => getOutlineById(outlineId),
    [outlineId],
    { enabled: isValidOutlineId }
  );

  if (loading) {
    return <div className="p-6 text-white">Loading outline details...</div>;
  }

  if (error || !outlineData.outline) {
    return <div className="p-6 text-red-400">Unable to load outline details.</div>;
  }

  const outline: OutlineById = outlineData.outline;

  const sortedLearningOutcomes =
    [...(outline.learningOutcomes || [])].sort((a, b) => Number(a.cloNumber) - Number(b.cloNumber));

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Course Outline Details</h1>
          <p className="text-sm text-gray-400">
            {outline.courseCode} - {outline.courseName}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <Card className="border-white/10 bg-[#141414]">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <p className={keyValueClassName}>Status: {outline.status}</p>
          <p className={keyValueClassName}>Version: {outline.versionNo}</p>
          <p className={keyValueClassName}>Academic Year: {outline.academicYear}</p>
          <p className={keyValueClassName}>Semester: {outline.semester}</p>
          <p className={keyValueClassName}>Course Language: {outline.courseLanguage}</p>
          <p className={keyValueClassName}>Course Category: {outline.courseCategory}</p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#141414]">
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white/90">Objectives</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
              {(outline.objectives || []).map((item: OutlineObjective) => (
                <li key={item.objectiveId}>{renderEmpty(item.objectiveText)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/90">Content Items</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
              {(outline.contentItems || []).map((item: OutlineContentItem) => (
                <li key={item.contentItemId}>{renderEmpty(item.contentText)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/90">Learning Outcomes</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
              {sortedLearningOutcomes.map((item) => (
                <li key={item.cloId}>
                  CLO-{item.cloNumber}: {renderEmpty(item.statement)}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#141414]">
        <CardHeader>
          <CardTitle>Weekly Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(outline.weeklyTopics || []).map((topic: OutlineWeeklyTopic) => (
            <div key={topic.weeklyTopicId} className="rounded-md border border-white/10 p-3">
              <p className="text-sm font-medium">
                Week {topic.weekNo}: {renderEmpty(topic.subjectTitle)}
              </p>
              <p className="mt-1 text-sm text-white/75">Details: {renderEmpty(topic.detailsText)}</p>
              <p className="mt-1 text-sm text-white/75">
                Private Study: {renderEmpty(topic.tasksPrivateStudyText)}
              </p>
              <p className="mt-1 text-sm text-white/75">
                CLOs: {(topic.clos || []).length ? topic.clos.map((clo) => `CLO-${clo.cloNumber}`).join(", ") : "-"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
