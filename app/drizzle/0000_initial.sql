CREATE TABLE `climate_declarations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`climate` text NOT NULL,
	`declared_at` text NOT NULL,
	`declared_by` text
);
--> statement-breakpoint
CREATE TABLE `declaration_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`observed_at` text NOT NULL,
	`classified` integer NOT NULL,
	`intent` text,
	`horizon` text,
	`role` text,
	`phase` text,
	`steward` text,
	`consolidation_interval_days` integer,
	FOREIGN KEY (`full_name`) REFERENCES `repositories`(`full_name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_declarations_repo_time` ON `declaration_changes` (`full_name`,`observed_at`);--> statement-breakpoint
CREATE TABLE `ecology_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`observed_at` text NOT NULL,
	`classified` integer NOT NULL,
	`intent` text,
	`horizon` text,
	`role` text,
	`phase` text,
	`steward` text,
	`consolidation_interval_days` integer,
	`file_count` integer,
	`commits_last_30d` integer,
	`commits_last_90d` integer,
	`dependency_manifests_observed` text,
	`ecosystem_dependency_count` integer,
	`density_tier` text,
	`density_description` text,
	FOREIGN KEY (`full_name`) REFERENCES `repositories`(`full_name`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_snapshots_repo_time` ON `ecology_snapshots` (`full_name`,`observed_at`);--> statement-breakpoint
CREATE TABLE `repositories` (
	`full_name` text PRIMARY KEY NOT NULL,
	`html_url` text NOT NULL,
	`default_branch` text NOT NULL,
	`pushed_at` text,
	`size_kb` integer,
	`last_observed_at` text NOT NULL
);
