ALTER TABLE `clients` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `clients` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_email_unique` UNIQUE(`email`);