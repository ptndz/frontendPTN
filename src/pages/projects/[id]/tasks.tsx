import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2, FiSearch, FiCalendar, FiPlus } from "react-icons/fi";
import { getCookie } from "cookies-next/client";
import { useI18n } from "../../../i18n/I18nProvider";
import { getAuthenticatedUser } from "../../../lib/pages-router-auth";
import { getAccessToken } from "../../../lib/auth/session";
import { useStoreUser } from "../../../store/user";
import { User } from "../../../gql/graphql";
import Navigation from "../../../components/Share/Navigation";
import {
  createProjectTask,
  deleteProjectTask,
  fetchProjectGroupConversation,
  fetchProjectTasks,
  groupTasksByStatus,
  moveTaskToStatus,
  patchProjectTask,
  PROJECT_TASK_PRIORITIES,
  PROJECT_TASK_STATUSES,
  type ProjectGroupUser,
  type ProjectTask,
  type ProjectTaskPriority,
  type ProjectTaskStatus,
} from "../../../lib/projectTasks";
import { isBotUser } from "../../../lib/botUsers";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Badge, type BadgeVariant } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Selector } from "@astryxdesign/core/Selector";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

interface IProps {
  userData: User;
}

const PRIORITY_META: Record<
  ProjectTaskPriority,
  { labelVi: string; labelEn: string; variant: BadgeVariant }
> = {
  urgent: { labelVi: "Khẩn cấp", labelEn: "Urgent", variant: "red" },
  high: { labelVi: "Cao", labelEn: "High", variant: "orange" },
  medium: { labelVi: "Trung bình", labelEn: "Medium", variant: "blue" },
  low: { labelVi: "Thấp", labelEn: "Low", variant: "neutral" },
};

function formatShortDate(iso?: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function isOverdue(dueDate?: string | null, status?: ProjectTaskStatus): boolean {
  if (!dueDate || status === "done") return false;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return false;
  const endOfDue = new Date(d);
  endOfDue.setHours(23, 59, 59, 999);
  return endOfDue.getTime() < Date.now();
}

const TaskCard: React.FC<{
  task: ProjectTask;
  locale: string;
  onEdit: (task: ProjectTask) => void;
  onDelete: (task: ProjectTask) => void;
}> = ({ task, locale, onEdit, onDelete }) => {
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id, status: task.status },
  });

  const prio: ProjectTaskPriority = task.priority || "medium";
  const prioMeta = PRIORITY_META[prio] || PRIORITY_META.medium;
  const dueStr = formatShortDate(task.dueDate);
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab"}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" className="flex-wrap">
          <Badge
            variant={prioMeta.variant}
            label={locale === "en" ? prioMeta.labelEn : prioMeta.labelVi}
          />
          {task.ackedAt ? (
            <Badge
              variant="green"
              label={`✓ ACK @${task.ackedBy || task.assignee || "bot"}`}
            />
          ) : null}
          <div className="ml-auto flex items-center gap-0.5">
            <IconButton
              size="sm"
              variant="ghost"
              label={t("messenger.edit")}
              icon={<FiEdit className="h-3.5 w-3.5" />}
              onClick={() => onEdit(task)}
            />
            <IconButton
              size="sm"
              variant="ghost"
              label={t("projectTasks.deleteTask")}
              icon={<FiTrash2 className="h-3.5 w-3.5 text-danger" />}
              onClick={() => onDelete(task)}
            />
          </div>
        </HStack>

        <Text weight="semibold" size="sm" className="min-w-0 break-words">
          {task.title}
        </Text>

        {task.description ? (
          <Text size="sm" color="secondary" maxLines={2} className="break-words text-xs">
            {task.description}
          </Text>
        ) : null}

        <HStack gap={2} vAlign="center" className="flex-wrap pt-0.5">
          <Text size="sm" color="secondary" maxLines={1} className="flex-1 min-w-0">
            {task.assignee && task.assignee !== "unassigned"
              ? `@${task.assignee}`
              : "—"}
          </Text>
          {task.assignee && isBotUser({ username: task.assignee }) ? (
            <Badge variant="purple" label="[BOT AI]" />
          ) : null}
          {dueStr ? (
            <span
              className={`inline-flex items-center gap-1 text-xs rounded px-1.5 py-0.5 ${
                overdue
                  ? "bg-red-500/15 text-red-500 font-medium"
                  : "bg-surface text-muted border border-line"
              }`}>
              <FiCalendar className="h-3 w-3" />
              {dueStr}
            </span>
          ) : null}
        </HStack>
      </VStack>
    </Card>
  );
};

const TaskColumn: React.FC<{
  status: ProjectTaskStatus;
  title: string;
  tasks: ProjectTask[];
  locale: string;
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (task: ProjectTask) => void;
}> = ({ status, title, tasks, locale, onEditTask, onDeleteTask }) => {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${status}` });
  return (
    <VStack
      gap={2}
      className={`flex-1 min-w-64 rounded-xl p-2 ${isOver ? "bg-surface ring-1 ring-accent" : "bg-paper"}`}>
      <HStack gap={2} vAlign="center" className="px-1">
        <Text weight="semibold" size="sm" className="flex-1 min-w-0">
          {title}
        </Text>
        <Badge variant="neutral" label={String(tasks.length)} />
      </HStack>
      <VStack gap={2} ref={setNodeRef} className="min-h-32 flex-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            locale={locale}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </VStack>
    </VStack>
  );
};

const ProjectTasksPage: React.FC<IProps> = ({ userData }) => {
  const { t, locale } = useI18n();
  const { setUser } = useStoreUser();
  const router = useRouter();
  const conversationId =
    typeof router.query.id === "string" ? router.query.id : "";

  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [savingIds, setSavingIds] = useState<ReadonlySet<string>>(new Set());
  const [members, setMembers] = useState<ProjectGroupUser[]>([]);

  // Search & Filter state (#18b)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  // Create Task state (#18b)
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("unassigned");
  const [newPriority, setNewPriority] = useState<ProjectTaskPriority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [showCreateDetails, setShowCreateDetails] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit Task dialog state
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAssignee, setEditAssignee] = useState("unassigned");
  const [editStatus, setEditStatus] = useState<ProjectTaskStatus>("todo");
  const [editPriority, setEditPriority] = useState<ProjectTaskPriority>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const loadTasks = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    setLoadError(false);
    try {
      setTasks(await fetchProjectTasks(conversationId));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const refreshTasksSilently = useCallback(async () => {
    if (!conversationId) return;
    try {
      const next = await fetchProjectTasks(conversationId);
      setTasks(next);
    } catch {
      // Keep current tasks on silent background refresh failure
    }
  }, [conversationId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  // Live SSE subscription (#18b + #18g): refresh board automatically on task.* events
  useEffect(() => {
    if (!conversationId || typeof window === "undefined") return;
    const token = getAccessToken() || getCookie("token");
    if (!token) return;
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_URL_API ||
      process.env.NEXT_PUBLIC_API_URL ||
      "";
    const url = `${apiBase}/api/v1/events/stream?token=${encodeURIComponent(
      String(token)
    )}`;
    const es = new EventSource(url);
    const onTaskEvent = (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data);
        const eventConvId =
          parsed?.conversationId ?? parsed?.data?.conversationId;
        if (
          eventConvId !== undefined &&
          String(eventConvId) !== String(conversationId)
        ) {
          return;
        }
      } catch {}
      void refreshTasksSilently();
    };
    es.addEventListener("connected", () => setSseConnected(true));
    es.addEventListener("task.created", onTaskEvent);
    es.addEventListener("task.updated", onTaskEvent);
    es.addEventListener("task.deleted", onTaskEvent);
    es.addEventListener("task.acked", onTaskEvent);
    es.onerror = () => setSseConnected(false);
    return () => es.close();
  }, [conversationId, refreshTasksSilently]);

  const loadMembers = useCallback(async () => {
    if (!conversationId) return;
    try {
      const conv = await fetchProjectGroupConversation(conversationId);
      setMembers(conv?.users ?? []);
    } catch {
      setMembers([]);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const assigneeOptions = useMemo(
    () => [
      { value: "unassigned", label: t("projectTasks.unassigned") },
      ...members.map((m) => ({
        value: m.username,
        label: `${m.fullName || m.username}${isBotUser(m) ? " [BOT]" : ""}`,
      })),
    ],
    [members, t]
  );

  const priorityOptions = useMemo(
    () =>
      PROJECT_TASK_PRIORITIES.map((p) => ({
        value: p,
        label:
          locale === "en" ? PRIORITY_META[p].labelEn : PRIORITY_META[p].labelVi,
      })),
    [locale]
  );

  const statusOptions = useMemo(
    () =>
      PROJECT_TASK_STATUSES.map((s) => ({
        value: s,
        label: t(`projectTasks.${s}`),
      })),
    [t]
  );

  // Filtered tasks (#18b)
  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((item) => {
      if (filterPriority !== "all") {
        const p = item.priority || "medium";
        if (p !== filterPriority) return false;
      }
      if (filterAssignee !== "all") {
        const a = item.assignee || "unassigned";
        if (a !== filterAssignee) return false;
      }
      if (q) {
        const hay = [
          item.title,
          item.description || "",
          item.assignee || "",
          item.labels || "",
          item.ackedBy || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee]);

  const handleCreateTask = async () => {
    const title = newTitle.trim();
    if (!title || creating) return;
    setCreating(true);
    try {
      const created = await createProjectTask(conversationId, {
        title,
        assignee: newAssignee,
        priority: newPriority,
        dueDate: newDueDate ? newDueDate : null,
        description: newDescription.trim() ? newDescription.trim() : null,
      });
      if (created) {
        setTasks((prev) =>
          prev.some((x) => x.id === created.id) ? prev : [created, ...prev]
        );
        setNewTitle("");
        setNewDueDate("");
        setNewDescription("");
        setNewPriority("medium");
        toast.success(t("projectTasks.createSuccess"));
      } else {
        toast.error(t("projectTasks.createFailed"));
      }
    } catch {
      toast.error(t("projectTasks.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const openEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditAssignee(task.assignee || "unassigned");
    setEditStatus(task.status);
    setEditPriority(task.priority || "medium");
    setEditDueDate(formatShortDate(task.dueDate) || "");
  };

  const handleSaveEdit = async () => {
    if (!editingTask || savingEdit) return;
    const title = editTitle.trim();
    if (!title) return;
    setSavingEdit(true);
    try {
      const updated = await patchProjectTask(conversationId, editingTask.id, {
        title,
        description: editDescription.trim() ? editDescription.trim() : null,
        assignee: editAssignee,
        status: editStatus,
        priority: editPriority,
        dueDate: editDueDate ? editDueDate : null,
      });
      if (updated) {
        setTasks((prev) =>
          prev.map((item) => (item.id === editingTask.id ? updated : item))
        );
        setEditingTask(null);
      } else {
        toast.error(t("projectTasks.saveFailed"));
      }
    } catch {
      toast.error(t("projectTasks.saveFailed"));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTask = async (task: ProjectTask) => {
    const confirmMsg =
      locale === "en"
        ? `Delete task "${task.title}"?`
        : `Xóa task "${task.title}"?`;
    if (!window.confirm(confirmMsg)) return;
    const previous = tasks;
    setTasks((prev) => prev.filter((item) => item.id !== task.id));
    if (editingTask?.id === task.id) setEditingTask(null);
    try {
      await deleteProjectTask(conversationId, task.id);
      toast.success(locale === "en" ? "Task deleted." : "Đã xóa task.");
    } catch {
      setTasks(previous);
      toast.error(
        locale === "en"
          ? "Couldn't delete task, please try again."
          : "Không xóa được task, thử lại sau."
      );
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.data.current?.taskId as string | undefined;
    setActiveTask(tasks.find((task) => task.id === taskId) ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const overId = typeof event.over?.id === "string" ? event.over.id : "";
    const taskId = event.active.data.current?.taskId as string | undefined;
    if (!overId.startsWith("column-") || !taskId) return;
    const nextStatus = overId.replace("column-", "") as ProjectTaskStatus;
    if (!PROJECT_TASK_STATUSES.includes(nextStatus)) return;
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === nextStatus || savingIds.has(taskId)) return;
    const previous = tasks;
    setTasks(moveTaskToStatus(tasks, taskId, nextStatus));
    setSavingIds((prev) => new Set(prev).add(taskId));
    try {
      const updated = await patchProjectTask(conversationId, taskId, {
        status: nextStatus,
      });
      if (updated) {
        setTasks((prev) =>
          prev.map((item) => (item.id === taskId ? updated : item))
        );
      }
    } catch {
      setTasks(previous);
      toast.error(t("projectTasks.updateFailed"));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const grouped = groupTasksByStatus(filteredTasks);

  return (
    <>
      <Navigation />
      <HStack justify="center" width="100%" className="bg-paper min-h-screen">
        <VStack
          gap={3}
          width="100%"
          maxWidth={1280}
          paddingInline={2}
          paddingBlockStart={2}
          paddingBlockEnd={8}>
          <HStack gap={2} vAlign="center" className="flex-wrap">
            <Heading level={1} className="flex-1 min-w-0">
              {t("projectTasks.title")}
            </Heading>
            <Badge
              variant={sseConnected ? "green" : "neutral"}
              label={sseConnected ? "● SSE Live" : "○ SSE"}
            />
            <HStack gap={3} vAlign="center">
              <Link href="/files">
                <Text size="sm" color="secondary">
                  📂 {locale === "en" ? "Files" : "Kho Tệp"}
                </Text>
              </Link>
              <Link href="/projects">
                <Text size="sm" color="secondary">
                  {t("projectTasks.backToProjects")}
                </Text>
              </Link>
              <Link href="/messenger">
                <Text size="sm" color="secondary">
                  {t("projectTasks.backToChat")}
                </Text>
              </Link>
            </HStack>
          </HStack>

          {!loading && !loadError ? (
            <VStack gap={2} className="bg-surface border border-line rounded-xl p-3">
              {/* Create Task Row */}
              <HStack gap={2} vAlign="center" className="flex-wrap">
                <TextInput
                  label={t("projectTasks.titlePlaceholder")}
                  isLabelHidden
                  value={newTitle}
                  onChange={(value) => setNewTitle(value)}
                  onEnter={handleCreateTask}
                  placeholder={t("projectTasks.titlePlaceholder")}
                  containerClassName="flex-1 min-w-52"
                />
                <select
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value as ProjectTaskPriority)
                  }
                  aria-label="Priority"
                  className="bg-paper rounded-lg border border-line text-sm outline-none py-1.5 px-2.5">
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      ⚡ {opt.label}
                    </option>
                  ))}
                </select>
                <Selector
                  label={t("projectTasks.assigneeLabel")}
                  isLabelHidden
                  options={assigneeOptions}
                  value={newAssignee}
                  onChange={(value) => setNewAssignee(value)}
                  hasSearch
                  size="sm"
                />
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  title={locale === "en" ? "Due date" : "Hạn chót"}
                  className="bg-paper rounded-lg border border-line text-sm outline-none py-1.5 px-2.5"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<FiPlus />}
                  label={locale === "en" ? "Description" : "Mô tả"}
                  onClick={() => setShowCreateDetails((v) => !v)}
                />
                <Button
                  size="sm"
                  variant="primary"
                  label={
                    creating ? t("projectTasks.creating") : t("projectTasks.create")
                  }
                  isDisabled={creating || !newTitle.trim()}
                  isLoading={creating}
                  onClick={handleCreateTask}
                />
              </HStack>

              {showCreateDetails ? (
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={
                    locale === "en"
                      ? "Optional task description, acceptance criteria, or file paths..."
                      : "Mô tả chi tiết task, tiêu chí nghiệm thu hoặc đường dẫn file (tùy chọn)..."
                  }
                  className="w-full bg-paper rounded-lg border border-line text-sm outline-none p-2"
                />
              ) : null}

              {/* Search & Filter Bar (#18b) */}
              <HStack
                gap={2}
                vAlign="center"
                className="flex-wrap pt-2 border-t border-line">
                <div className="relative flex-1 min-w-48">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      locale === "en"
                        ? "Search tasks by keyword, @assignee, label..."
                        : "Tìm kiếm task theo từ khóa, @người nhận, nhãn..."
                    }
                    className="w-full bg-paper rounded-lg border border-line text-sm outline-none py-1.5 pl-9 pr-3"
                  />
                </div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-paper rounded-lg border border-line text-sm outline-none py-1.5 px-2.5">
                  <option value="all">
                    {locale === "en" ? "All priorities" : "Mọi độ ưu tiên"}
                  </option>
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="bg-paper rounded-lg border border-line text-sm outline-none py-1.5 px-2.5">
                  <option value="all">
                    {locale === "en" ? "All assignees" : "Mọi thành viên"}
                  </option>
                  {assigneeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {(searchQuery ||
                  filterPriority !== "all" ||
                  filterAssignee !== "all") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    label={locale === "en" ? "Clear filters" : "Xóa lọc"}
                    onClick={() => {
                      setSearchQuery("");
                      setFilterPriority("all");
                      setFilterAssignee("all");
                    }}
                  />
                )}
              </HStack>
            </VStack>
          ) : null}

          {loading ? (
            <HStack gap={3} className="items-start">
              {PROJECT_TASK_STATUSES.map((status) => (
                <VStack key={status} gap={2} className="flex-1 min-w-60">
                  <Skeleton height={96} />
                  <Skeleton height={96} index={1} />
                </VStack>
              ))}
            </HStack>
          ) : loadError ? (
            <VStack gap={2}>
              <Text size="sm" className="text-danger">
                {t("projectTasks.loadFailed")}
              </Text>
              <Button
                size="sm"
                variant="primary"
                label={t("projectTasks.retry")}
                onClick={loadTasks}
              />
            </VStack>
          ) : tasks.length === 0 ? (
            <EmptyState
              title={t("projectTasks.empty")}
              description={t("projectTasks.emptyHint")}
            />
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={() => setActiveTask(null)}>
              <HStack gap={3} className="items-start overflow-x-auto">
                {PROJECT_TASK_STATUSES.map((status) => (
                  <TaskColumn
                    key={status}
                    status={status}
                    title={t(`projectTasks.${status}`)}
                    tasks={grouped[status]}
                    locale={locale}
                    onEditTask={openEditTask}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}
              </HStack>
              <DragOverlay>
                {activeTask ? (
                  <Card>
                    <Text weight="semibold" size="sm">
                      {activeTask.title}
                    </Text>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </VStack>
      </HStack>

      {editingTask ? (
        <Dialog
          isOpen
          onOpenChange={(open) => {
            if (!open) setEditingTask(null);
          }}
          purpose="form"
          width={480}>
          <DialogHeader
            title={t("projectTasks.editTitle")}
            onOpenChange={(open) => {
              if (!open) setEditingTask(null);
            }}
          />
          <VStack gap={3}>
            <TextInput
              label={t("projectTasks.titlePlaceholder")}
              value={editTitle}
              onChange={(value) => setEditTitle(value)}
              placeholder={t("projectTasks.titlePlaceholder")}
            />
            <VStack gap={1}>
              <Text size="sm" color="secondary">
                {locale === "en" ? "Description" : "Mô tả"}
              </Text>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder={
                  locale === "en" ? "Task description..." : "Mô tả chi tiết..."
                }
                className="w-full bg-paper rounded-lg border border-line text-sm outline-none p-2"
              />
            </VStack>
            <Selector
              label={t("projectTasks.assigneeLabel")}
              options={assigneeOptions}
              value={editAssignee}
              onChange={(value) => setEditAssignee(value)}
              hasSearch
            />
            <HStack gap={2} vAlign="center" className="flex-wrap">
              <div className="flex-1 min-w-36">
                <Selector
                  label={t("projectTasks.statusLabel")}
                  options={statusOptions}
                  value={editStatus}
                  onChange={(value) => setEditStatus(value as ProjectTaskStatus)}
                />
              </div>
              <div className="flex-1 min-w-36">
                <Selector
                  label={locale === "en" ? "Priority" : "Độ ưu tiên"}
                  options={priorityOptions}
                  value={editPriority}
                  onChange={(value) =>
                    setEditPriority(value as ProjectTaskPriority)
                  }
                />
              </div>
            </HStack>
            <VStack gap={1}>
              <Text size="sm" color="secondary">
                {locale === "en" ? "Due date" : "Hạn chót"}
              </Text>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full bg-paper rounded-lg border border-line text-sm outline-none py-1.5 px-2.5"
              />
            </VStack>
            <HStack gap={2} vAlign="center" className="flex-wrap pt-2">
              <Button
                size="sm"
                variant="secondary"
                label={t("common.cancel")}
                onClick={() => setEditingTask(null)}
              />
              <Button
                size="sm"
                variant="primary"
                label={t("messenger.save")}
                isDisabled={savingEdit || !editTitle.trim()}
                isLoading={savingEdit}
                onClick={handleSaveEdit}
              />
              <Button
                size="sm"
                variant="destructive"
                label={t("projectTasks.deleteTask")}
                onClick={() => void handleDeleteTask(editingTask)}
              />
            </HStack>
          </VStack>
        </Dialog>
      ) : null}
    </>
  );
};

export default ProjectTasksPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (user) {
      return { props: { userData: user } };
    }
  } catch (error) {}

  return {
    redirect: { destination: "/login", permanent: false },
  };
};
