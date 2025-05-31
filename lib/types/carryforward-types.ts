import { z } from "zod"

// Carryforward configuration
export const CARRYFORWARD_MODES = {
  DEFAULT: "default",
  MIRROR: "mirror",
} as const

export type CarryforwardMode = (typeof CARRYFORWARD_MODES)[keyof typeof CARRYFORWARD_MODES]

export const CarryforwardConfigSchema = z.object({
  enabled: z.boolean().default(false),
  source: z.string().optional(), // Field ID to copy from
  mode: z.nativeEnum(CARRYFORWARD_MODES).default(CARRYFORWARD_MODES.DEFAULT),
})

export interface CarryforwardConfig extends z.infer<typeof CarryforwardConfigSchema> {}
