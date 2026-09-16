import React from "react";

import type { Deal } from "../types";

const DealList = React.lazy(() => import("./DealList"));

export default {
  list: DealList,
  recordRepresentation: (record: Deal) => record.reference || `#${record.id}`,
};
