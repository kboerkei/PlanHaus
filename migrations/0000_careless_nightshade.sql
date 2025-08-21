CREATE TABLE `budget_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`category` text NOT NULL,
	`item` text NOT NULL,
	`estimated_cost` text,
	`actual_cost` text,
	`is_paid` integer DEFAULT false,
	`notes` text,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`group` text,
	`role` text,
	`rsvp_status` text DEFAULT 'pending',
	`dietary_restrictions` text,
	`plus_one` integer DEFAULT false,
	`notes` text,
	`hotel_info` text,
	`added_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`priority` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` integer,
	`custom_date` integer,
	`default_timeframe` text,
	`timeframe_order` integer,
	`assigned_to` text,
	`notes` text,
	`is_completed` integer DEFAULT false NOT NULL,
	`is_from_template` integer DEFAULT false NOT NULL,
	`default_task_id` integer,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`avatar` text,
	`role` text DEFAULT 'user' NOT NULL,
	`first_name` text,
	`last_name` text,
	`has_completed_intake` integer DEFAULT false NOT NULL,
	`is_email_verified` integer DEFAULT false NOT NULL,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`email` text,
	`phone` text,
	`website` text,
	`address` text,
	`status` text DEFAULT 'researching',
	`quote` text,
	`notes` text,
	`added_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wedding_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` integer NOT NULL,
	`venue` text,
	`theme` text,
	`budget` real,
	`guest_count` integer,
	`style` text,
	`description` text,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL
);
