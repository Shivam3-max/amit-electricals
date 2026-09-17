-- Hostinger Business MySQL baseline
CREATE TABLE `Dealer` (
    `id` VARCHAR(191) NOT NULL, `company` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL, `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL, `gstin` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL, `address` TEXT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `tier` ENUM('RETAILER', 'DEALER', 'PROJECT') NOT NULL DEFAULT 'RETAILER',
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    `notes` TEXT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Dealer_phone_key`(`phone`), INDEX `Dealer_status_idx`(`status`),
    INDEX `Dealer_tier_idx`(`tier`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DealerSession` (
    `id` VARCHAR(191) NOT NULL, `token` VARCHAR(191) NOT NULL,
    `dealerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `DealerSession_token_key`(`token`),
    INDEX `DealerSession_dealerId_idx`(`dealerId`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Enquiry` (
    `id` VARCHAR(191) NOT NULL, `ref` VARCHAR(191) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dealerId` VARCHAR(191) NULL, `company` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL, `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL, `gstin` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL, `site` VARCHAR(191) NULL,
    `deliverBy` VARCHAR(191) NULL, `purpose` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL, `listName` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'REVIEWING', 'QUOTED', 'CONFIRMED', 'DISPATCHED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `quotedTotal` DOUBLE NULL, `assignedTo` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Enquiry_ref_key`(`ref`), INDEX `Enquiry_status_idx`(`status`),
    INDEX `Enquiry_dealerId_idx`(`dealerId`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `EnquiryLine` (
    `id` VARCHAR(191) NOT NULL, `enquiryId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL, `variant` VARCHAR(191) NULL,
    `qty` INTEGER NOT NULL, `uom` VARCHAR(191) NOT NULL,
    `note` TEXT NULL, `unitPrice` DOUBLE NULL,
    INDEX `EnquiryLine_enquiryId_idx`(`enquiryId`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `InternalNote` (
    `id` VARCHAR(191) NOT NULL, `enquiryId` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL, `text` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `InternalNote_enquiryId_idx`(`enquiryId`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL, `ref` VARCHAR(191) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `topic` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL, `email` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL, `city` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('NEW', 'READ', 'RESPONDED', 'ARCHIVED') NOT NULL DEFAULT 'NEW',
    UNIQUE INDEX `Message_ref_key`(`ref`), INDEX `Message_status_idx`(`status`),
    INDEX `Message_topic_idx`(`topic`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AdminSession` (
    `id` VARCHAR(191) NOT NULL, `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `AdminSession_token_key`(`token`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `UploadedAsset` (
    `id` VARCHAR(191) NOT NULL, `fileName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL, `bytes` LONGBLOB NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ProductOverride` (
    `id` VARCHAR(191) NOT NULL, `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL, `description` TEXT NULL,
    `specsJson` LONGTEXT NULL, `imagesJson` LONGTEXT NULL,
    `stock` VARCHAR(191) NULL, `category` VARCHAR(191) NULL,
    `categorySlug` VARCHAR(191) NULL, `dept` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL, `isNew` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ProductOverride_code_key`(`code`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Banner` (
    `id` VARCHAR(191) NOT NULL, `slot` INTEGER NOT NULL,
    `image` VARCHAR(191) NOT NULL, `link` VARCHAR(191) NULL,
    `label` VARCHAR(191) NULL, `active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0, `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL, UNIQUE INDEX `Banner_slot_key`(`slot`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DeptBanner` (
    `id` VARCHAR(191) NOT NULL, `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL, `active` BOOLEAN NOT NULL DEFAULT true,
    UNIQUE INDEX `DeptBanner_slug_key`(`slug`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `GiftBand` (
    `id` VARCHAR(191) NOT NULL, `range` VARCHAR(191) NOT NULL,
    `note` TEXT NOT NULL, `codesJson` LONGTEXT NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    UNIQUE INDEX `GiftBand_range_key`(`range`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FaqEntry` (
    `id` VARCHAR(191) NOT NULL, `q` VARCHAR(191) NOT NULL,
    `a` TEXT NOT NULL, `order` INTEGER NOT NULL DEFAULT 0,
    UNIQUE INDEX `FaqEntry_q_key`(`q`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SiteSetting` (
    `key` VARCHAR(191) NOT NULL, `value` TEXT NOT NULL, PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `DealerSession` ADD CONSTRAINT `DealerSession_dealerId_fkey`
    FOREIGN KEY (`dealerId`) REFERENCES `Dealer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Enquiry` ADD CONSTRAINT `Enquiry_dealerId_fkey`
    FOREIGN KEY (`dealerId`) REFERENCES `Dealer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `EnquiryLine` ADD CONSTRAINT `EnquiryLine_enquiryId_fkey`
    FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `InternalNote` ADD CONSTRAINT `InternalNote_enquiryId_fkey`
    FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
