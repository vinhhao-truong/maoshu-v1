export const SYSTEM_JOBS = [
  {
    function_key: "product-weekly-reset",
    label: "Product Weekly Reset",
    schedule_type: "recurring" as const,
    cron_expression: "0 0 * * 0",
    enabled: true,
    is_system: true,
  },
  {
    function_key: "product-monthly-reset",
    label: "Product Monthly Reset",
    schedule_type: "recurring" as const,
    cron_expression: "0 0 1 * *",
    enabled: true,
    is_system: true,
  },
  {
    function_key: "product-annual-reset",
    label: "Product Annual Reset",
    schedule_type: "recurring" as const,
    cron_expression: "0 0 1 1 *",
    enabled: true,
    is_system: true,
  },
]
