-- CONFIG DATABASE

CREATE TABLE IF NOT EXISTS Users (
	id	        INTEGER NOT NULL UNIQUE,
	telegram      TEXT NOT NULL UNIQUE,
	PRIMARY KEY(id AUTOINCREMENT)
);

CREATE TABLE IF NOT EXISTS Words (
	id	        INTEGER NOT NULL UNIQUE,
	word	        TEXT NOT NULL UNIQUE,
	PRIMARY KEY(id AUTOINCREMENT)
);


CREATE TABLE IF NOT EXISTS WordOwnership (
	id	        INTEGER NOT NULL UNIQUE,
	wordId        INTEGER NOT NULL,
    userId	    INTEGER NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT),
	FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE,
	FOREIGN KEY(wordId) REFERENCES Words(id) ON DELETE CASCADE
	UNIQUE(wordId, userId) ON CONFLICT IGNORE
);

CREATE TABLE IF NOT EXISTS Definitions (
	id	        INTEGER NOT NULL UNIQUE,
	wordId        INTEGER NOT NULL,
	definition	TEXT,
	PRIMARY KEY(id AUTOINCREMENT),
	FOREIGN KEY(wordId) REFERENCES Words(id)
);

CREATE TABLE IF NOT EXISTS DefinitionOwnership (
	id	        INTEGER NOT NULL UNIQUE,
	definitionId	INTEGER,
	userId	    INTEGER NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT),
	FOREIGN KEY(definitionId) REFERENCES Definitions(id) ON DELETE CASCADE
	FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
	UNIQUE(definitionId, userId) ON CONFLICT IGNORE
);

CREATE TABLE IF NOT EXISTS Tags (
	id	        INTEGER NOT NULL UNIQUE,
	tag         TEXT NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT)
);


CREATE TABLE IF NOT EXISTS TagOwnership (
	id	        INTEGER NOT NULL UNIQUE,
	tagId	    INTEGER,
	userId	    INTEGER NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT),
	FOREIGN KEY(tagId) REFERENCES Tags(id) ON DELETE CASCADE
	FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
	UNIQUE(tagId, userId) ON CONFLICT IGNORE
);


CREATE TABLE IF NOT EXISTS TagToWordRelation (
	id	        INTEGER NOT NULL UNIQUE,
	tagId	    INTEGER,
	wordId	    INTEGER NOT NULL,
	userId      INTEGER NOT NULL,
	PRIMARY KEY(id AUTOINCREMENT),
	FOREIGN KEY(tagId) REFERENCES Tags(id) ON DELETE CASCADE
	FOREIGN KEY(wordId) REFERENCES Words(id) ON DELETE CASCADE
	FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
	UNIQUE(tagId, wordId, userId) ON CONFLICT IGNORE
);

