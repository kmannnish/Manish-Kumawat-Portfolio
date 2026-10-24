export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          message: string
          meta: Json
          name: string
          notes: string | null
          phone: string | null
          replied_at: string | null
          spam_score: number | null
          status: Database['public']['Enums']['submission_status']
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          message: string
          meta?: Json
          name: string
          notes?: string | null
          phone?: string | null
          replied_at?: string | null
          spam_score?: number | null
          status?: Database['public']['Enums']['submission_status']
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          message?: string
          meta?: Json
          name?: string
          notes?: string | null
          phone?: string | null
          replied_at?: string | null
          spam_score?: number | null
          status?: Database['public']['Enums']['submission_status']
          updated_at?: string
        }
        Relationships: []
      }
      copy: {
        Row: {
          group_name: string
          help: string | null
          key: string
          kind: 'text' | 'richtext' | 'markdown'
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          group_name?: string
          help?: string | null
          key: string
          kind?: 'text' | 'richtext' | 'markdown'
          label: string
          updated_at?: string
          value?: string
        }
        Update: {
          group_name?: string
          help?: string | null
          key?: string
          kind?: 'text' | 'richtext' | 'markdown'
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          bucket: string
          byte_size: number | null
          created_at: string
          id: string
          label: string
          mime_type: string | null
          path: string
          updated_at: string
          version: string | null
        }
        Insert: {
          bucket?: string
          byte_size?: number | null
          created_at?: string
          id?: string
          label: string
          mime_type?: string | null
          path: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          bucket?: string
          byte_size?: number | null
          created_at?: string
          id?: string
          label?: string
          mime_type?: string | null
          path?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      experience: {
        Row: {
          accent_color: string | null
          created_at: string
          employment_type: 'full-time' | 'contract' | 'advisory' | null
          ended_on: string | null
          highlights: Json
          id: string
          is_visible: boolean
          location: string | null
          organization: string
          role: string
          sort_order: number
          started_on: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          employment_type?: 'full-time' | 'contract' | 'advisory' | null
          ended_on?: string | null
          highlights?: Json
          id?: string
          is_visible?: boolean
          location?: string | null
          organization: string
          role: string
          sort_order?: number
          started_on: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          employment_type?: 'full-time' | 'contract' | 'advisory' | null
          ended_on?: string | null
          highlights?: Json
          id?: string
          is_visible?: boolean
          location?: string | null
          organization?: string
          role?: string
          sort_order?: number
          started_on?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string
          bucket: string
          byte_size: number | null
          caption: string | null
          created_at: string
          duration_seconds: number | null
          height: number | null
          id: string
          kind: Database['public']['Enums']['media_kind']
          mime_type: string | null
          path: string
          placeholder: string | null
          tool_tags: string[]
          updated_at: string
          video_url: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string
          bucket?: string
          byte_size?: number | null
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          kind?: Database['public']['Enums']['media_kind']
          mime_type?: string | null
          path: string
          placeholder?: string | null
          tool_tags?: string[]
          updated_at?: string
          video_url?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string
          bucket?: string
          byte_size?: number | null
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          kind?: Database['public']['Enums']['media_kind']
          mime_type?: string | null
          path?: string
          placeholder?: string | null
          tool_tags?: string[]
          updated_at?: string
          video_url?: string | null
          width?: number | null
        }
        Relationships: []
      }
      nav_items: {
        Row: {
          href: string
          id: string
          is_external: boolean
          is_visible: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          href: string
          id?: string
          is_external?: boolean
          is_visible?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          href?: string
          id?: string
          is_external?: boolean
          is_visible?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          cover_media_id: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          reading_minutes: number | null
          slug: string
          status: Database['public']['Enums']['publish_status']
          tags: Json
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          cover_media_id?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          slug: string
          status?: Database['public']['Enums']['publish_status']
          tags?: Json
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          cover_media_id?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          reading_minutes?: number | null
          slug?: string
          status?: Database['public']['Enums']['publish_status']
          tags?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'posts_cover_media_id_fkey'
            columns: ['cover_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      project_media: {
        Row: {
          media_id: string
          project_id: string
          role: 'cover' | 'gallery' | 'inline'
          sort_order: number
        }
        Insert: {
          media_id: string
          project_id: string
          role?: 'cover' | 'gallery' | 'inline'
          sort_order?: number
        }
        Update: {
          media_id?: string
          project_id?: string
          role?: 'cover' | 'gallery' | 'inline'
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'project_media_media_id_fkey'
            columns: ['media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_media_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      project_tech: {
        Row: {
          project_id: string
          tech_id: string
        }
        Insert: {
          project_id: string
          tech_id: string
        }
        Update: {
          project_id?: string
          tech_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_tech_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_tech_tech_id_fkey'
            columns: ['tech_id']
            isOneToOne: false
            referencedRelation: 'tech'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          accent_color: string | null
          approach: string | null
          body: string
          client_name: string | null
          cover_media_id: string | null
          created_at: string
          ended_on: string | null
          id: string
          is_featured: boolean
          links: Json
          metrics: Json
          outcome: string | null
          problem: string | null
          published_at: string | null
          role: string | null
          seo_description: string | null
          seo_title: string | null
          show_in_design_section: boolean
          slug: string
          sort_order: number
          started_on: string
          status: Database['public']['Enums']['publish_status']
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          approach?: string | null
          body?: string
          client_name?: string | null
          cover_media_id?: string | null
          created_at?: string
          ended_on?: string | null
          id?: string
          is_featured?: boolean
          links?: Json
          metrics?: Json
          outcome?: string | null
          problem?: string | null
          published_at?: string | null
          role?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_design_section?: boolean
          slug: string
          sort_order?: number
          started_on: string
          status?: Database['public']['Enums']['publish_status']
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          approach?: string | null
          body?: string
          client_name?: string | null
          cover_media_id?: string | null
          created_at?: string
          ended_on?: string | null
          id?: string
          is_featured?: boolean
          links?: Json
          metrics?: Json
          outcome?: string | null
          problem?: string | null
          published_at?: string | null
          role?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_in_design_section?: boolean
          slug?: string
          sort_order?: number
          started_on?: string
          status?: Database['public']['Enums']['publish_status']
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_cover_media_id_fkey'
            columns: ['cover_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      sections: {
        Row: {
          config: Json
          id: string
          is_visible: boolean
          kind: Database['public']['Enums']['section_kind']
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          config?: Json
          id?: string
          is_visible?: boolean
          kind: Database['public']['Enums']['section_kind']
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json
          id?: string
          is_visible?: boolean
          kind?: Database['public']['Enums']['section_kind']
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_email: string | null
          currently: string
          id: boolean
          location: string | null
          og_image_id: string | null
          owner_name: string
          resume_document_id: string | null
          role_title: string
          seo_description: string | null
          seo_title: string | null
          social_links: Json
          tagline: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          currently?: string
          id?: boolean
          location?: string | null
          og_image_id?: string | null
          owner_name?: string
          resume_document_id?: string | null
          role_title?: string
          seo_description?: string | null
          seo_title?: string | null
          social_links?: Json
          tagline?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          currently?: string
          id?: boolean
          location?: string | null
          og_image_id?: string | null
          owner_name?: string
          resume_document_id?: string | null
          role_title?: string
          seo_description?: string | null
          seo_title?: string | null
          social_links?: Json
          tagline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'site_settings_og_image_id_fkey'
            columns: ['og_image_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'site_settings_resume_document_id_fkey'
            columns: ['resume_document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
        ]
      }
      tech: {
        Row: {
          category: 'language' | 'framework' | 'model' | 'infra' | 'data' | 'tooling' | 'design'
          created_at: string
          icon_media_id: string | null
          id: string
          is_featured: boolean
          name: string
          proficiency: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: 'language' | 'framework' | 'model' | 'infra' | 'data' | 'tooling' | 'design'
          created_at?: string
          icon_media_id?: string | null
          id?: string
          is_featured?: boolean
          name: string
          proficiency?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: 'language' | 'framework' | 'model' | 'infra' | 'data' | 'tooling' | 'design'
          created_at?: string
          icon_media_id?: string | null
          id?: string
          is_featured?: boolean
          name?: string
          proficiency?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tech_icon_media_id_fkey'
            columns: ['icon_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
      testimonials: {
        Row: {
          author_media_id: string | null
          author_name: string
          author_org: string | null
          author_role: string | null
          created_at: string
          id: string
          is_visible: boolean
          quote: string
          sort_order: number
          source_url: string | null
          updated_at: string
        }
        Insert: {
          author_media_id?: string | null
          author_name: string
          author_org?: string | null
          author_role?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          quote: string
          sort_order?: number
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          author_media_id?: string | null
          author_name?: string
          author_org?: string | null
          author_role?: string | null
          created_at?: string
          id?: string
          is_visible?: boolean
          quote?: string
          sort_order?: number
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'testimonials_author_media_id_fkey'
            columns: ['author_media_id']
            isOneToOne: false
            referencedRelation: 'media'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      content_last_updated: {
        Args: Record<PropertyKey, never>
        Returns: string | null
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      media_kind: 'image' | 'video' | 'audio' | 'poster' | 'print' | 'stage' | 'mockup'
      publish_status: 'draft' | 'published' | 'archived'
      section_kind:
        | 'hero'
        | 'trace'
        | 'work'
        | 'design'
        | 'writing'
        | 'skills'
        | 'about'
        | 'testimonials'
        | 'contact'
        | 'custom'
      submission_status: 'new' | 'read' | 'replied' | 'archived' | 'spam'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
