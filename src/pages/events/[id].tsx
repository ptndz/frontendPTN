import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import dynamic from "next/dynamic";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import {
  attendEvent,
  deleteEvent,
  fetchEvent,
  fetchEventAttendees,
  updateEvent,
  uploadImages,
} from "../../lib/p4";
import type { AttendStatus, EventAttendee, P4Event } from "../../types/p4";
import { formatEventDate } from "../../types/p4";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { DateTimeInput } from "@astryxdesign/core/DateTimeInput";
import type { ISODateTimeString } from "@astryxdesign/core/DateTimeInput";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { FileInput } from "@astryxdesign/core/FileInput";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { List, ListItem } from "@astryxdesign/core/List";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

const DynamicWidgetMessage = dynamic(
  () => import("../../components/Messages/WidgetMessage"),
  { ssr: false }
);


interface IProps {
  userData: User;
}

/** Chuyển ISO sang giá trị cho input datetime-local (YYYY-MM-DDTHH:mm). */
const toLocalInput = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const STATUS_VALUES: AttendStatus[] = ["going", "interested", "not-going"];

/**
 * P4.3 — Trang chi tiết sự kiện: thông tin, nút tham gia, danh sách
 * người tham gia, sửa/xóa (chỉ creator).
 */
const EventDetailPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();

  const statusButtonLabel = (s: AttendStatus): string =>
    s === "going"
      ? t("events.goingLabel")
      : s === "interested"
        ? t("events.interestedLabel")
        : t("events.notGoingLabel");
  const { setUser, user } = useStoreUser();
  const router = useRouter();
  const eventId = typeof router.query.id === "string" ? router.query.id : "";

  const [event, setEvent] = useState<P4Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const [e, a] = await Promise.all([
        fetchEvent(eventId),
        fetchEventAttendees(eventId).catch(() => ({
          attendees: [] as EventAttendee[],
          counts: { going: 0, interested: 0, notGoing: 0 },
        })),
      ]);
      if (!e) {
        setNotFound(true);
      } else {
        setEvent(e);
        setAttendees(a.attendees);
        setTitle(e.title);
        setDescription(e.description ?? "");
        setLocation(e.location ?? "");
        setStartsAt(toLocalInput(e.startsAt));
        setEndsAt(toLocalInput(e.endsAt));
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const isCreator = !!event && !!user && event.creatorId === user.id;

  const handleAttend = async (status: AttendStatus) => {
    if (!event) return;
    setActionBusy(true);
    try {
      const updated = await attendEvent(event.id, status);
      if (updated) setEvent(updated);
      const a = await fetchEventAttendees(event.id).catch(() => null);
      if (a) setAttendees(a.attendees);
      toast.success(t("events.statusUpdated"));
    } catch {
      toast.error(t("events.actionFailed"));
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!event) return;
    if (!title.trim()) {
      toast.error(t("events.enterTitle"));
      return;
    }
    if (!startsAt) {
      toast.error(t("events.chooseStart"));
      return;
    }
    if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
      toast.error(t("events.endAfterStart"));
      return;
    }
    setActionBusy(true);
    try {
      let coverImage: string | null | undefined = undefined;
      if (coverFile) {
        const urls = await uploadImages([coverFile]);
        coverImage = urls[0] ?? null;
      }
      const updated = await updateEvent(event.id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        ...(coverImage !== undefined ? { coverImage } : {}),
      });
      if (updated) setEvent(updated);
      setShowEdit(false);
      setCoverFile(null);
      toast.success(t("events.saved"));
    } catch {
      toast.error(t("events.saveFailed"));
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!window.confirm(t("events.deleteConfirm"))) return;
    setActionBusy(true);
    try {
      await deleteEvent(event.id);
      toast.success(t("events.deleted"));
      router.push("/events");
    } catch {
      toast.error(t("events.deleteFailed"));
      setActionBusy(false);
    }
  };

  return (
    <>
      <Navigation />
      <HStack justify="center" width="100%" className="bg-paper">
        <VStack
          gap={3}
          width="100%"
          maxWidth={768}
          paddingInline={2}
          paddingBlockStart={2}
          paddingBlockEnd={8}>
          {loading ? (
            <Card>
              <Skeleton height={160} />
            </Card>
          ) : notFound || !event ? (
            <EmptyState
              title={t("events.notFound")}
              actions={
                <Link href="/events" className="text-sm text-accent-bright">
                  {`← ${t("events.backToList")}`}
                </Link>
              }
            />
          ) : (
            <>
              <Card>
                <VStack gap={3}>
                  {event.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-56 object-cover rounded-lg"
                    />
                  )}
                  <Heading level={1}>{event.title}</Heading>
                  <HStack gap={1} vAlign="center">
                    <FaCalendarAlt className="text-muted" />
                    <Text type="supporting">
                      {formatEventDate(event.startsAt)}
                      {event.endsAt &&
                        ` — ${formatEventDate(event.endsAt)}`}
                    </Text>
                  </HStack>
                  {event.location && (
                    <HStack gap={1} vAlign="center">
                      <FaMapMarkerAlt className="text-muted" />
                      <Text type="supporting">{event.location}</Text>
                    </HStack>
                  )}
                  {event.description && (
                    <Text as="p" className="whitespace-pre-wrap">
                      {event.description}
                    </Text>
                  )}
                  <Text type="supporting" as="p">
                    {t("events.createdBy")}{" "}
                    {event.creator ? (
                      <Link
                        href={`/${event.creator.username}`}
                        className="text-accent-bright">
                        {event.creator.fullName || event.creator.username}
                      </Link>
                    ) : (
                      t("events.deletedUser")
                    )}{" "}
                    · {t("events.goingCount", { count: event.goingCount })} ·{" "}
                    {t("events.interestedCount", { count: event.interestedCount })} ·{" "}
                    {t("events.notGoingCount", { count: event.notGoingCount })}
                  </Text>

                  <HStack gap={2} wrap="wrap">
                    {STATUS_VALUES.map((s) => (
                      <Button
                        key={s}
                        label={statusButtonLabel(s)}
                        variant={
                          event.myStatus === s
                            ? "primary"
                            : "secondary"
                        }
                        size="sm"
                        isDisabled={actionBusy}
                        onClick={() => handleAttend(s)}
                      />
                    ))}
                    {isCreator && (
                      <>
                        <Button
                          label={showEdit ? t("events.closeEdit") : t("events.editEvent")}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEdit(!showEdit)}
                        />
                        <Button
                          label={t("events.deleteEvent")}
                          variant="destructive"
                          size="sm"
                          isDisabled={actionBusy}
                          onClick={handleDelete}
                        />
                      </>
                    )}
                  </HStack>

                  {showEdit && isCreator && (
                    <VStack gap={2}>
                      <TextInput
                        label={t("events.eventTitleLabel")}
                        value={title}
                        onChange={(v) => setTitle(v)}
                        placeholder={t("events.eventTitleLabel")}
                      />
                      <TextArea
                        label={t("events.descriptionLabel")}
                        value={description}
                        onChange={(v) => setDescription(v)}
                        placeholder={t("events.descriptionPlaceholderShort")}
                        rows={3}
                        isOptional
                      />
                      <TextInput
                        label={t("events.locationLabel")}
                        value={location}
                        onChange={(v) => setLocation(v)}
                        placeholder={t("events.locationPlaceholderShort")}
                        isOptional
                      />
                      <Grid columns={{ minWidth: 220, max: 2 }} gap={2}>
                        <DateTimeInput
                          label={t("events.startsLabel")}
                          value={
                            (startsAt || undefined) as
                              | ISODateTimeString
                              | undefined
                          }
                          onChange={(v) => setStartsAt(v ?? "")}
                        />
                        <DateTimeInput
                          label={t("events.endsLabel")}
                          value={
                            (endsAt || undefined) as
                              | ISODateTimeString
                              | undefined
                          }
                          onChange={(v) => setEndsAt(v ?? "")}
                          isOptional
                          hasClear
                        />
                      </Grid>
                      <FileInput
                        label={t("events.newCoverLabel")}
                        value={coverFile}
                        onChange={(f) =>
                          setCoverFile(
                            Array.isArray(f) ? (f[0] ?? null) : f
                          )
                        }
                        accept="image/*"
                        isOptional
                        description={t("events.keepOldCover")}
                      />
                      <Button
                        label={actionBusy ? t("events.saving") : t("events.saveChanges")}
                        variant="primary"
                        width="100%"
                        isLoading={actionBusy}
                        onClick={handleSaveEdit}
                      />
                    </VStack>
                  )}
                </VStack>
              </Card>

              <VStack gap={2}>
                <HStack gap={2} vAlign="center">
                  <Heading level={2}>{t("events.attendees")}</Heading>
                  <Badge label={String(attendees.length)} variant="neutral" />
                </HStack>
                {attendees.length === 0 ? (
                  <Text type="supporting">
                    {t("events.noAttendees")}
                  </Text>
                ) : (
                  <List hasDividers>
                    {attendees.map((a) => (
                      <ListItem
                        key={a.id}
                        label={
                          <Link href={`/${a.user.username}`}>
                            <Text weight="medium" maxLines={1}>
                              {a.user.fullName || a.user.username}
                            </Text>
                          </Link>
                        }
                        description={
                          a.status === "going"
                            ? t("events.goingLabel")
                            : a.status === "interested"
                              ? t("events.interestedLabel")
                              : t("events.notGoingLabel")
                        }
                      />
                    ))}
                  </List>
                )}
              </VStack>
            </>
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default EventDetailPage;

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
