import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ExperienceForm } from '@/components/admin/ExperienceForm'

interface ExperienceEditPageProps {
  params: Promise<{ id: string }>
}

export default async function ExperienceEditPage({ params }: ExperienceEditPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from('experience')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !item) {
    notFound()
  }

  return <ExperienceForm initialData={item} />
}
