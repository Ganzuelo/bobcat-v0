import { supabase } from "./supabase-client"

export interface AppSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: "string" | "boolean" | "number"
  description?: string
  created_at: string
  updated_at: string
}

export interface AppSettings {
  app_name: string
  company_name: string
  logo_icon: string
  email_notifications_enabled: boolean
  push_notifications_enabled: boolean
  terms_of_service: string
  privacy_policy: string
}

export class AppSettingsService {
  private static cache: Map<string, string> = new Map()
  private static initialized = false

  // Initialize settings cache
  static async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const { data, error } = await supabase.from("app_settings").select("setting_key, setting_value")

      if (error) {
        console.error("Error loading app settings:", error)
        return
      }

      // Populate cache
      data?.forEach((setting) => {
        this.cache.set(setting.setting_key, setting.setting_value)
      })

      this.initialized = true
      console.log("App settings initialized:", this.cache)
    } catch (error) {
      console.error("Error initializing app settings:", error)
    }
  }

  // Get a single setting
  static async getSetting(key: string): Promise<string | null> {
    await this.initialize()
    return this.cache.get(key) || null
  }

  // Get all settings as a typed object
  static async getAllSettings(): Promise<AppSettings> {
    await this.initialize()

    return {
      app_name: this.cache.get("app_name") || "Project Bobcat",
      company_name: this.cache.get("company_name") || "Your Company",
      logo_icon: this.cache.get("logo_icon") || "Cat",
      email_notifications_enabled: this.cache.get("email_notifications_enabled") === "true",
      push_notifications_enabled: this.cache.get("push_notifications_enabled") === "true",
      terms_of_service: this.cache.get("terms_of_service") || "",
      privacy_policy: this.cache.get("privacy_policy") || "",
    }
  }

  // Update a single setting
  static async updateSetting(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("app_settings")
        .update({
          setting_value: value,
          updated_at: new Date().toISOString(),
        })
        .eq("setting_key", key)

      if (error) {
        console.error("Error updating setting:", error)
        return false
      }

      // Update cache
      this.cache.set(key, value)

      // Dispatch event for real-time updates
      this.dispatchSettingChange(key, value)

      return true
    } catch (error) {
      console.error("Error updating setting:", error)
      return false
    }
  }

  // Update multiple settings
  static async updateSettings(settings: Partial<AppSettings>): Promise<boolean> {
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: String(value),
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from("app_settings").upsert(updates, { onConflict: "setting_key" })

      if (error) {
        console.error("Error updating settings:", error)
        return false
      }

      // Update cache and dispatch events
      Object.entries(settings).forEach(([key, value]) => {
        this.cache.set(key, String(value))
        this.dispatchSettingChange(key, String(value))
      })

      return true
    } catch (error) {
      console.error("Error updating settings:", error)
      return false
    }
  }

  // Dispatch custom events for setting changes
  private static dispatchSettingChange(key: string, value: string): void {
    if (typeof window !== "undefined") {
      // Map setting keys to event names for backward compatibility
      const eventMap: Record<string, string> = {
        app_name: "appNameChanged",
        company_name: "companyNameChanged",
        logo_icon: "logoIconChanged",
      }

      const eventName = eventMap[key]
      if (eventName) {
        window.dispatchEvent(new CustomEvent(eventName, { detail: value }))
      }

      // Also dispatch a generic setting change event
      window.dispatchEvent(
        new CustomEvent("settingChanged", {
          detail: { key, value },
        }),
      )
    }
  }

  // Clear cache (useful for testing or manual refresh)
  static clearCache(): void {
    this.cache.clear()
    this.initialized = false
  }

  // Get all settings from database (bypassing cache)
  static async getSettingsFromDatabase(): Promise<AppSetting[]> {
    try {
      const { data, error } = await supabase.from("app_settings").select("*").order("setting_key")

      if (error) {
        console.error("Error fetching settings from database:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching settings from database:", error)
      return []
    }
  }
}
