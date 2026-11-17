import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { FaStore } from "react-icons/fa";
import dynamic from "next/dynamic";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import {
  createListing,
  fetchListings,
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
 * P4.3 — Trang Marketplace: lưới tin rao + tìm kiếm/lọc giá/khu vực
 * + form đăng tin (ảnh upload qua POST /image).
 * v1 KHÔNG có thanh toán, KHÔNG chat với người bán, KHÔNG giao hàng.
 */
const MarketplacePage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [listings, setListings] = useState<P4Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = async (
    q: string,
    min: string,
    max: string,
    loc: string,
    p: number,
    append = false
  ) => {
    setLoading(true);
    try {
      const res = await fetchListings({
        q,
        minPrice: min.trim() ? Number(min) : null,
        maxPrice: max.trim() ? Number(max) : null,
        location: loc,
        page: p,
        limit: 20,
      });
      setListings((prev) => (append ? [...prev, ...res.listings] : res.listings));
      setTotal(res.total);
      setPage(p);
    } catch {
      toast.error(t("marketplace.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () =>
        load(
          search.trim(),
          minPrice,
          maxPrice,
          location.trim(),
          1
        ),
      300
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, minPrice, maxPrice, location]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error(t("marketplace.enterTitle"));
      return;
    }
    const priceNum = Number(price);
    if (!price.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      toast.error(t("marketplace.enterValidPrice"));
      return;
    }
    setCreating(true);
    try {
      let images: string[] = [];
      if (imageFiles.length) {
        images = await uploadImages(imageFiles.slice(0, 5));
      }
      const created = await createListing({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        currency: "VND",
        images,
        location: locationInput.trim(),
      });
      toast.success(t("marketplace.posted"));
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setPrice("");
      setLocationInput("");
      setImageFiles([]);
      if (created) setListings((prev) => [created, ...prev]);
      else load("", "", "", "", 1);
    } catch {
      toast.error(t("marketplace.postFailed"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Navigation />
      <HStack justify="center" width="100%" className="bg-paper">
        <VStack
          gap={3}
          width="100%"
          maxWidth={1024}
          paddingInline={2}
          paddingBlockStart={2}
          paddingBlockEnd={8}>
          <Card>
            <VStack gap={3}>
              <HStack justify="between" vAlign="center" gap={2}>
                <HStack gap={2} vAlign="center">
                  <FaStore className="text-accent-bright" />
                  <Heading level={1}>{t("marketplace.title")}</Heading>
                </HStack>
                <Button
                  label={showCreate ? t("common.close") : t("marketplace.postListing")}
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreate(!showCreate)}
                />
              </HStack>
              {showCreate && (
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
                    placeholder={t("marketplace.itemDescriptionPlaceholder")}
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
                        placeholder="0"
                        aria-label={t("marketplace.priceLabel")}
                        className="field w-full mt-1"
                      />
                    </label>
                    <TextInput
                      label={t("marketplace.areaLabel")}
                      value={locationInput}
                      onChange={(v) => setLocationInput(v)}
                      placeholder={t("marketplace.areaPlaceholder")}
                      isOptional
                    />
                  </Grid>
                  <FileInput
                    label={t("marketplace.itemPhotosLabel")}
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
                    description={t("marketplace.maxPhotos")}
                  />
                  <Text type="supporting" as="p">
                    {t("marketplace.noPaymentNote")}
                  </Text>
                  <Button
                    label={creating ? t("marketplace.creating") : t("marketplace.createListing")}
                    variant="primary"
                    width="100%"
                    isLoading={creating}
                    onClick={handleCreate}
                  />
                </VStack>
              )}
              <Grid columns={{ minWidth: 180, max: 4 }} gap={2}>
                <TextInput
                  label={t("marketplace.searchLabel")}
                  type="search"
                  value={search}
                  onChange={(v) => setSearch(v)}
                  placeholder={t("marketplace.searchPlaceholder")}
                  isLabelHidden
                  hasClear
                />
                <TextInput
                  label={t("marketplace.areaLabel")}
                  value={location}
                  onChange={(v) => setLocation(v)}
                  placeholder={t("marketplace.areaPlaceholderShort")}
                  isLabelHidden
                />
                <HStack gap={2}>
                  <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder={t("marketplace.priceFrom")}
                    aria-label={t("marketplace.priceFrom")}
                    className="field w-full"
                  />
                  <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder={t("marketplace.priceTo")}
                    aria-label={t("marketplace.priceToLabel")}
                    className="field w-full"
                  />
                </HStack>
              </Grid>
            </VStack>
          </Card>

          {loading && listings.length === 0 ? (
            <Grid columns={{ minWidth: 240, max: 4 }} gap={3}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height={224} index={i} />
              ))}
            </Grid>
          ) : listings.length === 0 ? (
            <EmptyState
              title={t("marketplace.noListings")}
              description={t("marketplace.createFirst")}
            />
          ) : (
            <Grid columns={{ minWidth: 240, max: 4 }} gap={3}>
              {listings.map((l) => (
                <Link
                  key={l.id}
                  href={`/marketplace/${l.id}`}
                  className="block h-full">
                  <Card padding={0} height="100%">
                    {l.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.images[0]}
                        alt={l.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                    ) : (
                      <HStack
                        height={160}
                        justify="center"
                        vAlign="center"
                        className="bg-surface">
                        <FaStore className="text-3xl text-muted" />
                      </HStack>
                    )}
                    <VStack gap={1} padding={3}>
                      <Text weight="semibold" color="accent" as="p">
                        {formatPrice(l.price, l.currency)}
                      </Text>
                      <Text maxLines={1} as="p">
                        {l.title}
                      </Text>
                      {l.location && (
                        <Text type="supporting" maxLines={1} as="p">
                          {l.location}
                        </Text>
                      )}
                    </VStack>
                  </Card>
                </Link>
              ))}
            </Grid>
          )}

          {total > listings.length && (
            <Button
              label={loading ? t("common.loading") : t("feed.loadMore")}
              variant="secondary"
              width="100%"
              isLoading={loading}
              onClick={() =>
                load(
                  search.trim(),
                  minPrice,
                  maxPrice,
                  location.trim(),
                  page + 1,
                  true
                )
              }
            />
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default MarketplacePage;

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
