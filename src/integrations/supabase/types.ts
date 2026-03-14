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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_comments: {
        Row: {
          blog_id: string
          comment: string
          commenter_email: string
          commenter_name: string
          created_at: string | null
          id: string
          status: string
        }
        Insert: {
          blog_id: string
          comment?: string
          commenter_email: string
          commenter_name: string
          created_at?: string | null
          id?: string
          status?: string
        }
        Update: {
          blog_id?: string
          comment?: string
          commenter_email?: string
          commenter_name?: string
          created_at?: string | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_id_fkey"
            columns: ["blog_id"]
            isOneToOne: false
            referencedRelation: "blogs"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author_email: string
          author_name: string
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          image: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_email: string
          author_name: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_email?: string
          author_name?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          image?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      booking_drivers: {
        Row: {
          booking_id: string
          created_at: string | null
          driver_id: string
          id: string
          vehicle_id: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          driver_id: string
          id?: string
          vehicle_id?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          driver_id?: string
          id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_drivers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_drivers_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_type: string
          created_at: string | null
          created_by: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          driver_id: string | null
          drop_location: string | null
          id: string
          lead_source: string | null
          notes: string | null
          num_travelers: number | null
          pickup_location: string | null
          reference_id: string | null
          reference_name: string | null
          rental_option: string | null
          status: string | null
          travel_date: string | null
          travel_time: string | null
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          booking_type?: string
          created_at?: string | null
          created_by?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          driver_id?: string | null
          drop_location?: string | null
          id?: string
          lead_source?: string | null
          notes?: string | null
          num_travelers?: number | null
          pickup_location?: string | null
          reference_id?: string | null
          reference_name?: string | null
          rental_option?: string | null
          status?: string | null
          travel_date?: string | null
          travel_time?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          booking_type?: string
          created_at?: string | null
          created_by?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          driver_id?: string | null
          drop_location?: string | null
          id?: string
          lead_source?: string | null
          notes?: string | null
          num_travelers?: number | null
          pickup_location?: string | null
          reference_id?: string | null
          reference_name?: string | null
          rental_option?: string | null
          status?: string | null
          travel_date?: string | null
          travel_time?: string | null
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          gst_number: string | null
          id: string
          lead_source: string | null
          name: string
          phone: string | null
          total_invoices: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          lead_source?: string | null
          name: string
          phone?: string | null
          total_invoices?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          lead_source?: string | null
          name?: string
          phone?: string | null
          total_invoices?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      destinations: {
        Row: {
          best_time: string | null
          brochure_url: string | null
          created_at: string | null
          description: string | null
          highlights: string[] | null
          id: string
          image: string | null
          images: string[] | null
          name: string
          short_description: string | null
          updated_at: string | null
        }
        Insert: {
          best_time?: string | null
          brochure_url?: string | null
          created_at?: string | null
          description?: string | null
          highlights?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          name: string
          short_description?: string | null
          updated_at?: string | null
        }
        Update: {
          best_time?: string | null
          brochure_url?: string | null
          created_at?: string | null
          description?: string | null
          highlights?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          name?: string
          short_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      driver_vehicles: {
        Row: {
          created_at: string | null
          driver_id: string
          id: string
          is_primary: boolean | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          driver_id: string
          id?: string
          is_primary?: boolean | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          driver_id?: string
          id?: string
          is_primary?: boolean | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_vehicles_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          email: string | null
          experience_years: number | null
          id: string
          is_active: boolean | null
          license_number: string | null
          name: string
          phone: string
          photo: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name: string
          phone?: string
          photo?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name?: string
          phone?: string
          photo?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string | null
          id: string
          name: string
          subject: string
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          body?: string
          created_at?: string | null
          id?: string
          name: string
          subject?: string
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          sort_order: number | null
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          badge_text: string | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          extra_data: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          section_key: string
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          badge_text?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          extra_data?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          badge_text?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          extra_data?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hotel_booking_details: {
        Row: {
          booking_id: string
          check_in: string | null
          check_out: string | null
          created_at: string | null
          family_members: number | null
          guest_id_image: string | null
          guest_id_number: string | null
          guest_id_type: string | null
          id: string
          marital_status: string | null
          num_beds: number | null
          num_pillows: number | null
          num_sheets: number | null
          room_id: string | null
          special_requests: string | null
        }
        Insert: {
          booking_id: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          family_members?: number | null
          guest_id_image?: string | null
          guest_id_number?: string | null
          guest_id_type?: string | null
          id?: string
          marital_status?: string | null
          num_beds?: number | null
          num_pillows?: number | null
          num_sheets?: number | null
          room_id?: string | null
          special_requests?: string | null
        }
        Update: {
          booking_id?: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          family_members?: number | null
          guest_id_image?: string | null
          guest_id_number?: string | null
          guest_id_type?: string | null
          id?: string
          marital_status?: string | null
          num_beds?: number | null
          num_pillows?: number | null
          num_sheets?: number | null
          room_id?: string | null
          special_requests?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_booking_details_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_booking_details_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hotel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_rooms: {
        Row: {
          ac_type: string
          beds: number
          created_at: string | null
          floor: string | null
          hotel_id: string
          id: string
          images: string[] | null
          is_available: boolean | null
          pillows: number
          price_per_night: number | null
          room_number: string
          room_type: string
          sheets: number
          updated_at: string | null
        }
        Insert: {
          ac_type?: string
          beds?: number
          created_at?: string | null
          floor?: string | null
          hotel_id: string
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          pillows?: number
          price_per_night?: number | null
          room_number?: string
          room_type?: string
          sheets?: number
          updated_at?: string | null
        }
        Update: {
          ac_type?: string
          beds?: number
          created_at?: string | null
          floor?: string | null
          hotel_id?: string
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          pillows?: number
          price_per_night?: number | null
          room_number?: string
          room_type?: string
          sheets?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          amenities: string[] | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          destination: string
          id: string
          image: string | null
          images: string[] | null
          is_active: boolean | null
          location: string
          name: string
          price_per_night: number | null
          rating: number | null
          short_description: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string
          id?: string
          image?: string | null
          images?: string[] | null
          is_active?: boolean | null
          location?: string
          name: string
          price_per_night?: number | null
          rating?: number | null
          short_description?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string
          id?: string
          image?: string | null
          images?: string[] | null
          is_active?: boolean | null
          location?: string
          name?: string
          price_per_night?: number | null
          rating?: number | null
          short_description?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_brands: {
        Row: {
          address: string | null
          bank_details: string | null
          created_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number | null
          unit_price: number
        }
        Insert: {
          amount?: number
          description?: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number | null
          unit_price?: number
        }
        Update: {
          amount?: number
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          booking_id: string | null
          brand_id: string | null
          cgst_amount: number | null
          cgst_percent: number | null
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_email: string | null
          customer_gst: string | null
          customer_name: string
          customer_phone: string | null
          description: string | null
          discount: number | null
          due_date: string | null
          footer_text: string | null
          heading: string | null
          id: string
          igst_amount: number | null
          igst_percent: number | null
          invoice_date: string | null
          invoice_number: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          sgst_amount: number | null
          sgst_percent: number | null
          status: string | null
          subtotal: number
          terms: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          brand_id?: string | null
          cgst_amount?: number | null
          cgst_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_gst?: string | null
          customer_name: string
          customer_phone?: string | null
          description?: string | null
          discount?: number | null
          due_date?: string | null
          footer_text?: string | null
          heading?: string | null
          id?: string
          igst_amount?: number | null
          igst_percent?: number | null
          invoice_date?: string | null
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          sgst_amount?: number | null
          sgst_percent?: number | null
          status?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          brand_id?: string | null
          cgst_amount?: number | null
          cgst_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_gst?: string | null
          customer_name?: string
          customer_phone?: string | null
          description?: string | null
          discount?: number | null
          due_date?: string | null
          footer_text?: string | null
          heading?: string | null
          id?: string
          igst_amount?: number | null
          igst_percent?: number | null
          invoice_date?: string | null
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          sgst_amount?: number | null
          sgst_percent?: number | null
          status?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "invoice_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          background_image: string | null
          booking_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          days: Json | null
          destination: string | null
          driver_name: string | null
          driver_phone: string | null
          drop_location: string | null
          duration: string | null
          emergency_contact: string | null
          exclusions: string | null
          id: string
          inclusions: string | null
          num_travelers: number | null
          package_name: string | null
          pickup_location: string | null
          price_includes_driver: boolean | null
          special_notes: string | null
          total_price: number | null
          travel_date: string | null
          updated_at: string | null
          vehicle_name: string | null
          vehicle_type: string | null
        }
        Insert: {
          background_image?: string | null
          booking_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          days?: Json | null
          destination?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          drop_location?: string | null
          duration?: string | null
          emergency_contact?: string | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          num_travelers?: number | null
          package_name?: string | null
          pickup_location?: string | null
          price_includes_driver?: boolean | null
          special_notes?: string | null
          total_price?: number | null
          travel_date?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
          vehicle_type?: string | null
        }
        Update: {
          background_image?: string | null
          booking_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          days?: Json | null
          destination?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          drop_location?: string | null
          duration?: string | null
          emergency_contact?: string | null
          exclusions?: string | null
          id?: string
          inclusions?: string | null
          num_travelers?: number | null
          package_name?: string | null
          pickup_location?: string | null
          price_includes_driver?: boolean | null
          special_notes?: string | null
          total_price?: number | null
          travel_date?: string | null
          updated_at?: string | null
          vehicle_name?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_page_sections: {
        Row: {
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          description: string | null
          extra_data: Json | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          page_key: string
          section_key: string
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          extra_data?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          page_key: string
          section_key: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          extra_data?: Json | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          page_key?: string
          section_key?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          additional_notes: string | null
          brochure_url: string | null
          created_at: string | null
          description: string | null
          destination: string
          duration: string | null
          exclusions: string[] | null
          id: string
          image: string | null
          images: string[] | null
          inclusions: string[] | null
          is_featured: boolean | null
          itinerary: string[] | null
          name: string
          original_price: number | null
          price: number
          short_description: string | null
          special_features: string[] | null
          tour_type: string
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          brochure_url?: string | null
          created_at?: string | null
          description?: string | null
          destination: string
          duration?: string | null
          exclusions?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inclusions?: string[] | null
          is_featured?: boolean | null
          itinerary?: string[] | null
          name: string
          original_price?: number | null
          price?: number
          short_description?: string | null
          special_features?: string[] | null
          tour_type?: string
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          brochure_url?: string | null
          created_at?: string | null
          description?: string | null
          destination?: string
          duration?: string | null
          exclusions?: string[] | null
          id?: string
          image?: string | null
          images?: string[] | null
          inclusions?: string[] | null
          is_featured?: boolean | null
          itinerary?: string[] | null
          name?: string
          original_price?: number | null
          price?: number
          short_description?: string | null
          special_features?: string[] | null
          tour_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      related_hotels: {
        Row: {
          created_at: string | null
          hotel_id: string
          id: string
          package_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          hotel_id: string
          id?: string
          package_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          hotel_id?: string
          id?: string
          package_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "related_hotels_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_hotels_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      related_packages: {
        Row: {
          created_at: string | null
          id: string
          package_id: string
          related_package_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          package_id: string
          related_package_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          package_id?: string
          related_package_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "related_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_packages_related_package_id_fkey"
            columns: ["related_package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          rating: number
          reviewable_id: string
          reviewable_type: string
          reviewer_email: string
          reviewer_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          comment?: string
          created_at?: string | null
          id?: string
          rating?: number
          reviewable_id: string
          reviewable_type?: string
          reviewer_email: string
          reviewer_name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          rating?: number
          reviewable_id?: string
          reviewable_type?: string
          reviewer_email?: string
          reviewer_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_edit: boolean | null
          can_view: boolean | null
          can_view_all: boolean | null
          created_at: string | null
          id: string
          is_hidden: boolean | null
          module: string
          role: string
        }
        Insert: {
          can_edit?: boolean | null
          can_view?: boolean | null
          can_view_all?: boolean | null
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          module: string
          role: string
        }
        Update: {
          can_edit?: boolean | null
          can_view?: boolean | null
          can_view_all?: boolean | null
          created_at?: string | null
          id?: string
          is_hidden?: boolean | null
          module?: string
          role?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          business_mode: string | null
          company_name: string | null
          contact_email: string | null
          doc_accent_color: string | null
          doc_font_family: string | null
          doc_primary_color: string | null
          doc_secondary_color: string | null
          id: string
          invoice_cancellation_policy: string | null
          invoice_terms: string | null
          lead_sources: Json | null
          map_lat: string | null
          map_lng: string | null
          navbar_items: Json | null
          office_address: string | null
          package_cancellation_policy: string | null
          package_terms: string | null
          phone: string | null
          show_theme_toggle: boolean | null
          smtp_enabled: boolean | null
          smtp_from_email: string | null
          smtp_from_name: string | null
          smtp_host: string | null
          smtp_pass: string | null
          smtp_port: string | null
          smtp_user: string | null
          tagline: string | null
          updated_at: string | null
          whatsapp: string | null
          whatsapp_admin_template: string | null
          whatsapp_api_key: string | null
          whatsapp_api_url: string | null
          whatsapp_booking_template: string | null
          whatsapp_enabled: boolean | null
        }
        Insert: {
          business_mode?: string | null
          company_name?: string | null
          contact_email?: string | null
          doc_accent_color?: string | null
          doc_font_family?: string | null
          doc_primary_color?: string | null
          doc_secondary_color?: string | null
          id?: string
          invoice_cancellation_policy?: string | null
          invoice_terms?: string | null
          lead_sources?: Json | null
          map_lat?: string | null
          map_lng?: string | null
          navbar_items?: Json | null
          office_address?: string | null
          package_cancellation_policy?: string | null
          package_terms?: string | null
          phone?: string | null
          show_theme_toggle?: boolean | null
          smtp_enabled?: boolean | null
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_pass?: string | null
          smtp_port?: string | null
          smtp_user?: string | null
          tagline?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          whatsapp_admin_template?: string | null
          whatsapp_api_key?: string | null
          whatsapp_api_url?: string | null
          whatsapp_booking_template?: string | null
          whatsapp_enabled?: boolean | null
        }
        Update: {
          business_mode?: string | null
          company_name?: string | null
          contact_email?: string | null
          doc_accent_color?: string | null
          doc_font_family?: string | null
          doc_primary_color?: string | null
          doc_secondary_color?: string | null
          id?: string
          invoice_cancellation_policy?: string | null
          invoice_terms?: string | null
          lead_sources?: Json | null
          map_lat?: string | null
          map_lng?: string | null
          navbar_items?: Json | null
          office_address?: string | null
          package_cancellation_policy?: string | null
          package_terms?: string | null
          phone?: string | null
          show_theme_toggle?: boolean | null
          smtp_enabled?: boolean | null
          smtp_from_email?: string | null
          smtp_from_name?: string | null
          smtp_host?: string | null
          smtp_pass?: string | null
          smtp_port?: string | null
          smtp_user?: string | null
          tagline?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          whatsapp_admin_template?: string | null
          whatsapp_api_key?: string | null
          whatsapp_api_url?: string | null
          whatsapp_booking_template?: string | null
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          icon_name: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          url?: string
        }
        Update: {
          created_at?: string | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: []
      }
      special_offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percent: number | null
          discount_text: string | null
          id: string
          image: string | null
          is_active: boolean | null
          title: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          discount_text?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          title: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          discount_text?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_types: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          label: string
          name: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          label: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          label?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_types_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brochure_url: string | null
          capacity: number | null
          created_at: string | null
          description: string | null
          features: string[] | null
          fuel_type: string | null
          id: string
          image: string | null
          images: string[] | null
          model: string | null
          name: string
          price_per_day: number | null
          price_per_km: number | null
          rental_options: string[] | null
          short_description: string | null
          sub_type: string | null
          transmission: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          brochure_url?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          model?: string | null
          name: string
          price_per_day?: number | null
          price_per_km?: number | null
          rental_options?: string[] | null
          short_description?: string | null
          sub_type?: string | null
          transmission?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          brochure_url?: string | null
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          fuel_type?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          model?: string | null
          name?: string
          price_per_day?: number | null
          price_per_km?: number | null
          rental_options?: string[] | null
          short_description?: string | null
          sub_type?: string | null
          transmission?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_all_for_module: {
        Args: { _module: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "super_admin"],
    },
  },
} as const
