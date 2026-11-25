import type { BadgeVariant } from '../../../shared/components/ui/Badge'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null
  const normalized =
    value.includes(' ') && !value.includes('T')
      ? value.replace(' ', 'T')
      : value
  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const parsed = parseTimestamp(value)
  if (!parsed) {
    return value.slice(0, 10)
  }
  return dateFormatter.format(parsed)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const parsed = parseTimestamp(value)
  if (!parsed) {
    return value.slice(0, 16)
  }
  return dateTimeFormatter.format(parsed)
}

const ORDER_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  delivered: 'success',
  approved: 'success',
  shipped: 'info',
  processing: 'warning',
  invoiced: 'warning',
  created: 'default',
  canceled: 'danger',
  unavailable: 'danger',
}

export function getOrderStatusVariant(status: string | null | undefined): BadgeVariant {
  if (!status) return 'default'
  return ORDER_STATUS_VARIANTS[status.toLowerCase()] ?? 'default'
}

export function formatStatusLabel(status: string | null | undefined): string {
  if (!status) return '—'
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  boleto: 'Boleto',
  voucher: 'Voucher',
  not_defined: 'Not Defined',
}

const PAYMENT_TYPE_VARIANTS: Record<string, BadgeVariant> = {
  credit_card: 'info',
  debit_card: 'info',
  boleto: 'warning',
  voucher: 'success',
  not_defined: 'default',
}

export function formatPaymentType(paymentType: string | null | undefined): string {
  if (!paymentType) return 'Unknown'
  const normalized = paymentType.toLowerCase()
  if (PAYMENT_TYPE_LABELS[normalized]) {
    return PAYMENT_TYPE_LABELS[normalized]
  }
  return normalized
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getPaymentTypeVariant(
  paymentType: string | null | undefined,
): BadgeVariant {
  if (!paymentType) return 'default'
  return PAYMENT_TYPE_VARIANTS[paymentType.toLowerCase()] ?? 'default'
}
