
-- ADD VALUES
INSERT INTO Users(id, telegram) VALUES (0, '247768455'), (1, '1234');

INSERT INTO Words (id, word) VALUES
    (1, 'word1'),
    (2, 'word2'),
    (3, 'word3'),
    (4, 'word4');

INSERT INTO WordOwnership (wordId, userId) VALUES
    (1, 0), -- me
    (2, 0),
    (1, 1), -- other user
    (3, 1),
    (4, 1);

INSERT INTO Definitions (id, wordId, definition) VALUES
    (0, 1, 'word1 def1'),
    (1, 1, 'word1 def2'),
    (2, 2, 'word2 def1'),
    (3, 2, 'word2 def2'),
    (4, 3, 'word3 def1'),
    (5, 3, 'word3 def2'),
    (6, 4, 'word4 def1'),
    (7, 4, 'word4 def2');

INSERT INTO DefinitionOwnership (definitionId, userId) VALUES
    (0, 0),
    (1, 0),
    (2, 0),
    (3, 1),
    (4, 1),
    (5, 0),
    (6, 0),
    (7, 0);

