-- Exemple d'exercice personnel pour SQL Lab : une médiathèque municipale.
-- Les dates sont au format AAAA-MM-JJ ; les clés étrangères sont déclarées (REFERENCES).
CREATE TABLE ADHERENT (
  NumAdh INTEGER PRIMARY KEY,
  NomAdh TEXT NOT NULL,
  PrenomAdh TEXT NOT NULL,
  VilleAdh TEXT,
  DateInscription DATE NOT NULL
);
CREATE TABLE LIVRE (
  CodeLivre TEXT PRIMARY KEY,
  Titre TEXT NOT NULL,
  Auteur TEXT NOT NULL,
  Genre TEXT NOT NULL
);
CREATE TABLE EMPRUNT (
  NumEmprunt INTEGER PRIMARY KEY,
  NumAdh INTEGER NOT NULL REFERENCES ADHERENT(NumAdh),
  CodeLivre TEXT NOT NULL REFERENCES LIVRE(CodeLivre),
  DateEmprunt DATE NOT NULL,
  DateRetour DATE
);
INSERT INTO ADHERENT VALUES
  (1, 'LEMOINE', 'Alice', 'Pessac', '2022-09-12'),
  (2, 'DIOP', 'Mamadou', 'Talence', '2023-01-05'),
  (3, 'GARCIA', 'Lucie', 'Pessac', '2023-03-21'),
  (4, 'NGUYEN', 'Bao', 'Bordeaux', '2023-10-02'),
  (5, 'MARTIN', 'Paul', 'Mérignac', '2024-02-14'),
  (6, 'ROUX', 'Emma', 'Bordeaux', '2024-05-30');
INSERT INTO LIVRE VALUES
  ('L001', 'Le Petit Prince', 'Saint-Exupéry', 'Roman'),
  ('L002', 'L''Étranger', 'Camus', 'Roman'),
  ('L003', 'Sapiens', 'Harari', 'Essai'),
  ('L004', 'Astérix le Gaulois', 'Goscinny', 'BD'),
  ('L005', 'La Peste', 'Camus', 'Roman'),
  ('L006', 'Persepolis', 'Satrapi', 'BD'),
  ('L007', 'Le Capital au XXIe siècle', 'Piketty', 'Essai');
INSERT INTO EMPRUNT VALUES
  (101, 1, 'L001', '2024-03-02', '2024-03-20'),
  (102, 1, 'L004', '2024-04-10', '2024-04-25'),
  (103, 2, 'L003', '2024-04-15', NULL),
  (104, 3, 'L002', '2024-05-03', '2024-05-21'),
  (105, 3, 'L005', '2024-05-22', NULL),
  (106, 4, 'L006', '2024-05-25', NULL),
  (107, 1, 'L007', '2024-06-01', NULL),
  (108, 2, 'L004', '2024-06-03', NULL);
