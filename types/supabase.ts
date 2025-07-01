export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      ganjaran: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          imej_url: string | null
          nama: string
          syarat_xp: number
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          imej_url?: string | null
          nama: string
          syarat_xp: number
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          imej_url?: string | null
          nama?: string
          syarat_xp?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: string
          sekolah: string | null
          tingkatan: string | null
          xp: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          role?: string
          sekolah?: string | null
          tingkatan?: string | null
          xp?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string
          sekolah?: string | null
          tingkatan?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      progress: {
        Row: {
          created_at: string
          id: string
          selesai: boolean | null
          topik: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          selesai?: boolean | null
          topik: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          selesai?: boolean | null
          topik?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_log: {
        Row: {
          aktiviti: string
          id: string
          mata: number
          timestamp: string
          user_id: string | null
        }
        Insert: {
          aktiviti: string
          id?: string
          mata: number
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          aktiviti?: string
          id?: string
          mata?: number
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]["Tables"]

export type Tables<T extends keyof PublicSchema> = PublicSchema[T]["Row"]
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T]



