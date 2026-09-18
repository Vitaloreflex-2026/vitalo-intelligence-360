import type { Meta } from "@storybook/react-vite";
import { ResourceContextProvider } from "ra-core";

import { CompanyListMobile } from "./CompanyListMobile";

import { StoryWrapper, buildCompany } from "@/test/StoryWrapper";

const meta = {
  title: "Atomic CRM/Companies/Company List",
  parameters: {
    layout: "fullscreen",
  },
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
} satisfies Meta;

export default meta;

const successCompanies = [
  buildCompany({
    id: 1,
    name: "Batilor",
    nb_contacts: 3,
    nb_deals: 2,
    sector: "Construction",
  }),
  buildCompany({
    id: 2,
    name: "Novaterre",
    nb_contacts: 0,
    nb_deals: 0,
    sector: "Énergie",
  }),
];

export const MobileEmpty = () => (
  <StoryWrapper>
    <ResourceContextProvider value="companies">
      <CompanyListMobile />
    </ResourceContextProvider>
  </StoryWrapper>
);

export const MobileSuccess = () => (
  <StoryWrapper data={{ companies: successCompanies }}>
    <ResourceContextProvider value="companies">
      <CompanyListMobile />
    </ResourceContextProvider>
  </StoryWrapper>
);

export const MobileError = () => (
  <StoryWrapper
    dataProvider={{
      getList: async (resource) => {
        if (resource === "companies") {
          throw new Error("Error loading companies");
        }
        return { data: [], total: 0 };
      },
    }}
  >
    <ResourceContextProvider value="companies">
      <CompanyListMobile />
    </ResourceContextProvider>
  </StoryWrapper>
);
