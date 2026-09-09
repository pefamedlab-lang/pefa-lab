/* ==========================================================
 * PEFA LAB — HORMONAL PROFILE ROUTING
 *
 * FIVE PANEL KEYS -> ONE RESULT-ENTRY COMPONENT
 * ========================================================== */

import HormonalProfileResultEntry from "./HormonalProfileResultEntry";

export const HORMONAL_PROFILE_ROUTE_MAP = {
  female_hormonal_day_3: {
    component: HormonalProfileResultEntry,
    profileKey: "female_day3",
    title: "Female Hormonal Profile — Day 3",
  },
  female_hormonal_day_21: {
    component: HormonalProfileResultEntry,
    profileKey: "female_day21",
    title: "Female Hormonal Profile — Day 21",
  },
  full_female_hormonal_profile: {
    component: HormonalProfileResultEntry,
    profileKey: "full_female",
    title: "Full Female Hormonal Profile",
  },
  male_hormonal_profile: {
    component: HormonalProfileResultEntry,
    profileKey: "male",
    title: "Male Hormonal Profile",
  },
  fertility_hormonal_profile: {
    component: HormonalProfileResultEntry,
    profileKey: "fertility",
    title: "Fertility Hormonal Profile",
  },
};

export const isHormonalProfileRoute = (panelKey) =>
  Boolean(HORMONAL_PROFILE_ROUTE_MAP[String(panelKey ?? "").trim()]);

export const getHormonalProfileRoute = (panelKey) =>
  HORMONAL_PROFILE_ROUTE_MAP[String(panelKey ?? "").trim()] || null;

export default HORMONAL_PROFILE_ROUTE_MAP;
