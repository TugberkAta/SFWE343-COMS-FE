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
import useFetchData from "@/hooks/use-fetch-data";
import Authentication from "@/services/auth/authentication";
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
  "Assessment",
  "Schedule",
  "Policies & Resources",
  "Review & Publish",
] as const;

type TabName = (typeof tabNames)[number];

const inputClassName = "bg-[#101010] border-white/10 text-white";
const textAreaClassName =
  "w-full rounded-md border border-white/10 bg-[#101010] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-ring";

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
  const [, , outlineData] = useFetchData(
    () => getOutlineById(Number(outlineId)),
    [outlineId],
    { enabled: isUpdateMode }
  );

  const terms: Term[] = termsData.terms || [];
  const approvedUsers: UserWithRole[] = usersData.users || [];
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
  const assistantUserOptions = useMemo(
    () => [{ value: "none", label: "None" }, ...approvedUserOptions],
    [approvedUserOptions]
  );
  const existingOutline = outlineData?.outline as OutlineById | undefined;

  const toOutlineFormValues = (outline: OutlineById): PostCourseOutlineBody => ({
    courseId: outline.courseId,
    termId: outline.termId,
    lecturerUserId: outline.lecturerUserId,
    assistantUserId: outline.assistantUserId,
    textbooksText: outline.textbooksText || "",
    additionalReadingText: outline.additionalReadingText || "",
    createdByUserId: currentUser?.userId ?? outline.createdByUserId ?? 0,
    objectives: outline.objectives?.length
      ? outline.objectives.map((item) => ({ description: item.objectiveText || "" }))
      : [{ description: "" }],
    contentItems: outline.contentItems?.length
      ? outline.contentItems.map((item) => ({ description: item.contentText || "" }))
      : [{ description: "" }],
    learningOutcomes: outline.learningOutcomes?.length
      ? outline.learningOutcomes.map((item) => ({
          cloCode: `CLO-${item.cloNumber}`,
          description: item.statement || "",
        }))
      : [{ cloCode: "CLO-1", description: "" }],
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
    policies: outline.policies?.length
      ? outline.policies.map((item) => ({
          policyType: item.title || "",
          description: item.bodyText || "",
        }))
      : [{ policyType: "", description: "" }],
    referenceLinks: outline.referenceLinks?.length
      ? outline.referenceLinks.map((item) => ({ title: item.label || "", url: item.url || "" }))
      : [{ title: "", url: "" }],
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
  });

  const form = useForm<PostCourseOutlineBody>({
    defaultValues: {
      courseId,
      termId: 0,
      lecturerUserId: 0,
      assistantUserId: null,
      textbooksText: "",
      additionalReadingText: "",
      createdByUserId: currentUser?.userId ?? 0,
      objectives: [{ description: "" }],
      contentItems: [{ description: "" }],
      learningOutcomes: [{ cloCode: "", description: "" }],
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
      policies: [{ policyType: "", description: "" }],
      referenceLinks: [{ title: "", url: "" }],
      workloadItems: [{ activity: "", hours: 0 }],
      evaluationItems: [{ title: "", weight: 0, clos: [] }],
    },
  });

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
  const { fields: policyFields, append: appendPolicy, remove: removePolicy } = useFieldArray({
    control: form.control,
    name: "policies",
  });
  const {
    fields: referenceLinkFields,
    append: appendReferenceLink,
    remove: removeReferenceLink,
  } = useFieldArray({
    control: form.control,
    name: "referenceLinks",
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
      Assessment: ["evaluationItems.0.title", "evaluationItems.0.weight", "evaluationItems.0.clos"],
      Schedule: ["workloadItems.0.activity", "workloadItems.0.hours"],
      "Policies & Resources": [
        "policies.0.policyType",
        "policies.0.description",
        "referenceLinks.0.title",
        "referenceLinks.0.url",
        "textbooksText",
        "additionalReadingText",
      ],
      "Review & Publish": [],
    };

    const isValid = await form.trigger(fieldsToValidate[activeTab] as never);
    if (!isValid) return;

    setActiveTabIndex((current) => Math.min(current + 1, tabNames.length - 1));
  };

  const onSubmit = async (values: PostCourseOutlineBody) => {
    if (isUpdateMode && outlineId) {
      const patchPayload: PatchCourseOutlineBody = {
        lecturerUserId: values.lecturerUserId,
        assistantUserId: values.assistantUserId,
        termId: values.termId,
        textbooksText: values.textbooksText,
        additionalReadingText: values.additionalReadingText,
        objectives: values.objectives,
        contentItems: values.contentItems,
        learningOutcomes: values.learningOutcomes,
        weeklyTopics: values.weeklyTopics,
        policies: values.policies,
        referenceLinks: values.referenceLinks,
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
              name="assistantUserId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assistant</FormLabel>
                  <FormControl>
                    <Combobox
                      items={assistantUserOptions}
                      value={assistantUserOptions.find((option) =>
                        option.value === (field.value ? String(field.value) : "none")
                      )}
                      onValueChange={(value) =>
                        field.onChange(!value || value.value === "none" ? null : Number(value.value))
                      }
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
                              {assistantUserOptions.find(
                                (option) => option.value === (field.value ? String(field.value) : "none")
                              )?.label ?? (loadingUsers ? "Loading users..." : "Select assistant (optional)")}
                            </span>
                          </Button>
                        }
                      />
                      <ComboboxContent>
                        <ComboboxInput showTrigger={false} placeholder="Search assistant..." />
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
                <p className="text-sm font-medium text-white">Objectives</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendObjective({ description: "" })}
                >
                  <Plus className="mr-1 size-4" />
                  Add Objective
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
                          <textarea
                            {...field}
                            rows={3}
                            className={textAreaClassName}
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
                          <textarea
                            {...field}
                            rows={3}
                            className={textAreaClassName}
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
                          <textarea
                            {...field}
                            rows={3}
                            className={textAreaClassName}
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
                    disabled={learningOutcomeFields.length === 1}
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
                        <textarea
                          {...field}
                          rows={3}
                          className={textAreaClassName}
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
                        <textarea
                          {...field}
                          rows={3}
                          className={textAreaClassName}
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
      case "Assessment":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">Assessment Items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendEvaluationItem({ title: "", weight: 0, clos: [] })}
              >
                <Plus className="mr-1 size-4" />
                Add Assessment
              </Button>
            </div>
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
      case "Policies & Resources":
        return (
          <div className="space-y-4">
            <div className="space-y-3 rounded-md border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Policies</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPolicy({ policyType: "", description: "" })}
                >
                  <Plus className="mr-1 size-4" />
                  Add Policy
                </Button>
              </div>
              {policyFields.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-md border border-white/10 p-3">
                  <div className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`policies.${index}.policyType`}
                      rules={{ required: "Policy type is required" }}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel required>Policy Type</FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClassName} placeholder="Attendance" />
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
                      disabled={policyFields.length === 1}
                      onClick={() => removePolicy(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`policies.${index}.description`}
                    rules={{ required: "Policy details are required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Description</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={4}
                            className={textAreaClassName}
                            placeholder="Attendance, grading, conduct policies..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-md border border-white/10 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">Reference Links</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendReferenceLink({ title: "", url: "" })}
                >
                  <Plus className="mr-1 size-4" />
                  Add Reference
                </Button>
              </div>
              {referenceLinkFields.map((item, index) => (
                <div key={item.id} className="space-y-3 rounded-md border border-white/10 p-3">
                  <div className="flex items-start gap-2">
                    <FormField
                      control={form.control}
                      name={`referenceLinks.${index}.title`}
                      rules={{ required: "Reference title is required" }}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel required>Title</FormLabel>
                          <FormControl>
                            <Input {...field} className={inputClassName} placeholder="Course website" />
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
                      disabled={referenceLinkFields.length === 1}
                      onClick={() => removeReferenceLink(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`referenceLinks.${index}.url`}
                    rules={{ required: "Reference link is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>URL</FormLabel>
                        <FormControl>
                          <Input {...field} className={inputClassName} placeholder="https://example.com/resource" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <FormField
              control={form.control}
              name="textbooksText"
              rules={{ required: "Textbooks are required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Textbooks</FormLabel>
                  <FormControl>
                    <textarea {...field} rows={4} className={textAreaClassName} placeholder="List textbooks..." />
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
                    <textarea
                      {...field}
                      rows={4}
                      className={textAreaClassName}
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
          const selectedAssistantLabel =
            values.assistantUserId === null
              ? "None"
              : approvedUserOptions.find((option) => option.value === String(values.assistantUserId))?.label ??
                `User #${values.assistantUserId}`;

        return (
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <p className="text-base font-semibold text-white">Review your outline details</p>
              <p className="mt-1 text-gray-400">
                Check each section before publishing. Use Previous if you want to edit anything.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Basic Info</p>
                <div className="space-y-2">
                  <p><span className="text-gray-400">Course ID:</span> {values.courseId}</p>
                  <p><span className="text-gray-400">Term:</span> {selectedTermLabel}</p>
                  <p><span className="text-gray-400">Lecturer:</span> {selectedLecturerLabel}</p>
                  <p><span className="text-gray-400">Assistant:</span> {selectedAssistantLabel}</p>
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Learning Outcomes (CLOs)</p>
                <div className="space-y-2">
                  {values.learningOutcomes.map((outcome) => (
                    <p key={outcome.cloCode}>
                      <span className="text-gray-400">{outcome.cloCode}:</span> {outcome.description || "-"}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Objectives</p>
                <ul className="list-disc space-y-1 pl-4">
                  {values.objectives.map((objective, index) => (
                    <li key={`objective-${index}`}>{objective.description || "-"}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4">
                <p className="mb-3 text-sm font-semibold text-white">Content Items</p>
                <ul className="list-disc space-y-1 pl-4">
                  {values.contentItems.map((item, index) => (
                    <li key={`content-${index}`}>{item.description || "-"}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4 md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-white">Weekly Plan</p>
                <div className="space-y-3">
                  {values.weeklyTopics.map((topic) => (
                    <div key={`week-${topic.weekNo}`} className="rounded border border-white/10 p-3">
                      <p><span className="text-gray-400">Week {topic.weekNo}:</span> {topic.subjectTitle || "-"}</p>
                      <p className="mt-1">
                        <span className="text-gray-400">Date:</span> {topic.weekDate || "-"}
                      </p>
                      <p className="mt-1">
                        <span className="text-gray-400">Details:</span> {topic.detailsText || "-"}
                      </p>
                      <p className="mt-1">
                        <span className="text-gray-400">Tasks / Private Study:</span>{" "}
                        {topic.tasksPrivateStudyText || "-"}
                      </p>
                      <p className="mt-1">
                        <span className="text-gray-400">Related CLOs:</span>{" "}
                        {topic.clos.length > 0 ? topic.clos.map((clo) => clo.cloCode).join(", ") : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4 md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-white">Assessment</p>
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
                <p className="mb-3 text-sm font-semibold text-white">Policies</p>
                <ul className="list-disc space-y-1 pl-4">
                  {values.policies.map((policy, index) => (
                    <li key={`policy-${index}`}>
                      <span className="text-gray-400">{policy.policyType || "Policy"}:</span>{" "}
                      {policy.description || "-"}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-white/10 bg-[#101010] p-4 md:col-span-2">
                <p className="mb-3 text-sm font-semibold text-white">Resources</p>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-400">Textbooks:</span> {values.textbooksText || "-"}
                  </p>
                  <p>
                    <span className="text-gray-400">Additional Reading:</span>{" "}
                    {values.additionalReadingText || "-"}
                  </p>
                  <div>
                    <p className="text-gray-400">Reference Links:</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {values.referenceLinks.map((link, index) => (
                        <li key={`reference-${index}`}>
                          {link.title || "Untitled"} - {link.url || "-"}
                        </li>
                      ))}
                    </ul>
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
