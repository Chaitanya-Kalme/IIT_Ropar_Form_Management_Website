// app/(protected)/forms/all/page.tsx

import { AllSubmittedFormsPage } from '@/components/forms/AllSubmittedFormsPage';

export default async function AllSubmittedFormsRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const getValue = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return (
    <AllSubmittedFormsPage
      formId={getValue(params.formId) ?? ''}        // ← pass it through
      initialStatus={getValue(params.status) ?? 'All'}
      initialDate={getValue(params.date) ?? ''}
      initialSearch={getValue(params.search) ?? ''}
    />
  );
}