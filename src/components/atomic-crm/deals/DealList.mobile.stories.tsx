import type { Meta } from "@storybook/react-vite";
import { ResourceContextProvider } from "ra-core";

import { DealListMobile } from "./DealListMobile";

import { StoryWrapper, buildCompany, buildDeal } from "@/test/StoryWrapper";

const meta = {
  title: "Atomic CRM/Deals/Deal List",
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
} satisfies Meta;

export default meta;

const companies = [buildCompany({ id: 1, name: "Batilor" })];

const successDeals = [
  buildDeal({
    amount: 12000,
    company_id: 1,
    id: 1,
    index: 0,
    name: "Déploiement TMS",
    stage: "opportunity",
  }),
  buildDeal({
    amount: 4500,
    company_id: 1,
    id: 2,
    index: 1,
    name: "Atelier managers",
    stage: "won",
  }),
];

export const MobileEmpty = () => (
  <StoryWrapper>
    <ResourceContextProvider value="deals">
      <DealListMobile />
    </ResourceContextProvider>
  </StoryWrapper>
);

export const MobileSuccess = () => (
  <StoryWrapper data={{ companies, deals: successDeals }}>
    <ResourceContextProvider value="deals">
      <DealListMobile />
    </ResourceContextProvider>
  </StoryWrapper>
);

export const MobileError = () => (
  <StoryWrapper
    dataProvider={{
      getList: async (resource) => {
        if (resource === "deals") {
          throw new Error("Error loading deals");
        }
        return { data: [], total: 0 };
      },
    }}
  >
    <ResourceContextProvider value="deals">
      <DealListMobile />
    </ResourceContextProvider>
  </StoryWrapper>
);
