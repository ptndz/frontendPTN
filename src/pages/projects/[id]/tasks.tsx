import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { FiEdit } from "react-icons/fi";
import { useI18n } from "../../../i18n/I18nProvider";
import { getAuthenticatedUser } from "../../../lib/pages-router-auth";
import { useStoreUser } from "../../../store/user";
import { User } from "../../../gql/graphql";
import Navigation from "../../../components/Share/Navigation";
import {
  createProjectTask,
  fetchProjectGroupConversation,
  fetchProjectTasks,
  groupTasksByStatus,
  moveTaskToStatus,
  patchProjectTask,
  PROJECT_TASK_STATUSES,
  type ProjectGroupUser,
  type ProjectTask,
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
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Dialog } from "@astryxdesign/core/Dialog";
import { DialogHeader } from "@astryxdesign/core/Dialog";
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

/**
 * Board Trello v1 (thiết kế mục 4.5, item 11): 3 cột todo / doing / done
 * cho task của 1 group chat. `[id]` trên route là conversationId.
 *
 * API contract (backend làm song song, item 7 — CHƯA verify live):
 * GET /messenger/projects/:conversationId/tasks, PATCH .../tasks/:id { status }.
 * Kéo-thả thẻ sang cột khác -> PATCH đổi status (optimistic UI, lỗi thì
 * hoàn lại + toast). Kéo-thả dùng @dnd-kit đã có sẵn trong repo.
 *
 * Lưu ý route: repo dùng pages-router (không có src/app) nên trang nằm ở
 * src/pages/projects/[id]/tasks.tsx — URL vẫn là /projects/:id/tasks
 * như thiết kế, không phải src/app/.../page.tsx.
 */
const TaskCard: React.FC<{
  task: ProjectTask;
  onEdit: (task: ProjectTask) => void;
}> = ({ task, onEdit }) => {
  const { t } = useI18n();
  // Không dùng `transform` của useDraggable: DragOverlay vẽ bản sao thẻ
  // đang kéo, thẻ gốc ở yên (chỉ mờ đi).
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id, status: task.status },
  });
  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={isDragging ? "opacity-50 cursor-grabbing" : "cursor-grab"}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <Text weight="semibold" size="sm" className="flex-1 min-w-0">
            {task.title}
          </Text>
          {/* Nút sửa nằm trong thẻ kéo-thả: bấm thường (không di chuyển)
              không kích hoạt kéo (PointerSensor cần di chuyển 4px). */}
          <IconButton
            size="sm"
            variant="ghost"
            label={t("messenger.edit")}
            icon={<FiEdit className="h-4 w-4" />}
            onClick={() => onEdit(task)}
          />
        </HStack>
        <HStack gap={2} vAlign="center">
          <Text size="sm" color="secondary" maxLines={1} className="flex-1 min-w-0">
            {task.assignee
              ? `@${task.assignee}`
              : "—"}
          </Text>
          {task.assignee && isBotUser({ username: task.assignee }) ? (
            <Badge variant="purple" label="[BOT AI]" />
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
  onEditTask: (task: ProjectTask) => void;
}> = ({ status, title, tasks, onEditTask }) => {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${status}` });
  return (
    <VStack
      gap={2}
      className={`flex-1 min-w-60 rounded-xl p-2 ${isOver ? "bg-surface" : "bg-paper"}`}>
      <HStack gap={2} vAlign="center" className="px-1">
        <Text weight="semibold" size="sm" className="flex-1 min-w-0">
          {title}
        </Text>
        <Text size="sm" color="secondary">
          {tasks.length}
        </Text>
      </HStack>
      <VStack gap={2} ref={setNodeRef} className="min-h-32 flex-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEditTask} />
        ))}
      </VStack>
    </VStack>
  );
};

const ProjectTasksPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const router = useRouter();
  const conversationId =
    typeof router.query.id === "string" ? router.query.id : "";
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  // Task đang lưu PATCH (theo từng id): kéo-thả task khác trong lúc
  // 1 task đang lưu vẫn được, chỉ chặn kéo lại đúng task đó.
  const [savingIds, setSavingIds] = useState<ReadonlySet<string>>(new Set());
  // Thành viên nhóm (dropdown giao task) — lỗi thì chỉ còn "Chưa giao".
  const [members, setMembers] = useState<ProjectGroupUser[]>([]);
  // Form tạo task mới.
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("unassigned");
  const [creating, setCreating] = useState(false);
  // Task đang sửa trong dialog (null = đóng).
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAssignee, setEditAssignee] = useState("unassigned");
  const [editStatus, setEditStatus] = useState<ProjectTaskStatus>("todo");
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

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
    loadMembers();
  }, [loadMembers]);

  const assigneeOptions = [
    { value: "unassigned", label: t("projectTasks.unassigned") },
    ...members.map((m) => ({
      value: m.username,
      label: m.fullName || m.username,
    })),
  ];
  const statusOptions = PROJECT_TASK_STATUSES.map((s) => ({
    value: s,
    label: t(`projectTasks.${s}`),
  }));

  const handleCreateTask = async () => {
    const title = newTitle.trim();
    if (!title || creating) return;
    setCreating(true);
    try {
      const created = await createProjectTask(conversationId, {
        title,
        assignee: newAssignee,
      });
      if (created) {
        setTasks((prev) => [created, ...prev]);
        setNewTitle("");
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
    setEditAssignee(task.assignee || "unassigned");
    setEditStatus(task.status);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || savingEdit) return;
    const title = editTitle.trim();
    if (!title) return;
    setSavingEdit(true);
    try {
      const updated = await patchProjectTask(conversationId, editingTask.id, {
        title,
        assignee: editAssignee,
        status: editStatus,
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

  const grouped = groupTasksByStatus(tasks);

  return (
    <>
      <Navigation />
      <HStack justify="center" width="100%" className="bg-paper">
        <VStack
          gap={3}
          width="100%"
          maxWidth={1200}
          paddingInline={2}
          paddingBlockStart={2}
          paddingBlockEnd={8}>
          <HStack gap={2} vAlign="center">
            <Heading level={1} className="flex-1 min-w-0">
              {t("projectTasks.title")}
            </Heading>
            <HStack gap={3} vAlign="center">
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
            <VStack gap={2}>
              <Text weight="semibold" size="sm">
                {t("projectTasks.createTitle")}
              </Text>
              <TextInput
                label={t("projectTasks.createTitle")}
                isLabelHidden
                value={newTitle}
                onChange={(value) => setNewTitle(value)}
                placeholder={t("projectTasks.titlePlaceholder")}
              />
              <HStack gap={2} vAlign="center" className="flex-wrap">
                <Selector
                  label={t("projectTasks.assigneeLabel")}
                  options={assigneeOptions}
                  value={newAssignee}
                  onChange={(value) => setNewAssignee(value)}
                  hasSearch
                  size="sm"
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
                    onEditTask={openEditTask}
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
          width={448}>
          <DialogHeader
            title={t("projectTasks.editTitle")}
            onOpenChange={(open) => {
              if (!open) setEditingTask(null);
            }}
          />
          <VStack gap={2}>
            <TextInput
              label={t("projectTasks.titlePlaceholder")}
              value={editTitle}
              onChange={(value) => setEditTitle(value)}
              placeholder={t("projectTasks.titlePlaceholder")}
            />
            <Selector
              label={t("projectTasks.assigneeLabel")}
              options={assigneeOptions}
              value={editAssignee}
              onChange={(value) => setEditAssignee(value)}
              hasSearch
            />
            <Selector
              label={t("projectTasks.statusLabel")}
              options={statusOptions}
              value={editStatus}
              onChange={(value) => setEditStatus(value as ProjectTaskStatus)}
            />
            <HStack gap={2} vAlign="center" className="flex-wrap">
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
              {/* Xóa task chưa có API backend nên nút tắt + ghi chú rõ. */}
              <Button
                size="sm"
                variant="secondary"
                label={t("projectTasks.deleteTask")}
                isDisabled
              />
            </HStack>
            <Text size="sm" color="secondary">
              {t("projectTasks.deleteUnavailable")}
            </Text>
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
