"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown } from "lucide-react"
import { LUCIDE_ICON_NAMES, POPULAR_ICONS, getLucideIcon, isValidLucideIcon } from "@/lib/lucide-icons"
import { cn } from "@/lib/utils"

interface IconSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function IconSelector({ value, onChange, placeholder = "Select an icon", disabled }: IconSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const IconComponent = getLucideIcon(value)
  const isValid = isValidLucideIcon(value)

  const filteredIcons = LUCIDE_ICON_NAMES.filter((icon) => icon.toLowerCase().includes(search.toLowerCase())).slice(
    0,
    50,
  ) // Limit to 50 results for performance

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span className={cn(!value && "text-muted-foreground")}>{value || placeholder}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search icons..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>No icons found.</CommandEmpty>

              {search === "" && (
                <CommandGroup heading="Popular Icons">
                  {POPULAR_ICONS.map((iconName) => {
                    const Icon = getLucideIcon(iconName)
                    return (
                      <CommandItem
                        key={iconName}
                        value={iconName}
                        onSelect={() => {
                          onChange(iconName)
                          setOpen(false)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{iconName}</span>
                        </div>
                        <Check className={cn("ml-auto h-4 w-4", value === iconName ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}

              <CommandGroup heading={search === "" ? "All Icons" : "Search Results"}>
                {filteredIcons.map((iconName) => {
                  const Icon = getLucideIcon(iconName)
                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => {
                        onChange(iconName)
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{iconName}</span>
                      </div>
                      <Check className={cn("ml-auto h-4 w-4", value === iconName ? "opacity-100" : "opacity-0")} />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Manual input for advanced users */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or type icon name manually"
          disabled={disabled}
          className="flex-1"
        />
        {value && <Badge variant={isValid ? "default" : "destructive"}>{isValid ? "Valid" : "Invalid"}</Badge>}
      </div>
    </div>
  )
}
