"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Circle, FileText, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/customDialogContent";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor";
import useFetchData from "@/hooks/use-fetch-data";
import Authentication from "@/services/auth/authentication";
import { getCourses, type Course } from "@/services/courses";
import { getOutlineById, patchCourseOutline, postCourseOutline } from "@/services/outlines";
import type { OutlineById } from "@/services/outlines/get-outline-by-id";
import type { PostCourseOutlineBody } from "@/services/outlines/post-course-outline";
import type { PatchCourseOutlineBody } from "@/services/outlines/patch-course-outline";
import { getTerms, type Term } from "@/services/terms";
import getUsersWithRole from "@/services/users/users-with-role";
import type { UserWithRole } from "@/types/user-with-role";

const tabNames = [
  "Basic Info",
  "Content & Objectives",
  "Learning Outcomes (CLOs)",
  "Weekly Plan",
  "Evaluation",
  "Schedule",
  "Resources",
  "Review & Publish",
] as const;

type TabName = (typeof tabNames)[number];

const inputClassName = "bg-[#101010] border-white/10 text-white";
const MIN_CLO_COUNT = 5;
const ASSESSMENT_WEIGHT_TARGET = 100;
const ASSESSMENT_WEIGHT_TOLERANCE = 0.001;
const WORKLOAD_DIVISOR = 25;
const WORKLOAD_ECTS_SLACK = 1.0;
const richTextPreviewClassName =
  "max-w-none text-sm text-gray-300 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1";

type CreateOutlineDialogProps = {
  courseId: number;
  outlineId?: number;
  trigger?: ReactNode;
};

export default function CreateOutlineDialog({ courseId, outlineId, trigger }: CreateOutlineDialogProps) {
  const auth = useMemo(() => new Authentication(), []);
  const currentUser = useMemo(() => auth.getCurrentUser(), [auth]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = tabNames[activeTabIndex];
  const isUpdateMode = Number.isFinite(outlineId) && Number(outlineId) > 0;
  const [loadingTerms, termsError, termsData] = useFetchData(getTerms);

  const [loadingUsers, usersError, usersData] = useFetchData(
    () => getUsersWithRole(),
    []
  );
  const [loadingCourses, coursesError, coursesData] = useFetchData(getCourses);
  const [, , outlineData] = useFetchData(
    () => getOutlineById(Number(outlineId)),
    [outlineId],
    { enabled: isUpdateMode }
  );

  const terms: Term[] = termsData.terms || [];
  const approvedUsers: UserWithRole[] = usersData.users || [];
  const courses: Course[] = coursesData.courses || [];
  const termOptions = useMemo(
    () =>
      terms.map((term) => ({
        value: String(term.termId),
        label: `${term.academicYear} - ${term.semester}`,
      })),
    [terms]
  );
  const approvedUserOptions = useMemo(
    () =>
      approvedUsers.map((user) => ({
        value: String(user.userId),
        label: [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email,
      })),
    [approvedUsers]
  );
  const existingOutline = outlineData?.outline as OutlineById | undefined;

  const toOutlineFormValues = (outline: OutlineById): PostCourseOutlineBody => {
    const outlineWithAssistants = outline as OutlineById & { assistantUserIds?: number[] };
    const normalizedAssistantUserIds = Array.isArray(outlineWithAssistants.assistantUserIds)
      ? outlineWithAssistants.assistantUserIds
      : outline.assistantUserId
        ? [outline.assistantUserId]
        : [];

    return {
      courseId: outline.courseId,
      termId: outline.termId,
      lecturerUserId: outline.lecturerUserId,
      assistantUserIds: normalizedAssistantUserIds,
      textbooksText: outline.textbooksText || "",
      additionalReadingText: outline.additionalReadingText || "",
      createdByUserId: currentUser?.userId ?? outline.createdByUserId ?? 0,
      objectives: outline.objectives?.length
        ? outline.objectives.map((item) => ({ description: item.objectiveText || "" }))
        : [{ description: "" }],
      contentItems: outline.contentItems?.length
        ? outline.contentItems.map((item) => ({ description: item.contentText || "" }))
        : [{ description: "" }],
      learningOutcomes:
        outline.learningOutcomes?.length >= MIN_CLO_COUNT
          ? outline.learningOutcomes.map((item) => ({
              cloCode: `CLO-${item.cloNumber}`,
              description: item.statement || "",
            }))
          : [
              ...(outline.learningOutcomes || []).map((item) => ({
                cloCode: `CLO-${item.cloNumber}`,
                description: item.statement || "",
              })),
              ...Array.from(
                { length: Math.max(MIN_CLO_COUNT - (outline.learningOutcomes?.length || 0), 0) },
                (_, index) => ({
                  cloCode: `CLO-${(outline.learningOutcomes?.length || 0) + index + 1}`,
                  description: "",
                })
              ),
            ],
      weeklyTopics: outline.weeklyTopics?.length
        ? outline.weeklyTopics.map((item, index) => ({
            weekNo: item.weekNo || index + 1,
            weekDate: item.weekDate,
            subjectTitle: item.subjectTitle || "",
            detailsText: item.detailsText || "",
            tasksPrivateStudyText: item.tasksPrivateStudyText || "",
            clos: (item.clos || []).map((clo) => ({ cloCode: `CLO-${clo.cloNumber}` })),
          }))
        : [
            {
              weekNo: 1,
              weekDate: null,
              subjectTitle: "",
              detailsText: "",
              tasksPrivateStudyText: "",
              clos: [],
            },
          ],
      workloadItems: outline.workloadItems?.length
        ? outline.workloadItems.map((item) => ({
            activity: item.activityType || "",
            hours: item.durationHours || 0,
          }))
        : [{ activity: "", hours: 0 }],
      evaluationItems: outline.evaluationItems?.length
        ? outline.evaluationItems.map((item) => ({
            title: item.name || "",
            weight: item.weightPercent || 0,
            clos: (item.clos || []).map((clo) => ({ cloCode: `CLO-${clo.cloNumber}` })),
          }))
        : [{ title: "", weight: 0, clos: [] }],
    };
  };

  const form = useForm<PostCourseOutlineBody>({
    defaultValues: {
      courseId,
      termId: 0,
      lecturerUserId: 0,
      assistantUserIds: [],
      textbooksText: "",
      additionalReadingText: "",
      createdByUserId: currentUser?.userId ?? 0,
      objectives: [{ description: "" }],
      contentItems: [{ description: "" }],
      learningOutcomes: Array.from({ length: MIN_CLO_COUNT }, (_, index) => ({
        cloCode: `CLO-${index + 1}`,
        description: "",
      })),
      weeklyTopics: [
        {
          weekNo: 1,
          weekDate: null,
          subjectTitle: "",
          detailsText: "",
          tasksPrivateStudyText: "",
          clos: [],
        },
      ],
      workloadItems: [{ activity: "", hours: 0 }],
      evaluationItems: [{ title: "", weight: 0, clos: [] }],
    },
  });

  const getAssessmentWeightTotal = (evaluationItems: PostCourseOutlineBody["evaluationItems"]) =>
    evaluationItems.reduce((sum, item) => sum + Number(item.weight || 0), 0);

  const isAssessmentWeightValid = (evaluationItems: PostCourseOutlineBody["evaluationItems"]) =>
    Math.abs(getAssessmentWeightTotal(evaluationItems) - ASSESSMENT_WEIGHT_TARGET) < ASSESSMENT_WEIGHT_TOLERANCE;
  const selectedCourseId = form.watch("courseId");
  const selectedCourse = useMemo(
    () => courses.find((course) => course.courseId === selectedCourseId),
    [courses, selectedCourseId]
  );
  const selectedCourseEcts = selectedCourse?.ectsCredits;
  const getWorkloadTotalHours = (workloadItems: PostCourseOutlineBody["workloadItems"]) =>
    workloadItems.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const isWorkloadLimitValid = (
    workloadItems: PostCourseOutlineBody["workloadItems"],
    ectsCredits?: number
  ) => {
    if (!Number.isFinite(ectsCredits) || (ectsCredits ?? 0) <= 0) {
      return true;
    }

    return getWorkloadTotalHours(workloadItems) / WORKLOAD_DIVISOR < (ectsCredits ?? 0) + WORKLOAD_ECTS_SLACK;
  };

  const renderRichText = (value?: string) => {
    const safeValue = value?.trim() ? value : "<p>-</p>";

    return (
      <div
        className={richTextPreviewClassName}
        dangerouslySetInnerHTML={{ __html: safeValue }}
      />
    );
  };

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: "objectives",
  });
  const { fields: contentItemFields, append: appendContentItem, remove: removeContentItem } = useFieldArray({
    control: form.control,
    name: "contentItems",
  });
  const {
    fields: learningOutcomeFields,
    append: appendLearningOutcome,
    remove: removeLearningOutcome,
  } = useFieldArray({
    control: form.control,
    name: "learningOutcomes",
  });
  const { fields: weeklyTopicFields, append: appendWeeklyTopic, remove: removeWeeklyTopic } = useFieldArray({
    control: form.control,
    name: "weeklyTopics",
  });
  const {
    fields: evaluationItemFields,
    append: appendEvaluationItem,
    remove: removeEvaluationItem,
  } = useFieldArray({
    control: form.control,
    name: "evaluationItems",
  });
  const { fields: workloadItemFields, append: appendWorkloadItem, remove: removeWorkloadItem } = useFieldArray({
    control: form.control,
    name: "workloadItems",
  });

  useEffect(() => {
    form.setValue("courseId", courseId, { shouldValidate: true });
  }, [courseId, form]);

  useEffect(() => {
    form.setValue("createdByUserId", currentUser?.userId ?? 0, { shouldValidate: true });
  }, [currentUser?.userId, form]);

  useEffect(() => {
    if (!existingOutline) return;

    form.reset(toOutlineFormValues(existingOutline));
    setActiveTabIndex(0);
  }, [existingOutline, form, currentUser?.userId]);

  useEffect(() => {
    learningOutcomeFields.forEach((_, index) => {
      form.setValue(`learningOutcomes.${index}.cloCode`, `CLO-${index + 1}`, {
        shouldValidate: false,
        shouldDirty: false,
      });
    });
  }, [form, learningOutcomeFields]);

  useEffect(() => {
    if (learningOutcomeFields.length >= MIN_CLO_COUNT) {
      form.clearErrors("learningOutcomes");
    }
  }, [form, learningOutcomeFields.length]);

  useEffect(() => {
    weeklyTopicFields.forEach((_, index) => {
      form.setValue(`weeklyTopics.${index}.weekNo`, index + 1, {
        shouldValidate: false,
        shouldDirty: false,
      });
    });
  }, [form, weeklyTopicFields]);

  const cloOptions = useMemo(
    () => learningOutcomeFields.map((_, index) => `CLO-${index + 1}`),
    [learningOutcomeFields]
  );

  const tabs = useMemo(
    () =>
      tabNames.map((name, index) => ({
        name,
        icon: FileText,
        onClick: () => setActiveTabIndex(index),
      })),
    []
  );

  const goToNextTab = async () => {
    const fieldsToValidate: Record<TabName, string[]> = {
      "Basic Info": [
        "courseId",
        "termId",
        "versionNo",
        "status",
        "lecturerUserId",
      ],
      "Content & Objectives": ["objectives.0.description", "contentItems.0.description"],
      "Learning Outcomes (CLOs)": ["learningOutcomes.0.cloCode", "learningOutcomes.0.description"],
      "Weekly Plan": [
        "weeklyTopics.0.weekNo",
        "weeklyTopics.0.subjectTitle",
        "weeklyTopics.0.detailsText",
        "weeklyTopics.0.tasksPrivateStudyText",
        "weeklyTopics.0.clos",
      ],
      Evaluation: ["evaluationItems.0.title", "evaluationItems.0.weight", "evaluationItems.0.clos"],
      Schedule: ["workloadItems.0.activity", "workloadItems.0.hours"],
      Resources: [
        "textbooksText",
        "additionalReadingText",
      ],
      "Review & Publish": [],
    };

    const isValid = await form.trigger(fieldsToValidate[activeTab] as never);
    if (activeTab === "Learning Outcomes (CLOs)" && learningOutcomeFields.length < MIN_CLO_COUNT) {
      form.setError("learningOutcomes", {
        type: "manual",
        message: `At least ${MIN_CLO_COUNT} CLOs are required.`,
      });
      return;
    }
    if (activeTab === "Evaluation") {
      const evaluationItems = form.getValues("evaluationItems");
      if (!isAssessmentWeightValid(evaluationItems)) {
        form.setError("evaluationItems", {
          type: "manual",
          message: `Evaluation weights must sum to ${ASSESSMENT_WEIGHT_TARGET}%.`,
        });
        return;
      }
      form.clearErrors("evaluationItems");
    }
    if (activeTab === "Schedule") {
      const workloadItems = form.getValues("workloadItems");
      if (!isWorkloadLimitValid(workloadItems, selectedCourseEcts)) {
        form.setError("workloadItems", {
          type: "manual",
          message: `Total workload / ${WORKLOAD_DIVISOR} must be less than ECTS + ${WORKLOAD_ECTS_SLACK.toFixed(1)}.`,
        });
        return;
      }
      form.clearErrors("workloadItems");
    }
    if (!isValid) return;

    setActiveTabIndex((current) => Math.min(current + 1, tabNames.length - 1));
  };

  const onSubmit = async (values: PostCourseOutlineBody) => {
    if (values.learningOutcomes.length < MIN_CLO_COUNT) {
      form.setError("learningOutcomes", {
        type: "manual",
        message: `At least ${MIN_CLO_COUNT} CLOs are required.`,
      });
      return;
    }
    if (!isAssessmentWeightValid(values.evaluationItems)) {
      form.setError("evaluationItems", {
        type: "manual",
        message: `Evaluation weights must sum to ${ASSESSMENT_WEIGHT_TARGET}%.`,
      });
      return;
    }
    form.clearErrors("evaluationItems");
    if (!isWorkloadLimitValid(values.workloadItems, selectedCourseEcts)) {
      form.setError("workloadItems", {
        type: "manual",
        message: `Total workload / ${WORKLOAD_DIVISOR} must be less than ECTS + ${WORKLOAD_ECTS_SLACK.toFixed(1)}.`,
      });
      return;
    }
    form.clearErrors("workloadItems");

    if (isUpdateMode && outlineId) {
      const patchPayload: PatchCourseOutlineBody = {
        lecturerUserId: values.lecturerUserId,
        assistantUserIds: values.assistantUserIds,
        textbooksText: values.textbooksText,
        additionalReadingText: values.additionalReadingText,
        objectives: values.objectives,
        contentItems: values.contentItems,
        learningOutcomes: values.learningOutcomes,
        weeklyTopics: values.weeklyTopics,
        workloadItems: values.workloadItems,
        evaluationItems: values.evaluationItems,
      };

      await patchCourseOutline(Number(outlineId), patchPayload);
      return;
    }

    await postCourseOutline(values);
  };

  const renderCurrentTab = () => {
    switch (activeTab) {
      case "Basic Info":
        return (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="termId"
              rules={{ required: "Term is required", min: 1 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Term</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                      disabled={loadingTerms}
                    >
                      <SelectTrigger className={`${inputClassName} w-full`}>
                        <SelectValue placeholder={loadingTerms ? "Loading terms..." : "Select a term"} />
                      </SelectTrigger>
                      <SelectContent>
                        {termOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {termsError ? (
                    <p className="text-sm text-red-400">Failed to load terms.</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lecturerUserId"
              rules={{ required: "Lecturer is required", min: 1 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Lecturer</FormLabel>
                  <FormControl>
                    <Combobox
                      items={approvedUserOptions}
                      value={approvedUserOptions.find((option) => option.value === String(field.value))}
                      onValueChange={(value) => field.onChange(value ? Number(value.value) : 0)}
                      disabled={loadingUsers || approvedUserOptions.length === 0}
                    >
                      <ComboboxTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between border-white/10 bg-[#101010] font-normal text-white hover:bg-[#101010] hover:text-white"
                          >
                            <span className="truncate">
                              {approvedUserOptions.find((option) => option.value === String(field.value))?.label ??
                                (loadingUsers ? "Loading users..." : "Select lecturer")}
                            </span>
                          </Button>
                        }
                      />
                      <ComboboxContent>
                        <ComboboxInput showTrigger={false} placeholder="Search lecturer..." />
                        <ComboboxEmpty>No users found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </FormControl>
                  {usersError ? (
                    <p className="text-sm text-red-400">Failed to load approved users.</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assistantUserIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assistants</FormLabel>
                  <FormControl>
                    <Combobox
                      multiple
                      items={approvedUserOptions}
                      value={approvedUserOptions.filter((option) =>
                        field.value.includes(Number(option.value))
                      )}
                      onValueChange={(value) => {
                        const selectedValues = Array.isArray(value) ? value : [];
                        const normalizedAssistantIds = selectedValues
                          .map((item) => (typeof item === "string" ? Number(item) : Number(item.value)))
                          .filter((id) => Number.isFinite(id) && id > 0);

                        field.onChange(normalizedAssistantIds);
                      }}
                      disabled={loadingUsers || approvedUserOptions.length === 0}
                    >
                      <ComboboxTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between border-white/10 bg-[#101010] font-normal text-white hover:bg-[#101010] hover:text-white"
                          >
                            <span className="truncate">
                              {field.value.length > 0
                                ? approvedUserOptions
                                    .filter((option) => field.value.includes(Number(option.value)))
                                    .map((option) => option.label)
                                    .join(", ")
                                : loadingUsers
                                  ? "Loading users..."
                                  : "Select assistants (optional)"}
                            </span>
                          </Button>
                        }
                      />
                      <ComboboxContent>
                        <ComboboxInput showTrigger={false} placeholder="Search assistants..." />
                        <ComboboxEmpty>No users found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </FormControl>
                  {usersError ? (
                    <p className="text-sm text-red-400">Failed to load approved users.</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case "Content & Objectives":
        return (
          <div className="space-y-4">
            <div className="space-y-3 rounded-md border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Course Objectives</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendObjective({ description: "" })}
                >
                  <Plus className="mr-1 size-4" />
                  Add Course Objective
                </Button>
              </div>
              {objectiveFields.map((item, index) => (
                <div key={item.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`objectives.${index}.description`}
                    rules={{ required: "Objective description is required" }}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder={`Objective ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={objectiveFields.length === 1}
                    onClick={() => removeObjective(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-md border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Content Items</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendContentItem({ description: "" })}
                >
                  <Plus className="mr-1 size-4" />
                  Add Content Item
                </Button>
              </div>
              {contentItemFields.map((item, index) => (
                <div key={item.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`contentItems.${index}.description`}
                    rules={{ required: "Content item description is required" }}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder={`Content item ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={contentItemFields.length === 1}
                    onClick={() => removeContentItem(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case "Learning Outcomes (CLOs)":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Learning Outcomes</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLearningOutcome({ cloCode: "", description: "" })}
              >
                <Plus className="mr-1 size-4" />
                Add CLO
              </Button>
            </div>
            {form.formState.errors.learningOutcomes?.message ? (
              <p className="text-sm text-red-400">
                {String(form.formState.errors.learningOutcomes.message)}
              </p>
            ) : null}
            {learningOutcomeFields.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-md border border-white/10 p-3">
                <div className="grid grid-cols-[180px_1fr_auto] gap-2">
                  <FormField
                    control={form.control}
                    name={`learningOutcomes.${index}.cloCode`}
                    rules={{ required: "CLO code is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CLO Code</FormLabel>
                        <FormControl>
                          <Input {...field} className={inputClassName} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`learningOutcomes.${index}.description`}
                    rules={{ required: "Learning outcome description is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Description</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Write CLO statement..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-start mt-6"
                    disabled={learningOutcomeFields.length <= MIN_CLO_COUNT}
                    onClick={() => removeLearningOutcome(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      case "Weekly Plan":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Weekly Topics</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendWeeklyTopic({
                    weekNo: weeklyTopicFields.length + 1,
                    weekDate: null,
                    subjectTitle: "",
                    detailsText: "",
                    tasksPrivateStudyText: "",
                    clos: [],
                  })
                }
              >
                <Plus className="mr-1 size-4" />
                Add Week
              </Button>
            </div>
            {weeklyTopicFields.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-md border border-white/10 p-3">
                <div className="grid grid-cols-[120px_200px_1fr_auto] gap-2">
                  <FormField
                    control={form.control}
                    name={`weeklyTopics.${index}.weekNo`}
                    rules={{ required: "Week number is required", min: 1 }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Week</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                            className={inputClassName}
                            min={1}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`weeklyTopics.${index}.weekDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Week Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ?? ""}
                            onChange={(event) => field.onChange(event.target.value || null)}
                            className={inputClassName}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`weeklyTopics.${index}.subjectTitle`}
                    rules={{ required: "Subject title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Subject Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className={inputClassName}
                            placeholder="Subject title..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={weeklyTopicFields.length === 1}
                    onClick={() => removeWeeklyTopic(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`weeklyTopics.${index}.detailsText`}
                  rules={{ required: "Details are required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Details</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Week details..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`weeklyTopics.${index}.tasksPrivateStudyText`}
                  rules={{ required: "Private study tasks are required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Tasks / Private Study</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Private study tasks..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`weeklyTopics.${index}.clos`}
                  rules={{
                    validate: (value) =>
                      value.length > 0 || "At least one related CLO is required",
                  }}
                  render={({ field }) => {
                    const selectedCloCodes = field.value.map((closItem) => closItem.cloCode);
                    const selectedCloCodeSet = new Set(selectedCloCodes);
                    const availableCloOptions = cloOptions.filter((cloCode) => !selectedCloCodeSet.has(cloCode));
                    const selectedCloLabel =
                      selectedCloCodes.length > 0 ? selectedCloCodes.join(", ") : "Select related CLOs";

                    return (
                      <FormItem>
                        <FormLabel required>Related CLOs</FormLabel>
                        <FormControl>
                          <Combobox
                            multiple
                            items={availableCloOptions}
                            value={selectedCloCodes}
                            onValueChange={(selectedCloCodes) =>
                              field.onChange(selectedCloCodes.map((cloCode) => ({ cloCode })))
                            }
                            disabled={cloOptions.length === 0}
                          >
                            <ComboboxTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between border-white/10 bg-[#101010] font-normal text-white hover:bg-[#101010] hover:text-white"
                                >
                                  <span className="truncate">{selectedCloLabel}</span>
                                </Button>
                              }
                            />
                            <ComboboxContent>
                              <ComboboxInput
                                showTrigger={false}
                                placeholder="Search CLO..."
                              />
                              <ComboboxEmpty>No CLO found.</ComboboxEmpty>
                              <ComboboxList>
                                {(item) => (
                                  <ComboboxItem key={item} value={item}>
                                    {item}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            ))}
          </div>
        );
      case "Evaluation":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Evaluation Items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendEvaluationItem({ title: "", weight: 0, clos: [] })}
              >
                <Plus className="mr-1 size-4" />
                Add Evaluation
              </Button>
            </div>
            {form.formState.errors.evaluationItems?.message ? (
              <p className="text-sm text-red-400">
                {String(form.formState.errors.evaluationItems.message)}
              </p>
            ) : null}
            {evaluationItemFields.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-md border border-white/10 p-3">
                <div className="grid grid-cols-[1fr_160px_auto] gap-2">
                  <FormField
                    control={form.control}
                    name={`evaluationItems.${index}.title`}
                    rules={{ required: "Evaluation title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Title</FormLabel>
                        <FormControl>
                          <Input {...field} className={inputClassName} placeholder="Midterm Exam" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`evaluationItems.${index}.weight`}
                    rules={{ required: "Weight is required", min: 0 }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Weight (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                            className={inputClassName}
                            min={0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="self-start mt-6"
                    disabled={evaluationItemFields.length === 1}
                    onClick={() => removeEvaluationItem(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`evaluationItems.${index}.clos`}
                  render={({ field }) => {
                    const selectedCloCodes = field.value.map((closItem) => closItem.cloCode);
                    const selectedCloCodeSet = new Set(selectedCloCodes);
                    const availableCloOptions = cloOptions.filter((cloCode) => !selectedCloCodeSet.has(cloCode));
                    const selectedCloLabel =
                      selectedCloCodes.length > 0 ? selectedCloCodes.join(", ") : "Select related CLOs";

                    return (
                      <FormItem>
                        <FormLabel required>Related CLOs</FormLabel>
                        <FormControl>
                          <Combobox
                            multiple
                            items={availableCloOptions}
                            value={selectedCloCodes}
                            onValueChange={(selectedCloCodes) =>
                              field.onChange(selectedCloCodes.map((cloCode) => ({ cloCode })))
                            }
                            disabled={cloOptions.length === 0}
                          >
                            <ComboboxTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-between border-white/10 bg-[#101010] font-normal text-white hover:bg-[#101010] hover:text-white"
                                >
                                  <span className="truncate">{selectedCloLabel}</span>
                                </Button>
                              }
                            />
                            <ComboboxContent>
                              <ComboboxInput
                                showTrigger={false}
                                placeholder="Search CLO..."
                              />
                              <ComboboxEmpty>No CLO found.</ComboboxEmpty>
                              <ComboboxList>
                                {(item) => (
                                  <ComboboxItem key={item} value={item}>
                                    {item}
                                  </ComboboxItem>
                                )}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            ))}
          </div>
        );
      case "Schedule":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Workload Items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendWorkloadItem({ activity: "", hours: 0 })}
              >
                <Plus className="mr-1 size-4" />
                Add Workload Item
              </Button>
            </div>
            {coursesError ? (
              <p className="text-sm text-red-400">Failed to load course credits for workload validation.</p>
            ) : null}
            {loadingCourses ? (
              <p className="text-sm text-gray-400">Loading course credits...</p>
            ) : null}
            {form.formState.errors.workloadItems?.message ? (
              <p className="text-sm text-red-400">
                {String(form.formState.errors.workloadItems.message)}
              </p>
            ) : null}
            {workloadItemFields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[1fr_160px_auto] gap-2 rounded-md border border-white/10 p-3">
                <FormField
                  control={form.control}
                  name={`workloadItems.${index}.activity`}
                  rules={{ required: "Workload activity is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Activity</FormLabel>
                      <FormControl>
                        <Input {...field} className={inputClassName} placeholder="Lecture" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`workloadItems.${index}.hours`}
                  rules={{ required: "Hours are required", min: 0 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                          className={inputClassName}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="self-start mt-6"
                  disabled={workloadItemFields.length === 1}
                  onClick={() => removeWorkloadItem(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        );
      case "Resources":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="textbooksText"
              rules={{ required: "Textbooks are required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Textbooks</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="List textbooks..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalReadingText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Reading</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Optional additional resources..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case "Review & Publish":
        {
          const values = form.getValues();
          const selectedTermLabel =
            termOptions.find((option) => option.value === String(values.termId))?.label ?? `Term #${values.termId}`;
          const selectedLecturerLabel =
            approvedUserOptions.find((option) => option.value === String(values.lecturerUserId))?.label ??
            `User #${values.lecturerUserId}`;
          const selectedAssistantLabels =
            values.assistantUserIds.length === 0
              ? "None"
              : values.assistantUserIds
                  .map(
                    (assistantUserId) =>
                      approvedUserOptions.find((option) => option.value === String(assistantUserId))?.label ??
                      `User #${assistantUserId}`
                  )
                  .join(", ");

        return (
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <p className="text-base font-semibold text-white">Review your outline details</p>
              <p className="mt-1 text-gray-400">
                Check each section before publishing. Use Previous if you want to edit anything.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-1">
              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Basic Info</p>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Course ID:</span> {values.courseId}</p>
                  <p><span className="text-gray-400">Term:</span> {selectedTermLabel}</p>
                  <p><span className="text-gray-400">Lecturer:</span> {selectedLecturerLabel}</p>
                  <p><span className="text-gray-400">Assistants:</span> {selectedAssistantLabels}</p>
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Learning Outcomes (CLOs)</p>
                <div className="space-y-2">
                  {values.learningOutcomes.map((outcome) => (
                    <div key={outcome.cloCode}>
                      <span className="text-gray-400">{outcome.cloCode}:</span>
                      {renderRichText(outcome.description)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Objectives</p>
                <ul className="list-disc space-y-1 pl-4">
                  {values.objectives.map((objective, index) => (
                    <li key={`objective-${index}`}>{renderRichText(objective.description)}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Content Items</p>
                <ul className="list-disc space-y-1 pl-4">
                  {values.contentItems.map((item, index) => (
                    <li key={`content-${index}`}>{renderRichText(item.description)}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Weekly Plan</p>
                <div className="space-y-3">
                  {values.weeklyTopics.map((topic) => (
                    <div key={`week-${topic.weekNo}`} className="rounded border border-white/10 p-3">
                      <p><span className="text-gray-400">Week {topic.weekNo}:</span> {topic.subjectTitle || "-"}</p>
                      <p className="mt-1">
                        <span className="text-gray-400">Date:</span> {topic.weekDate || "-"}
                      </p>
                      <div className="mt-1">
                        <span className="text-gray-400">Details:</span> {renderRichText(topic.detailsText)}
                      </div>
                      <div className="mt-1">
                        <span className="text-gray-400">Tasks / Private Study:</span>{" "}
                        {renderRichText(topic.tasksPrivateStudyText)}
                      </div>
                      <p className="mt-1">
                        <span className="text-gray-400">Related CLOs:</span>{" "}
                        {topic.clos.length > 0 ? topic.clos.map((clo) => clo.cloCode).join(", ") : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Evaluation</p>
                <div className="space-y-3">
                  {values.evaluationItems.map((item, index) => (
                    <div key={`assessment-${index}`} className="rounded border border-white/10 p-3">
                      <p><span className="text-gray-400">{item.title || "Untitled"}:</span> {item.weight}%</p>
                      <p className="mt-1">
                        <span className="text-gray-400">Related CLOs:</span>{" "}
                        {item.clos.length > 0 ? item.clos.map((clo) => clo.cloCode).join(", ") : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Workload</p>
                <ul className="list-disc space-y-1 pl-4">
                  {values.workloadItems.map((workload, index) => (
                    <li key={`workload-${index}`}>
                      {workload.activity || "-"}: {workload.hours} hours
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Resources</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400">Textbooks:</span> {renderRichText(values.textbooksText)}
                  </div>
                  <div>
                    <span className="text-gray-400">Additional Reading:</span>{" "}
                    {renderRichText(values.additionalReadingText)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        }
      default:
        return null;
    }
  };

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-white text-black hover:bg-gray-200">
            {isUpdateMode ? "Update Outline" : "+ Create Outline"}
          </Button>
        )}
      </DialogTrigger>
      <CustomDialogContent
        title={isUpdateMode ? "Update Course Outline" : "Create Course Outline"}
        description={
          isUpdateMode
            ? "Review and edit sections to update the existing course outline."
            : "Fill in all sections to prepare and publish the course outline."
        }
        currentTab={activeTab}
        tabs={tabs}
        contentClassName="max-w-[96%] overflow-y-auto"
        bodyClassName="w-[1000px] mt-8"
      >
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {renderCurrentTab()}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={activeTabIndex === 0}
                onClick={() => setActiveTabIndex((current) => Math.max(current - 1, 0))}
              >
                Previous
              </Button>
              {activeTabIndex < tabNames.length - 1 ? (
                <Button type="button" onClick={goToNextTab}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  <Circle className="size-4 mr-2" />
                  {isUpdateMode ? "Save Changes" : "Publish Outline"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CustomDialogContent>
    </Dialog>
  );
}
