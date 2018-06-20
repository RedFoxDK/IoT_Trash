-- --------------------------------------------------------
-- Vært:                         130.225.170.228
-- Server-version:               5.7.22-0ubuntu0.16.04.1 - (Ubuntu)
-- ServerOS:                     Linux
-- HeidiSQL Version:             9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for IoT_Trash
CREATE DATABASE IF NOT EXISTS `IoT_Trash` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `IoT_Trash`;

-- Dumping structure for tabel IoT_Trash.Trash_api_token
CREATE TABLE IF NOT EXISTS `Trash_api_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT 'Unnamed',
  `api_token` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_activate` int(11) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel IoT_Trash.Trash_cans
CREATE TABLE IF NOT EXISTS `Trash_cans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serial_nr` varchar(255) DEFAULT NULL,
  `cans_type_id` int(11) DEFAULT NULL,
  `latitude` varchar(255) DEFAULT NULL,
  `longitude` varchar(255) DEFAULT NULL,
  `battery` int(11) DEFAULT NULL,
  `contect_weight` int(11) DEFAULT NULL,
  `full_procent` int(11) DEFAULT NULL,
  `last_hear_from` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel IoT_Trash.Trash_cans_type
CREATE TABLE IF NOT EXISTS `Trash_cans_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT 'MISSING',
  `note` longtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel IoT_Trash.Trash_cards
CREATE TABLE IF NOT EXISTS `Trash_cards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `card_nr` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `is_active` int(11) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel IoT_Trash.Trash_user
CREATE TABLE IF NOT EXISTS `Trash_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `user_type_id` int(11) DEFAULT '1',
  `sercet_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel IoT_Trash.Trash_user_type
CREATE TABLE IF NOT EXISTS `Trash_user_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT 'MISSING',
  `is_private` int(11) DEFAULT '1',
  `is_company` int(11) DEFAULT '0',
  `is_state` int(11) DEFAULT '0',
  `is_dev` int(11) DEFAULT '0',
  `is_admin` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
-- Dumping structure for tabel IoT_Trash.Trash_waste_log
CREATE TABLE IF NOT EXISTS `Trash_waste_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `can_id` int(11) DEFAULT NULL,
  `bio_detection` int(11) DEFAULT '0',
  `metal_detection` int(11) DEFAULT '0',
  `waste_amount` int(11) DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
