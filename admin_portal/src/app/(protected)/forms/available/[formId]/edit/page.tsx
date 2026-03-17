import { notFound } from 'next/navigation';
import { FormBuilderPage } from '@/components/forms/FormBuilderPage';
import { getFormById } from '@/data/mockData';

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;

  if (!getFormById(formId)) {
    notFound();
  }

  return <FormBuilderPage mode="edit" formId={formId} />;
}
