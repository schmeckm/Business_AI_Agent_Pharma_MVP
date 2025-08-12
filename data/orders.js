export const orders = [
  {
    id: "ORD-001",
    material: "ZIML-001",
    dueDate: "2025-08-08",
    quantity: 100,
    status: "pending"
  },
  {
    id: "ORD-002",
    material: "ZIML-002",
    dueDate: "2025-08-08",
    quantity: 120,
    status: "pending"
  },
  {
    id: "ORD-003",
    material: "ZIML-003",
    dueDate: "2025-08-08",
    quantity: 80,
    status: "pending"
  },
  {
    id: "ORD-004",
    material: "ZIML-004",
    dueDate: "2025-08-08",
    quantity: 95,
    status: "pending"
  },
  {
    id: "ORD-005",
    material: "ZIML-005",
    dueDate: "2025-08-08",
    quantity: 110,
    status: "pending"
  },
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `ORD-${100 + i}`,
    material: `ZIML-${100 + i}`,
    dueDate: "2025-08-10",
    quantity: 70 + i * 2,
    status: "pending"
  }))
];
