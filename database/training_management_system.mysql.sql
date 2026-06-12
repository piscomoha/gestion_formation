-- Training Management System database
-- Target: MySQL 8+ / MariaDB 10.4+
-- Import: mysql -u root -p < database/training_management_system.mysql.sql

CREATE DATABASE IF NOT EXISTS training_management_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE training_management_system;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Note;
DROP TABLE IF EXISTS Presence;
DROP TABLE IF EXISTS Affectation;
DROP TABLE IF EXISTS Stagiaire;
DROP TABLE IF EXISTS Module;
DROP TABLE IF EXISTS Formateur;
DROP TABLE IF EXISTS AnneeScolaire;
DROP TABLE IF EXISTS Groupe;
DROP TABLE IF EXISTS Filiere;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Filiere (
  idFiliere INT UNSIGNED NOT NULL AUTO_INCREMENT,
  libelle VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  PRIMARY KEY (idFiliere),
  UNIQUE KEY uq_filiere_libelle (libelle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Groupe (
  idGroupe INT UNSIGNED NOT NULL AUTO_INCREMENT,
  libelle VARCHAR(80) NOT NULL,
  effectif INT UNSIGNED NOT NULL,
  idFiliere INT UNSIGNED NOT NULL,
  PRIMARY KEY (idGroupe),
  UNIQUE KEY uq_groupe_libelle (libelle),
  KEY idx_groupe_filiere (idFiliere),
  CONSTRAINT chk_groupe_effectif CHECK (effectif > 0),
  CONSTRAINT fk_groupe_filiere
    FOREIGN KEY (idFiliere)
    REFERENCES Filiere (idFiliere)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE AnneeScolaire (
  idAnneeScolaire INT UNSIGNED NOT NULL AUTO_INCREMENT,
  libelle VARCHAR(40) NOT NULL,
  dateDebut DATE NOT NULL,
  dateFin DATE NOT NULL,
  PRIMARY KEY (idAnneeScolaire),
  UNIQUE KEY uq_annee_scolaire_libelle (libelle),
  CONSTRAINT chk_annee_scolaire_dates CHECK (dateDebut <= dateFin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Formateur (
  idFormateur INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(80) NOT NULL,
  prenom VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL,
  telephone VARCHAR(30) NOT NULL,
  PRIMARY KEY (idFormateur),
  UNIQUE KEY uq_formateur_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Module (
  idModule INT UNSIGNED NOT NULL AUTO_INCREMENT,
  libelle VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  coefficient DECIMAL(5,2) NOT NULL,
  PRIMARY KEY (idModule),
  UNIQUE KEY uq_module_libelle (libelle),
  CONSTRAINT chk_module_coefficient CHECK (coefficient > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Stagiaire (
  idStagiaire INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(80) NOT NULL,
  prenom VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL,
  telephone VARCHAR(30) NOT NULL,
  idGroupe INT UNSIGNED NOT NULL,
  PRIMARY KEY (idStagiaire),
  UNIQUE KEY uq_stagiaire_email (email),
  KEY idx_stagiaire_groupe (idGroupe),
  CONSTRAINT fk_stagiaire_groupe
    FOREIGN KEY (idGroupe)
    REFERENCES Groupe (idGroupe)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Affectation (
  idAffectation INT UNSIGNED NOT NULL AUTO_INCREMENT,
  idAnneeScolaire INT UNSIGNED NOT NULL,
  idFormateur INT UNSIGNED NOT NULL,
  idModule INT UNSIGNED NOT NULL,
  idGroupe INT UNSIGNED NOT NULL,
  PRIMARY KEY (idAffectation),
  UNIQUE KEY uq_affectation_scope (
    idAnneeScolaire,
    idFormateur,
    idModule,
    idGroupe
  ),
  KEY idx_affectation_annee (idAnneeScolaire),
  KEY idx_affectation_formateur (idFormateur),
  KEY idx_affectation_module (idModule),
  KEY idx_affectation_groupe (idGroupe),
  CONSTRAINT fk_affectation_annee
    FOREIGN KEY (idAnneeScolaire)
    REFERENCES AnneeScolaire (idAnneeScolaire)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_affectation_formateur
    FOREIGN KEY (idFormateur)
    REFERENCES Formateur (idFormateur)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_affectation_module
    FOREIGN KEY (idModule)
    REFERENCES Module (idModule)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_affectation_groupe
    FOREIGN KEY (idGroupe)
    REFERENCES Groupe (idGroupe)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Presence (
  idPresence INT UNSIGNED NOT NULL AUTO_INCREMENT,
  dateSeance DATE NOT NULL,
  statut ENUM('PRESENT', 'ABSENT', 'RETARD') NOT NULL,
  idAffectation INT UNSIGNED NOT NULL,
  idStagiaire INT UNSIGNED NOT NULL,
  PRIMARY KEY (idPresence),
  UNIQUE KEY uq_presence_session (dateSeance, idAffectation, idStagiaire),
  KEY idx_presence_affectation (idAffectation),
  KEY idx_presence_stagiaire (idStagiaire),
  CONSTRAINT fk_presence_affectation
    FOREIGN KEY (idAffectation)
    REFERENCES Affectation (idAffectation)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_presence_stagiaire
    FOREIGN KEY (idStagiaire)
    REFERENCES Stagiaire (idStagiaire)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Note (
  idNote INT UNSIGNED NOT NULL AUTO_INCREMENT,
  note DECIMAL(5,2) NOT NULL,
  dateEvaluation DATE NOT NULL,
  idAffectation INT UNSIGNED NOT NULL,
  idStagiaire INT UNSIGNED NOT NULL,
  PRIMARY KEY (idNote),
  UNIQUE KEY uq_note_evaluation (dateEvaluation, idAffectation, idStagiaire),
  KEY idx_note_affectation (idAffectation),
  KEY idx_note_stagiaire (idStagiaire),
  CONSTRAINT chk_note_range CHECK (note >= 0 AND note <= 20),
  CONSTRAINT fk_note_affectation
    FOREIGN KEY (idAffectation)
    REFERENCES Affectation (idAffectation)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_note_stagiaire
    FOREIGN KEY (idStagiaire)
    REFERENCES Stagiaire (idStagiaire)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Filiere (idFiliere, libelle, description) VALUES
  (1, 'Developpement Digital', 'Formation orientee web, mobile et cloud.'),
  (2, 'Infrastructure Digitale', 'Reseaux, systemes et administration cloud.'),
  (3, 'Gestion des Entreprises', 'Comptabilite, administration et management.');

INSERT INTO Groupe (idGroupe, libelle, effectif, idFiliere) VALUES
  (1, 'DD-101', 28, 1),
  (2, 'DD-102', 24, 1),
  (3, 'ID-201', 22, 2);

INSERT INTO AnneeScolaire (idAnneeScolaire, libelle, dateDebut, dateFin) VALUES
  (1, '2024/2025', '2024-09-02', '2025-07-15'),
  (2, '2025/2026', '2025-09-01', '2026-07-17');

INSERT INTO Formateur (idFormateur, nom, prenom, email, telephone) VALUES
  (1, 'Amrani', 'Salma', 'salma.amrani@example.com', '0611223344'),
  (2, 'Bennani', 'Youssef', 'youssef.bennani@example.com', '0622334455'),
  (3, 'El Idrissi', 'Nadia', 'nadia.idrissi@example.com', '0633445566');

INSERT INTO Module (idModule, libelle, description, coefficient) VALUES
  (1, 'React et TypeScript', 'Developpement frontend moderne.', 3.00),
  (2, 'Bases de donnees', 'Modelisation SQL et requetes.', 2.00),
  (3, 'Administration Linux', 'Services, securite et automatisation.', 2.50);

INSERT INTO Stagiaire (idStagiaire, nom, prenom, email, telephone, idGroupe) VALUES
  (1, 'Ziani', 'Imane', 'imane.ziani@example.com', '0644556677', 1),
  (2, 'Tazi', 'Omar', 'omar.tazi@example.com', '0655667788', 1),
  (3, 'Fassi', 'Lina', 'lina.fassi@example.com', '0666778899', 2);

INSERT INTO Affectation (
  idAffectation,
  idAnneeScolaire,
  idFormateur,
  idModule,
  idGroupe
) VALUES
  (1, 2, 1, 1, 1),
  (2, 2, 2, 2, 1),
  (3, 2, 3, 3, 3);

INSERT INTO Presence (
  idPresence,
  dateSeance,
  statut,
  idAffectation,
  idStagiaire
) VALUES
  (1, '2026-01-08', 'PRESENT', 1, 1),
  (2, '2026-01-08', 'RETARD', 1, 2),
  (3, '2026-01-09', 'ABSENT', 2, 3);

INSERT INTO Note (
  idNote,
  note,
  dateEvaluation,
  idAffectation,
  idStagiaire
) VALUES
  (1, 16.00, '2026-01-20', 1, 1),
  (2, 13.50, '2026-01-20', 1, 2),
  (3, 15.00, '2026-01-25', 2, 3);
