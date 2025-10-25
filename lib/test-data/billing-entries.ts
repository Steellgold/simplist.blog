import type { BillingEntry } from "@/lib/stripe/types"

export const fakeBillingEntries: BillingEntry[] = [
  {
    id: "inv_001",
    type: "invoice",
    number: "INV-2024-001",
    date: new Date("2024-01-15"),
    amount: 2900, // $29.00
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-001.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_002",
    type: "invoice",
    number: "INV-2024-002",
    date: new Date("2024-02-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-002.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_003",
    type: "invoice",
    number: "INV-2024-003",
    date: new Date("2024-03-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-003.pdf",
    paymentMethod: {
      type: "card",
      brand: "mastercard",
      last4: "5555"
    }
  },
  {
    id: "inv_004",
    type: "invoice",
    number: "INV-2024-004",
    date: new Date("2024-04-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-004.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_005",
    type: "invoice",
    number: "INV-2024-005",
    date: new Date("2024-05-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-005.pdf",
    paymentMethod: {
      type: "card",
      brand: "amex",
      last4: "1234"
    }
  },
  {
    id: "inv_006",
    type: "invoice",
    number: "INV-2024-006",
    date: new Date("2024-06-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-006.pdf",
    paymentMethod: {
      type: "paypal"
    }
  },
  {
    id: "inv_007",
    type: "invoice",
    number: "INV-2024-007",
    date: new Date("2024-07-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-007.pdf",
    paymentMethod: {
      type: "card",
      brand: "mastercard",
      last4: "5555"
    }
  },
  {
    id: "inv_008",
    type: "invoice",
    number: "INV-2024-008",
    date: new Date("2024-08-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-008.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_009",
    type: "invoice",
    number: "INV-2024-009",
    date: new Date("2024-09-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-009.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_010",
    type: "invoice",
    number: "INV-2024-010",
    date: new Date("2024-10-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-010.pdf",
    paymentMethod: {
      type: "card",
      brand: "mastercard",
      last4: "5555"
    }
  },
  {
    id: "inv_011",
    type: "invoice",
    number: "INV-2024-011",
    date: new Date("2024-11-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-011.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_012",
    type: "invoice",
    number: "INV-2024-012",
    date: new Date("2024-12-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-012.pdf",
    paymentMethod: {
      type: "card",
      brand: "amex",
      last4: "1234"
    }
  },
  {
    id: "inv_013",
    type: "invoice",
    number: "INV-2025-001",
    date: new Date("2025-01-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-013.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_014",
    type: "invoice",
    number: "INV-2025-002",
    date: new Date("2025-02-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-014.pdf",
    paymentMethod: {
      type: "card",
      brand: "mastercard",
      last4: "5555"
    }
  },
  {
    id: "inv_015",
    type: "invoice",
    number: "INV-2025-003",
    date: new Date("2025-03-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-015.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_016",
    type: "invoice",
    number: "INV-2025-004",
    date: new Date("2025-04-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-016.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_017",
    type: "invoice",
    number: "INV-2025-005",
    date: new Date("2025-05-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-017.pdf",
    paymentMethod: {
      type: "card",
      brand: "amex",
      last4: "1234"
    }
  },
  {
    id: "inv_018",
    type: "invoice",
    number: "INV-2025-006",
    date: new Date("2025-06-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-018.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  },
  {
    id: "inv_019",
    type: "invoice",
    number: "INV-2025-007",
    date: new Date("2025-07-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-019.pdf",
    paymentMethod: {
      type: "card",
      brand: "mastercard",
      last4: "5555"
    }
  },
  {
    id: "inv_020",
    type: "invoice",
    number: "INV-2025-008",
    date: new Date("2025-08-15"),
    amount: 2900,
    currency: "usd",
    status: "paid",
    invoicePdfUrl: "https://example.com/invoice-020.pdf",
    paymentMethod: {
      type: "card",
      brand: "visa",
      last4: "4242"
    }
  }
]
