import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  createEvent,
  fetchEvents,
  uploadImages,
} from "../../lib/p4";
import type { P4Event } from "../../types/p4";
import { formatEventDate } from "../../types/p4";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { DateTimeInput } from "@astryxdesign/core/DateTimeInput";
import type { ISODateTimeString } from "@astryxdesign/core/DateTimeInput";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { FileInput } from "@astryxdesign/core/FileInput";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
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

/**
 * P4.3 — Trang sự kiện: tìm kiếm + lọc sắp diễn ra + danh sách + tạo event.
 * Ảnh bìa upload qua POST /image rồi gửi URL kèm lúc tạo.
 */
const EventsPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const [search, setSearch] = useState("");
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [events, setEvents] = useState<P4Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = async (q: string, upcoming: boolean, p: number, append = false) => {
    setLoading(true);
    try {
      const res = await fetchEvents({ q, upcoming, page: p, limit: 20 });
      setEvents((prev) => (append ? [...prev, ...res.events] : res.events));
      setTotal(res.total);
      setPage(p);
    } catch {
      toast.error(t("events.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => load(search.trim(), upcomingOnly, 1),
      300
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, upcomingOnly]);

  const handleCreate = async () => {
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
    setCreating(true);
    try {
      let coverImage: string | null = null;
      if (coverFile) {
        const urls = await uploadImages([coverFile]);
        coverImage = urls[0] ?? null;
      }
      const event = await createEvent({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        coverImage,
      });
      toast.success(t("events.created"));
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setLocation("");
      setStartsAt("");
      setEndsAt("");
      setCoverFile(null);
      if (event) setEvents((prev) => [event, ...prev]);
      else load("", upcomingOnly, 1);
    } catch {
      toast.error(t("events.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const statusLabel = (s: string | null): string =>
    s === "going"
      ? t("events.statusGoing")
      : s === "interested"
        ? t("events.statusInterested")
        : s === "not-going"
          ? t("events.statusNotGoing")
          : "";

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
          <Card>
            <VStack gap={3}>
              <HStack justify="between" vAlign="center" gap={2}>
                <HStack gap={2} vAlign="center">
                  <FaCalendarAlt className="text-accent-bright" />
                  <Heading level={1}>{t("events.title")}</Heading>
                </HStack>
                <Button
                  label={showCreate ? t("common.close") : `+ ${t("events.createEvent")}`}
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreate(!showCreate)}
                />
              </HStack>
              {showCreate && (
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
                    placeholder={t("events.descriptionPlaceholder")}
                    rows={3}
                    isOptional
                  />
                  <TextInput
                    label={t("events.locationLabel")}
                    value={location}
                    onChange={(v) => setLocation(v)}
                    placeholder={t("events.locationPlaceholder")}
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
                    label={t("events.coverLabel")}
                    value={coverFile}
                    onChange={(f) =>
                      setCoverFile(
                        Array.isArray(f) ? (f[0] ?? null) : f
                      )
                    }
                    accept="image/*"
                    isOptional
                  />
                  <Button
                    label={creating ? t("events.creating") : t("events.createEvent")}
                    variant="primary"
                    width="100%"
                    isLoading={creating}
                    onClick={handleCreate}
                  />
                </VStack>
              )}
              <TextInput
                label={t("events.searchLabel")}
                type="search"
                value={search}
                onChange={(v) => setSearch(v)}
                placeholder={t("events.searchPlaceholder")}
                isLabelHidden
                hasClear
              />
              <CheckboxInput
                label={t("events.upcomingOnly")}
                value={upcomingOnly}
                onChange={(v) => setUpcomingOnly(v)}
              />
            </VStack>
          </Card>

          {loading && events.length === 0 ? (
            <VStack gap={3}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={96} index={i} />
              ))}
            </VStack>
          ) : events.length === 0 ? (
            <EmptyState
              title={
                search.trim()
                  ? t("events.noEventsFound", { q: search.trim() })
                  : t("events.noEvents")
              }
              description={
                search.trim() ? undefined : t("events.createFirst")
              }
            />
          ) : (
            <VStack gap={3}>
              {events.map((event) => (
                <Card key={event.id}>
                  <VStack gap={2}>
                    <Link href={`/events/${event.id}`}>
                      <VStack gap={2}>
                        {event.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.coverImage}
                            alt={event.title}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        )}
                        <Text weight="semibold" as="p">
                          {event.title}
                        </Text>
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
                          <Text type="supporting" maxLines={1} as="p">
                            {event.description}
                          </Text>
                        )}
                      </VStack>
                    </Link>
                    <HStack justify="between" vAlign="center" gap={2} wrap="wrap">
                      <Text type="supporting">
                        {t("events.goingCount", { count: event.goingCount })} ·{" "}
                        {t("events.interestedCount", { count: event.interestedCount })}
                      </Text>
                      {event.myStatus && (
                        <Text
                          type="supporting"
                          color="accent"
                          weight="medium">
                          {statusLabel(event.myStatus)}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </Card>
              ))}
            </VStack>
          )}

          {total > events.length && (
            <Button
              label={loading ? t("common.loading") : t("feed.loadMore")}
              variant="secondary"
              width="100%"
              isLoading={loading}
              onClick={() =>
                load(search.trim(), upcomingOnly, page + 1, true)
              }
            />
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default EventsPage;

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
