import React from "react";
import { useRouter } from "next/router";
import { useI18n } from "../../i18n/I18nProvider";
import {
  SideNav,
  SideNavItem,
  SideNavSection,
} from "@astryxdesign/core/SideNav";
import {
  FaBolt,
  FaCalendarAlt,
  FaChartPie,
  FaCog,
  FaComment,
  FaFlag,
  FaGlobe,
  FaHome,
  FaInbox,
  FaMapMarkerAlt,
  FaRegUser,
  FaRibbon,
  FaSignOutAlt,
  FaStore,
  FaTv,
  FaYoutube,
} from "react-icons/fa";

const NavigationSideBar = () => {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <SideNav className="h-full">
      <SideNavSection title={t("sidebar.newFeeds")}>
        <SideNavItem
          label={t("sidebar.newsFeed")}
          icon={<FaTv />}
          href="/"
          isSelected={router.pathname === "/"}
        />
        <SideNavItem label={t("sidebar.bedges")} icon={<FaRibbon />} />
        <SideNavItem
          label={t("sidebar.exploreStories")}
          icon={<FaGlobe />}
          href="/explore"
          isSelected={router.pathname === "/explore"}
        />
        <SideNavItem
          label={t("sidebar.popularGroups")}
          icon={<FaBolt />}
          href="/groups"
          isSelected={router.pathname === "/groups"}
        />
        <SideNavItem
          label={t("sidebar.events")}
          icon={<FaCalendarAlt />}
          href="/events"
          isSelected={router.pathname === "/events"}
        />
        <SideNavItem
          label={t("sidebar.pages")}
          icon={<FaFlag />}
          href="/pages"
          isSelected={router.pathname === "/pages"}
        />
        <SideNavItem
          label={t("sidebar.marketplace")}
          icon={<FaStore />}
          href="/marketplace"
          isSelected={router.pathname === "/marketplace"}
        />
        <SideNavItem
          label={t("sidebar.authorProfile")}
          icon={<FaRegUser />}
          href="/profile"
          isSelected={router.pathname === "/profile"}
        />
      </SideNavSection>
      <SideNavSection title={t("sidebar.morePages")}>
        <SideNavItem label={t("sidebar.emailBox")} icon={<FaInbox />} />
        <SideNavItem label={t("sidebar.nearHotel")} icon={<FaHome />} />
        <SideNavItem
          label={t("sidebar.latestEvent")}
          icon={<FaMapMarkerAlt />}
        />
        <SideNavItem label={t("sidebar.liveStream")} icon={<FaYoutube />} />
      </SideNavSection>
      <SideNavSection title={t("sidebar.account")}>
        <SideNavItem label={t("sidebar.settings")} icon={<FaCog />} />
        <SideNavItem label={t("sidebar.analytics")} icon={<FaChartPie />} />
        <SideNavItem
          label={t("sidebar.chat")}
          icon={<FaComment />}
          href="/chat"
          isSelected={router.pathname === "/chat"}
        />
        <SideNavItem label={t("sidebar.signOut")} icon={<FaSignOutAlt />} />
      </SideNavSection>
    </SideNav>
  );
};

export default NavigationSideBar;
