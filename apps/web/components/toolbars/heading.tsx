"use client";

import { Check, ChevronDown, Heading1, Heading2, Heading3, Type } from "lucide-react";
import React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";

type HeadingLevel = 1 | 2 | 3;

const HEADING_OPTIONS: Array<{
	level: HeadingLevel | 0;
	label: string;
	shortcut: string;
	Icon: React.ComponentType<{ className?: string }>;
}> = [
	{ level: 0, label: "Text", shortcut: "⌘⌥0", Icon: Type },
	{ level: 1, label: "Heading 1", shortcut: "⌘⌥1", Icon: Heading1 },
	{ level: 2, label: "Heading 2", shortcut: "⌘⌥2", Icon: Heading2 },
	{ level: 3, label: "Heading 3", shortcut: "⌘⌥3", Icon: Heading3 },
];

const HeadingToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, children, ...props }, ref) => {
		const { editor } = useToolbar();
		const activeLevel = ([1, 2, 3] as const).find((level) =>
			editor?.isActive("heading", { level }),
		);
		const active = HEADING_OPTIONS.find(
			(option) => option.level === (activeLevel ?? 0),
		);
		const ActiveIcon = active?.Icon ?? Type;

		return (
			<DropdownMenu>
				<Tooltip>
					<TooltipTrigger asChild>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className={cn(
									"h-8 gap-1 px-2",
									Boolean(activeLevel) && "bg-accent",
									className,
								)}
								ref={ref}
								{...props}
							>
								{children || <ActiveIcon className="h-4 w-4" />}
								<ChevronDown className="h-3 w-3 opacity-50" />
							</Button>
						</DropdownMenuTrigger>
					</TooltipTrigger>
					<TooltipContent>
						<span>Turn into</span>
					</TooltipContent>
				</Tooltip>
				<DropdownMenuContent align="start" className="w-48">
					{HEADING_OPTIONS.map((option) => {
						const isActive =
							option.level === 0
								? !activeLevel
								: editor?.isActive("heading", { level: option.level });
						const Icon = option.Icon;
						return (
							<DropdownMenuItem
								key={option.label}
								className="gap-2"
								onSelect={() => {
									if (option.level === 0) {
										editor?.chain().focus().setParagraph().run();
										return;
									}
									editor
										?.chain()
										.focus()
										.toggleHeading({ level: option.level })
										.run();
								}}
							>
								<Icon className="h-4 w-4" />
								<span className="flex-1">{option.label}</span>
								{isActive ? (
									<Check className="h-3.5 w-3.5" />
								) : (
									<span className="text-[10px] tracking-wide text-muted-foreground">
										{option.shortcut}
									</span>
								)}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		);
	},
);

HeadingToolbar.displayName = "HeadingToolbar";

export { HeadingToolbar };
