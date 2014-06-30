-- phpMyAdmin SQL Dump
-- version 3.5.7
-- http://www.phpmyadmin.net
--
-- Client: localhost
-- Généré le: Mer 11 Juin 2014 à 19:56
-- Version du serveur: 5.5.29
-- Version de PHP: 5.4.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Base de données: `places`
--

-- --------------------------------------------------------

--
-- Structure de la table `country`
--

DROP TABLE IF EXISTS `country`;
CREATE TABLE `country` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(2) NOT NULL,
  `continent` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- Contenu de la table `country`
--

INSERT INTO `country` (`id`, `name`, `code`, `continent`) VALUES
(1, 'France', 'FR', 'Europe'),
(2, 'Ireland', 'IE', 'Europe'),
(3, 'Singapore', 'SG', 'Asia'),
(4, 'Scotland', 'ST', 'Europe');

-- --------------------------------------------------------

--
-- Structure de la table `place`
--

DROP TABLE IF EXISTS `place`;
CREATE TABLE `place` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `description` varchar(500) NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `town_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `city_id` (`town_id`),
  KEY `town_id` (`town_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- Contenu de la table `place`
--

INSERT INTO `place` (`id`, `name`, `address`, `description`, `latitude`, `longitude`, `town_id`) VALUES
(1, 'Tour Eiffel', 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', 'Badass Tower.', 48.8584, 2.29448, 1),
(2, 'ESGI', '21 rue Erard', 'YOLO school', 48.8461, 2.38548, 1),
(3, 'Temple Bar', '16 Temple Bar', 'Cool brews', 53.345176, -6.265716, 2),
(4, 'Cuba Libre', '3B River Valley Rd', 'Come lah!', 1.291023, 103.845278, 3),
(5, 'Beaugrenelle', '35 quai André Citroën', 'L\'ESGI, mais loin', 48.847339, 2.279451, 1),
(6, 'Glasgow Science Centre', '50 Pacific Quay', 'Scotish Geode', 55.858542, -4.293802, 4);

-- --------------------------------------------------------

--
-- Structure de la table `town`
--

DROP TABLE IF EXISTS `town`;
CREATE TABLE `town` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `population` int(11) DEFAULT NULL,
  `country_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `country_id` (`country_id`),
  KEY `country_id_2` (`country_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Contenu de la table `town`
--

INSERT INTO `town` (`id`, `name`, `population`, `country_id`) VALUES
(1, 'Paris', 2211000000, 1),
(2, 'Dublin', 527612, 2),
(3, 'Singapore', 5312000000, 3),
(4, 'Glasgow', 598830, 4);

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `place`
--
ALTER TABLE `place`
  ADD CONSTRAINT `place_ibfk_1` FOREIGN KEY (`town_id`) REFERENCES `town` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

--
-- Contraintes pour la table `town`
--
ALTER TABLE `town`
  ADD CONSTRAINT `town_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
