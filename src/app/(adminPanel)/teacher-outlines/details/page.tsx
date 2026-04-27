import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetchData from "@/hooks/use-fetch-data";
import { getOutlineById } from "@/services/outlines";
import type { OutlineById, OutlineContentItem, OutlineObjective, OutlineWeeklyTopic } from "@/services/outlines/get-outline-by-id";

const keyValueClassName = "text-sm text-white/80";
const richTextClassName =
  "text-sm text-white/80 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1";

const renderEmpty = (value?: string | null) => value && value.trim() ? value : "-";
const renderRichText = (value?: string | null) => {
  const safeValue = value && value.trim() ? value : "<p>-</p>";

  return <div className={richTextClassName} dangerouslySetInnerHTML={{ __html: safeValue }} />;
};

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
  const sortedProgramLearningOutcomes =
    [...(outline.programLearningOutcomes || [])].sort((a, b) => Number(a.ploNumber) - Number(b.ploNumber));

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
            <ul className="mt-2 space-y-2">
              {(outline.objectives || []).map((item: OutlineObjective) => (
                <li key={item.objectiveId}>{renderRichText(item.objectiveText)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/90">Content Items</h3>
            <ul className="mt-2 space-y-2">
              {(outline.contentItems || []).map((item: OutlineContentItem) => (
                <li key={item.contentItemId}>{renderRichText(item.contentText)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/90">Learning Outcomes</h3>
            <ul className="mt-2 space-y-2">
              {sortedLearningOutcomes.map((item) => (
                <li key={item.cloId}>
                  <span className="text-sm text-white/80">CLO-{item.cloNumber}:</span>
                  {renderRichText(item.statement)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white/90">Program Learning Outcomes</h3>
            <ul className="mt-2 space-y-2">
              {sortedProgramLearningOutcomes.map((item) => (
                <li key={item.ploId}>
                  <span className="text-sm text-white/80">PLO-{item.ploNumber}:</span>
                  {renderRichText(item.statement)}
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
              <div className="mt-1 text-sm text-white/75">
                <span>Details:</span>
                {renderRichText(topic.detailsText)}
              </div>
              <div className="mt-1 text-sm text-white/75">
                <span>Private Study:</span>
                {renderRichText(topic.tasksPrivateStudyText)}
              </div>
              <p className="mt-1 text-sm text-white/75">
                CLOs: {(topic.clos || []).length ? topic.clos.map((clo) => `CLO-${clo.cloNumber}`).join(", ") : "-"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#141414]">
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-white/90">Textbooks</h3>
            {renderRichText(outline.textbooksText)}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/90">Additional Reading</h3>
            {renderRichText(outline.additionalReadingText)}
          </div>
          <p className={keyValueClassName}>Office Hours: {renderEmpty(outline.officeHours)}</p>
          <p className={keyValueClassName}>Office Code: {renderEmpty(outline.officeCode)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
