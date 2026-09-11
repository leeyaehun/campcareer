alter table public.fifo_report_orders
  add column if not exists digital_delivery_consent_at timestamptz,
  add column if not exists digital_withdrawal_acknowledged_at timestamptz,
  add column if not exists digital_delivery_consent_version text,
  add column if not exists terms_version text,
  add column if not exists privacy_version text;

alter table public.fifo_report_orders
  drop constraint if exists fifo_report_orders_digital_delivery_consent_check;

alter table public.fifo_report_orders
  add constraint fifo_report_orders_digital_delivery_consent_check
    check (
      (
        digital_delivery_consent_at is null
        and digital_withdrawal_acknowledged_at is null
        and digital_delivery_consent_version is null
        and terms_version is null
        and privacy_version is null
      )
      or (
        digital_delivery_consent_at is not null
        and digital_withdrawal_acknowledged_at is not null
        and digital_delivery_consent_version is not null
        and char_length(digital_delivery_consent_version) between 1 and 80
        and terms_version is not null
        and char_length(terms_version) between 1 and 40
        and privacy_version is not null
        and char_length(privacy_version) between 1 and 40
      )
    );

comment on column public.fifo_report_orders.digital_delivery_consent_at is
  'Server-recorded time when the buyer explicitly requested immediate digital delivery before Stripe Checkout.';
comment on column public.fifo_report_orders.digital_withdrawal_acknowledged_at is
  'Server-recorded time when the buyer acknowledged the withdrawal-right notice bundled with the immediate-delivery request.';
comment on column public.fifo_report_orders.digital_delivery_consent_version is
  'Version of the fixed checkout wording covering immediate digital delivery and withdrawal-right acknowledgement.';
comment on column public.fifo_report_orders.terms_version is
  'Terms of Service version linked beside the immediate-delivery consent.';
comment on column public.fifo_report_orders.privacy_version is
  'Privacy Policy version linked beside the immediate-delivery consent.';;
