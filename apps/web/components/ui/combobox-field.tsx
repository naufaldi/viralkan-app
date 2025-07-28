"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { cn } from "@repo/ui/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  searchValue?: string;
}

interface ComboboxFieldProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  error?: boolean;
}

export const ComboboxField = React.forwardRef<
  React.ElementRef<typeof Button>,
  ComboboxFieldProps
>(
  (
    {
      options,
      value,
      onValueChange,
      placeholder = "Select option...",
      emptyMessage = "No options found.",
      searchPlaceholder = "Search...",
      disabled = false,
      loading = false,
      className,
      size = "default",
      error = false,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const selectedOption = options.find((option) => option.value === value);

    const handleSelect = (currentValue: string) => {
      if (currentValue === value) {
        onValueChange?.("");
      } else {
        onValueChange?.(currentValue);
      }
      setOpen(false);
    };

    const buttonSizeClasses = {
      sm: "h-9 px-3 text-sm",
      default: "h-10 px-4",
      lg: "h-12 px-4 text-base",
    };

    return (
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              "w-full justify-between",
              buttonSizeClasses[size],
              error &&
                "border-red-300 focus:border-red-500 focus:ring-red-500/20",
              !selectedOption && "text-muted-foreground",
              className,
            )}
            {...props}
          >
            <div className="flex items-center gap-2 truncate">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="truncate">
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.searchValue || option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

ComboboxField.displayName = "ComboboxField";
