import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/admin/ProjectForm'

interface ProjectEditPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !project) {
    notFound()
  }

  // Fetch linked tech IDs
  const { data: projectTech } = await supabase
    .from('project_tech')
    .select('tech_id')
    .eq('project_id', id)

  const initialTechIds = projectTech
    ? (projectTech as Array<{ tech_id: string }>).map((pt) => pt.tech_id)
    : []

  return (
    <ProjectForm
      initialData={project}
      initialTechIds={initialTechIds}
    />
  )
}
