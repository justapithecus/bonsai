CREATE TABLE `climate_proposals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`climate` text NOT NULL,
	`basis` text NOT NULL,
	`trigger_type` text NOT NULL,
	`observed_season` text,
	`observation` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`proposed_at` text NOT NULL,
	`responded_at` text,
	`steward_id` integer
);
