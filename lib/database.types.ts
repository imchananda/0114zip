export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      artist_follower_snapshots: {
        Row: {
          artist: string
          created_at: string | null
          followers: number
          id: number
          note: string | null
          platform: string
          recorded_date: string
        }
        Insert: {
          artist: string
          created_at?: string | null
          followers: number
          id?: number
          note?: string | null
          platform: string
          recorded_date: string
        }
        Update: {
          artist?: string
          created_at?: string | null
          followers?: number
          id?: number
          note?: string | null
          platform?: string
          recorded_date?: string
        }
        Relationships: []
      }
      artist_profiles: {
        Row: {
          birth_date: string | null
          birth_date_th: string | null
          birth_place: string | null
          birth_place_th: string | null
          education: string | null
          education_th: string | null
          full_name: string | null
          full_name_th: string | null
          id: string
          instagram: string | null
          nickname: string | null
          nickname_th: string | null
          photo_url: string | null
          twitter: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_date_th?: string | null
          birth_place?: string | null
          birth_place_th?: string | null
          education?: string | null
          education_th?: string | null
          full_name?: string | null
          full_name_th?: string | null
          id: string
          instagram?: string | null
          nickname?: string | null
          nickname_th?: string | null
          photo_url?: string | null
          twitter?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_date_th?: string | null
          birth_place?: string | null
          birth_place_th?: string | null
          education?: string | null
          education_th?: string | null
          full_name?: string | null
          full_name_th?: string | null
          id?: string
          instagram?: string | null
          nickname?: string | null
          nickname_th?: string | null
          photo_url?: string | null
          twitter?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      awards: {
        Row: {
          artist: string
          category: string
          created_at: string | null
          id: string
          result: string
          show: string
          title: string
          title_thai: string | null
          year: number
        }
        Insert: {
          artist?: string
          category: string
          created_at?: string | null
          id?: string
          result?: string
          show: string
          title: string
          title_thai?: string | null
          year: number
        }
        Update: {
          artist?: string
          category?: string
          created_at?: string | null
          id?: string
          result?: string
          show?: string
          title?: string
          title_thai?: string | null
          year?: number
        }
        Relationships: []
      }
      banner_configs: {
        Row: {
          accent_color: string | null
          banner_image: string | null
          slug: string
          tagline: string | null
          tagline_thai: string | null
          title: string
          title_thai: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          banner_image?: string | null
          slug: string
          tagline?: string | null
          tagline_thai?: string | null
          title: string
          title_thai?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          banner_image?: string | null
          slug?: string
          tagline?: string | null
          tagline_thai?: string | null
          title?: string
          title_thai?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_collaborations: {
        Row: {
          artists: string[]
          brand_logo: string | null
          brand_name: string
          category: string | null
          collab_type: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: number
          media_items: Json | null
          start_date: string | null
          visible: boolean | null
        }
        Insert: {
          artists?: string[]
          brand_logo?: string | null
          brand_name: string
          category?: string | null
          collab_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          media_items?: Json | null
          start_date?: string | null
          visible?: boolean | null
        }
        Update: {
          artists?: string[]
          brand_logo?: string | null
          brand_name?: string
          category?: string | null
          collab_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: number
          media_items?: Json | null
          start_date?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      challenge_entries: {
        Row: {
          answers: Json
          challenge_id: string
          completed_at: string | null
          id: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          challenge_id: string
          completed_at?: string | null
          id?: string
          score?: number
          user_id: string
        }
        Update: {
          answers?: Json
          challenge_id?: string
          completed_at?: string | null
          id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          cover_image: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          questions: Json
          reward_points: number
          slug: string
          start_date: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          questions?: Json
          reward_points?: number
          slug: string
          start_date?: string | null
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          questions?: Json
          reward_points?: number
          slug?: string
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          actors: string[] | null
          award_name: string | null
          award_name_thai: string | null
          brand_collab_id: number | null
          ceremony: string | null
          content_type: string
          created_at: string | null
          date: string | null
          description: string | null
          event_type: string | null
          featured: boolean | null
          id: string
          image: string | null
          issue: string | null
          link: string | null
          links: Json | null
          magazine_name: string | null
          role: string | null
          show_on_live_dashboard: boolean | null
          sort_order: number | null
          title: string
          title_thai: string | null
          updated_at: string | null
          venue: string | null
          visible: boolean | null
          work_title: string | null
          year: number | null
        }
        Insert: {
          actors?: string[] | null
          award_name?: string | null
          award_name_thai?: string | null
          brand_collab_id?: number | null
          ceremony?: string | null
          content_type: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          issue?: string | null
          link?: string | null
          links?: Json | null
          magazine_name?: string | null
          role?: string | null
          show_on_live_dashboard?: boolean | null
          sort_order?: number | null
          title: string
          title_thai?: string | null
          updated_at?: string | null
          venue?: string | null
          visible?: boolean | null
          work_title?: string | null
          year?: number | null
        }
        Update: {
          actors?: string[] | null
          award_name?: string | null
          award_name_thai?: string | null
          brand_collab_id?: number | null
          ceremony?: string | null
          content_type?: string
          created_at?: string | null
          date?: string | null
          description?: string | null
          event_type?: string | null
          featured?: boolean | null
          id?: string
          image?: string | null
          issue?: string | null
          link?: string | null
          links?: Json | null
          magazine_name?: string | null
          role?: string | null
          show_on_live_dashboard?: boolean | null
          sort_order?: number | null
          title?: string
          title_thai?: string | null
          updated_at?: string | null
          venue?: string | null
          visible?: boolean | null
          work_title?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_brand_collab_id_fkey"
            columns: ["brand_collab_id"]
            isOneToOne: false
            referencedRelation: "brand_collaborations"
            referencedColumns: ["id"]
          },
        ]
      }
      draw_entries: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          draw_id: string | null
          id: string
          is_winner: boolean | null
          tickets: number | null
          user_id: string | null
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          draw_id?: string | null
          id?: string
          is_winner?: boolean | null
          tickets?: number | null
          user_id?: string | null
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          draw_id?: string | null
          id?: string
          is_winner?: boolean | null
          tickets?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draw_entries_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "prize_draws"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_stats: {
        Row: {
          film: number | null
          id: number
          namtan: number | null
          platform: string
          updated_at: string | null
        }
        Insert: {
          film?: number | null
          id?: number
          namtan?: number | null
          platform: string
          updated_at?: string | null
        }
        Update: {
          film?: number | null
          id?: number
          namtan?: number | null
          platform?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fan_countries: {
        Row: {
          color: string | null
          country: string
          id: number
          percentage: number | null
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          country: string
          id?: number
          percentage?: number | null
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          country?: string
          id?: number
          percentage?: number | null
          sort_order?: number | null
        }
        Relationships: []
      }
      fashion_events: {
        Row: {
          actors: string[]
          brands: string[]
          category: string
          content_item_id: string | null
          created_at: string
          emv: number | null
          engagement: number | null
          event_date: string | null
          event_name: string
          hashtag: string | null
          id: string
          image_url: string | null
          in_highlight: boolean
          location: string | null
          look_count: number
          miv: number | null
          sort_order: number
          title_thai: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          actors?: string[]
          brands?: string[]
          category?: string
          content_item_id?: string | null
          created_at?: string
          emv?: number | null
          engagement?: number | null
          event_date?: string | null
          event_name: string
          hashtag?: string | null
          id?: string
          image_url?: string | null
          in_highlight?: boolean
          location?: string | null
          look_count?: number
          miv?: number | null
          sort_order?: number
          title_thai?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          actors?: string[]
          brands?: string[]
          category?: string
          content_item_id?: string | null
          created_at?: string
          emv?: number | null
          engagement?: number | null
          event_date?: string | null
          event_name?: string
          hashtag?: string | null
          id?: string
          image_url?: string | null
          in_highlight?: boolean
          location?: string | null
          look_count?: number
          miv?: number | null
          sort_order?: number
          title_thai?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fashion_events_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      follower_history: {
        Row: {
          created_at: string | null
          film_ig: number | null
          film_tiktok: number | null
          film_x: number | null
          id: number
          month: string
          month_order: number
          namtan_ig: number | null
          namtan_tiktok: number | null
          namtan_x: number | null
          year: number
        }
        Insert: {
          created_at?: string | null
          film_ig?: number | null
          film_tiktok?: number | null
          film_x?: number | null
          id?: number
          month: string
          month_order: number
          namtan_ig?: number | null
          namtan_tiktok?: number | null
          namtan_x?: number | null
          year?: number
        }
        Update: {
          created_at?: string | null
          film_ig?: number | null
          film_tiktok?: number | null
          film_x?: number | null
          id?: number
          month?: string
          month_order?: number
          namtan_ig?: number | null
          namtan_tiktok?: number | null
          namtan_x?: number | null
          year?: number
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          actors: string[] | null
          category: string | null
          created_at: string | null
          id: string
          image: string
          sort_order: number | null
          title: string | null
          title_thai: string | null
          visible: boolean | null
        }
        Insert: {
          actors?: string[] | null
          category?: string | null
          created_at?: string | null
          id?: string
          image: string
          sort_order?: number | null
          title?: string | null
          title_thai?: string | null
          visible?: boolean | null
        }
        Update: {
          actors?: string[] | null
          category?: string | null
          created_at?: string | null
          id?: string
          image?: string
          sort_order?: number | null
          title?: string | null
          title_thai?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      hashtag_sets: {
        Row: {
          artists: string[] | null
          copy_count: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          platform: string
          tags: string[]
          updated_at: string | null
        }
        Insert: {
          artists?: string[] | null
          copy_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          platform: string
          tags?: string[]
          updated_at?: string | null
        }
        Update: {
          artists?: string[] | null
          copy_count?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          platform?: string
          tags?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          image: string
          link: string | null
          sort_order: number
          subtitle: string | null
          subtitle_thai: string | null
          theme: string
          title: string | null
          title_thai: string | null
          updated_at: string
          view_state: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          image: string
          link?: string | null
          sort_order?: number
          subtitle?: string | null
          subtitle_thai?: string | null
          theme?: string
          title?: string | null
          title_thai?: string | null
          updated_at?: string
          view_state?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          image?: string
          link?: string | null
          sort_order?: number
          subtitle?: string | null
          subtitle_thai?: string | null
          theme?: string
          title?: string | null
          title_thai?: string | null
          updated_at?: string
          view_state?: string
        }
        Relationships: []
      }
      ig_posts: {
        Row: {
          artist: string
          comments: number
          created_at: string | null
          emv: number
          id: number
          impressions: number
          likes: number
          note: string | null
          post_date: string
          post_url: string | null
          reach: number
          saves: number
        }
        Insert: {
          artist: string
          comments?: number
          created_at?: string | null
          emv?: number
          id?: number
          impressions?: number
          likes?: number
          note?: string | null
          post_date: string
          post_url?: string | null
          reach?: number
          saves?: number
        }
        Update: {
          artist?: string
          comments?: number
          created_at?: string | null
          emv?: number
          id?: number
          impressions?: number
          likes?: number
          note?: string | null
          post_date?: string
          post_url?: string | null
          reach?: number
          saves?: number
        }
        Relationships: []
      }
      media_events: {
        Row: {
          actors: string[] | null
          brand_collab_id: number | null
          content_item_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          hashtags: string[] | null
          id: string
          is_active: boolean | null
          link: string | null
          start_date: string | null
          title: string
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          actors?: string[] | null
          brand_collab_id?: number | null
          content_item_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          hashtags?: string[] | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          start_date?: string | null
          title: string
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          actors?: string[] | null
          brand_collab_id?: number | null
          content_item_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          hashtags?: string[] | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_events_brand_collab_id_fkey"
            columns: ["brand_collab_id"]
            isOneToOne: false
            referencedRelation: "brand_collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_events_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      media_posts: {
        Row: {
          artist: string
          brand_collab_id: number | null
          caption: string | null
          comments: number | null
          created_at: string | null
          event_id: string | null
          goal_comments: number | null
          goal_likes: number | null
          goal_saves: number | null
          goal_shares: number | null
          goal_views: number | null
          hashtags: string[] | null
          id: string
          is_focus: boolean | null
          is_visible: boolean | null
          likes: number | null
          platform: string
          post_date: string | null
          post_url: string
          saves: number | null
          shares: number | null
          thumbnail: string | null
          title: string | null
          updated_at: string | null
          views: number | null
          work_title: string | null
        }
        Insert: {
          artist: string
          brand_collab_id?: number | null
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          event_id?: string | null
          goal_comments?: number | null
          goal_likes?: number | null
          goal_saves?: number | null
          goal_shares?: number | null
          goal_views?: number | null
          hashtags?: string[] | null
          id?: string
          is_focus?: boolean | null
          is_visible?: boolean | null
          likes?: number | null
          platform: string
          post_date?: string | null
          post_url: string
          saves?: number | null
          shares?: number | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
          work_title?: string | null
        }
        Update: {
          artist?: string
          brand_collab_id?: number | null
          caption?: string | null
          comments?: number | null
          created_at?: string | null
          event_id?: string | null
          goal_comments?: number | null
          goal_likes?: number | null
          goal_saves?: number | null
          goal_shares?: number | null
          goal_views?: number | null
          hashtags?: string[] | null
          id?: string
          is_focus?: boolean | null
          is_visible?: boolean | null
          likes?: number | null
          platform?: string
          post_date?: string | null
          post_url?: string
          saves?: number | null
          shares?: number | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string | null
          views?: number | null
          work_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_posts_brand_collab_id_fkey"
            columns: ["brand_collab_id"]
            isOneToOne: false
            referencedRelation: "brand_collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "media_events"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          country: string | null
          created_at: string | null
          id: string
          path: string
          user_agent: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          id?: string
          path: string
          user_agent?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          id?: string
          path?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      prize_draws: {
        Row: {
          claimed: number | null
          created_at: string | null
          description: string | null
          end_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          required_points: number | null
          start_at: string | null
          title_en: string | null
          title_th: string
          total_prizes: number | null
          updated_at: string | null
        }
        Insert: {
          claimed?: number | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          required_points?: number | null
          start_at?: string | null
          title_en?: string | null
          title_th: string
          total_prizes?: number | null
          updated_at?: string | null
        }
        Update: {
          claimed?: number | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          required_points?: number | null
          start_at?: string | null
          title_en?: string | null
          title_th?: string
          total_prizes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          actor: string
          category: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image: string | null
          month: number | null
          title: string
          title_thai: string | null
          year: number
        }
        Insert: {
          actor?: string
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          image?: string | null
          month?: number | null
          title: string
          title_thai?: string | null
          year: number
        }
        Update: {
          actor?: string
          category?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          month?: number | null
          title?: string
          title_thai?: string | null
          year?: number
        }
        Relationships: []
      }
      timeline_items: {
        Row: {
          actors: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          description_thai: string | null
          icon: string | null
          id: string
          image: string | null
          sort_order: number | null
          title: string
          title_thai: string | null
          visible: boolean | null
          year: number
        }
        Insert: {
          actors?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_thai?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          sort_order?: number | null
          title: string
          title_thai?: string | null
          visible?: boolean | null
          year: number
        }
        Update: {
          actors?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          description_thai?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          sort_order?: number | null
          title?: string
          title_thai?: string | null
          visible?: boolean | null
          year?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          badges: string[] | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          fandom_since: string | null
          id: string
          last_login: string | null
          level: number | null
          points: number | null
          role: string | null
          signature_url: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[] | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          fandom_since?: string | null
          id: string
          last_login?: string | null
          level?: number | null
          points?: number | null
          role?: string | null
          signature_url?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: string[] | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          fandom_since?: string | null
          id?: string
          last_login?: string | null
          level?: number | null
          points?: number | null
          role?: string | null
          signature_url?: string | null
          username?: string | null
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
