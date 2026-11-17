import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { FaMapMarkerAlt } from "react-icons/fa";
import dynamic from "next/dynamic";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import {
  fetchListing,
  markListingSold,
  removeListing,
  updateListing,
  uploadImages,
} from "../../lib/p4";
import type { P4Listing } from "../../types/p4";
import { formatPrice } from "../../types/p4";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
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
 * P4.3 — Trang chi tiết tin rao: ảnh, giá, mô tả, thẻ người bán,
 * đánh dấu đã bán / gỡ tin / sửa (chỉ seller).
 * v1 KHÔNG có thanh toán, KHÔNG chat với người bán, KHÔNG giao hàng.
 */
const ListingDetailPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser, user } = useStoreUser();
  const router = useRouter();
  const listingId = typeof router.query.id === "string" ? router.query.id : "";

  const [listing, setListing] = useState<P4Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = useCallback(async () => {
    if (!listingId) return;
    setLoading(true);
    try {
      const l = await fetchListing(listingId);
      if (!l) {
        setNotFound(true);
      } else {
        setListing(l);
        setTitle(l.title);
        setDescription(l.description ?? "");
        setPrice(String(l.price));
        setLocation(l.location ?? "");
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    load();
  }, [load]);

  const isSeller = !!listing && !!user && listing.sellerId === user.id;

  const handleMarkSold = async () => {
    if (!listing) return;
    setActionBusy(true);
    try {
      const updated = await markListingSold(listing.id);
      if (updated) setListing(updated);
      toast.success(t("marketplace.markedSold"));
    } catch {
      toast.error(t("marketplace.actionFailed"));
    } finally {
      setActionBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!listing) return;
    if (!window.confirm(t("marketplace.removeConfirm"))) return;
    setActionBusy(true);
    try {
      const updated = await removeListing(listing.id);
      if (updated) setListing(updated);
      toast.success(t("marketplace.listingRemoved"));
    } catch {
      toast.error(t("marketplace.actionFailed"));
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!listing) return;
    if (!title.trim()) {
      toast.error(t("marketplace.enterTitle"));
      return;
    }
    const priceNum = Number(price);
    if (!price.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      toast.error(t("marketplace.enterValidPrice"));
      return;
    }
    setActionBusy(true);
    try {
      let images: string[] | undefined = undefined;
      if (imageFiles.length) {
        images = await uploadImages(imageFiles.slice(0, 5));
      }
      const updated = await updateListing(listing.id, {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        location: location.trim(),
        ...(images !== undefined ? { images } : {}),
      });
      if (updated) setListing(updated);
      setShowEdit(false);
      setImageFiles([]);
      toast.success(t("marketplace.saved"));
    } catch {
      toast.error(t("marketplace.saveFailed"));
    } finally {
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
              <Skeleton height={256} />
            </Card>
          ) : notFound || !listing ? (
            <EmptyState
              title={t("marketplace.notFound")}
              actions={
                <Link
                  href="/marketplace"
                  className="text-sm text-accent-bright">
                  {`← ${t("marketplace.backToList")}`}
                </Link>
              }
            />
          ) : (
            <Card>
              <VStack gap={3}>
                {listing.images.length > 0 ? (
                  <VStack gap={2}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.images[activeImage]}
                      alt={listing.title}
                      className="w-full h-72 object-cover rounded-lg"
                    />
                    {listing.images.length > 1 && (
                      <HStack gap={2} isScrollable>
                        {listing.images.map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src + i}
                            src={src}
                            alt=""
                            onClick={() => setActiveImage(i)}
                            className={`h-16 w-16 object-cover rounded-md cursor-pointer border-2 ${
                              i === activeImage
                                ? "border-accent"
                                : "border-transparent"
                            }`}
                          />
                        ))}
                      </HStack>
                    )}
                  </VStack>
                ) : (
                  <HStack
                    height={192}
                    justify="center"
                    vAlign="center"
                    className="bg-surface rounded-lg">
                    <Text type="supporting">{t("marketplace.noPhotos")}</Text>
                  </HStack>
                )}

                <HStack justify="between" vAlign="center" gap={2} wrap="wrap">
                  <Text size="xl" weight="bold" color="accent">
                    {formatPrice(listing.price, listing.currency)}
                  </Text>
                  {listing.status !== "active" && (
                    <Text type="supporting" weight="medium">
                      {listing.status === "sold" ? t("marketplace.sold") : t("marketplace.removed")}
                    </Text>
                  )}
                </HStack>
                <Heading level={1}>{listing.title}</Heading>
                {listing.location && (
                  <HStack gap={1} vAlign="center">
                    <FaMapMarkerAlt className="text-muted" />
                    <Text type="supporting">{listing.location}</Text>
                  </HStack>
                )}
                {listing.description && (
                  <Text as="p" className="whitespace-pre-wrap">
                    {listing.description}
                  </Text>
                )}

                <Card variant="muted">
                  <VStack gap={1}>
                    <Text type="supporting">{t("marketplace.seller")}</Text>
                    {listing.seller ? (
                      <Link
                        href={`/${listing.seller.username}`}
                        className="font-medium text-sm hover:underline">
                        {listing.seller.fullName || listing.seller.username}
                      </Link>
                    ) : (
                      <Text type="supporting">{t("marketplace.deletedUser")}</Text>
                    )}
                    <Text type="supporting" as="p">
                      {t("marketplace.noPaymentChatNote")}
                    </Text>
                  </VStack>
                </Card>

                {isSeller && (
                  <HStack gap={2} wrap="wrap">
                    {listing.status === "active" && (
                      <Button
                        label={t("marketplace.markSold")}
                        variant="primary"
                        size="sm"
                        isDisabled={actionBusy}
                        onClick={handleMarkSold}
                      />
                    )}
                    {listing.status !== "removed" && (
                      <Button
                        label={t("marketplace.removeListing")}
                        variant="destructive"
                        size="sm"
                        isDisabled={actionBusy}
                        onClick={handleRemove}
                      />
                    )}
                    <Button
                      label={showEdit ? t("marketplace.closeEdit") : t("marketplace.editListing")}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEdit(!showEdit)}
                    />
                  </HStack>
                )}

                {showEdit && isSeller && (
                  <VStack gap={2}>
                    <TextInput
                      label={t("marketplace.listingTitleLabel")}
                      value={title}
                      onChange={(v) => setTitle(v)}
                      placeholder={t("marketplace.listingTitleLabel")}
                    />
                    <TextArea
                      label={t("marketplace.itemDescriptionLabel")}
                      value={description}
                      onChange={(v) => setDescription(v)}
                      placeholder={t("marketplace.itemDescriptionPlaceholderShort")}
                      rows={3}
                      isOptional
                    />
                    <Grid columns={{ minWidth: 220, max: 2 }} gap={2}>
                      <label className="text-xs text-muted">
                        {t("marketplace.priceLabel")}
                        <input
                          type="number"
                          min={0}
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          aria-label={t("marketplace.priceLabel")}
                          className="field w-full mt-1"
                        />
                      </label>
                      <TextInput
                        label={t("marketplace.areaLabel")}
                        value={location}
                        onChange={(v) => setLocation(v)}
                        isOptional
                      />
                    </Grid>
                    <FileInput
                      label={t("marketplace.newPhotosLabel")}
                      value={imageFiles}
                      onChange={(f) =>
                        setImageFiles(
                          Array.isArray(f) ? f : f ? [f] : []
                        )
                      }
                      accept="image/*"
                      isMultiple
                      maxFiles={5}
                      isOptional
                      description={t("marketplace.keepOldPhotos")}
                    />
                    <Button
                      label={actionBusy ? t("marketplace.saving") : t("marketplace.saveChanges")}
                      variant="primary"
                      width="100%"
                      isLoading={actionBusy}
                      onClick={handleSaveEdit}
                    />
                  </VStack>
                )}
              </VStack>
            </Card>
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default ListingDetailPage;

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
